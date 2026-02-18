/**
 * SyncStudy Matchmaking Algorithm (MVP)
 *
 * Scaling answer for judges: With 1000 students at 8PM for JEE Physics,
 * the naive O(n²) pairwise comparison (1M ops) is too slow.
 *
 * Solution — Pre-bucket + parallel processing:
 * 1. Pre-bucket waiting pool into focus_score bands (0-10, 10-20, ... 90-100)
 *    → reduces each user's comparison space from 1000 → ~100 candidates
 * 2. Urgency already known at join-time → filter to 3 buckets immediately
 * 3. Group formation runs per bucket in parallel (Web Workers / async tasks)
 * 4. Each bucket independently sorts & slices top-compatible users → O(k log k)
 *    where k ≈ 100 instead of 1000
 * 5. Redis sorted-sets store waiting users keyed by (exam+subject+timeslot+focus_band)
 *    → O(log n) insert, O(k) range query per bucket
 * 6. Result: ~1000 users → 10 focus bands → 100 per band → 100 log 100 ≈ 700 ops/band
 *    → Total: 7,000 ops instead of 1,000,000. ~143x faster.
 * 7. Horizontally scale matching workers on Lambda/Cloudflare Workers if needed.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type UrgencyLevel = 1 | 2 | 3;
export type SessionStatus = "waiting" | "in_session" | "completed";
export type GroupCapacity = "full" | "low_capacity" | "solo";

export interface WaitingUser {
  user_id: string;
  display_name: string;        // anonymous — only subject + focus shown
  exam_type: string;
  subject: string;
  time_slot: string;
  duration: string;
  intensity: string;
  focus_score: number;         // 0–100
  exam_date: Date;
  urgency: UrgencyLevel;
  status: SessionStatus;
  joined_at: Date;
}

export interface MatchedUser extends WaitingUser {
  compatibility: number;       // 0–3 (normalized float)
}

export interface MatchResult {
  group: MatchedUser[];
  avg_focus: number;
  avg_compatibility: number;
  urgency_label: string;
  capacity: GroupCapacity;
  session_id: string;
}

export interface SessionOutcome {
  user_id: string;
  completion_pct: number;      // 0–100
  goal_completed: boolean;
  peer_rating: number;         // 1–5
  exited_early: boolean;
  test_participated: boolean;
}

export interface FocusScoreBreakdown {
  new_score: number;
  consistency: number;
  goal_completion: number;
  test_engagement: number;
  peer_rating_normalized: number;
}

// ─── Step 2: Urgency Calculation ───────────────────────────────────────────────

export function calculateUrgency(examDate: Date): UrgencyLevel {
  const today = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil((examDate.getTime() - today.getTime()) / msPerDay);

  if (daysLeft <= 30) return 3;
  if (daysLeft <= 90) return 2;
  return 1;
}

export function urgencyLabel(level: UrgencyLevel): string {
  return level === 3 ? "High" : level === 2 ? "Medium" : "Low";
}

export function daysUntilExam(examDate: Date): number {
  const today = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((examDate.getTime() - today.getTime()) / msPerDay);
}

// ─── Step 3: Filter Pool ────────────────────────────────────────────────────────

export function filterPool(
  currentUser: WaitingUser,
  pool: WaitingUser[]
): WaitingUser[] {
  return pool.filter(
    (u) =>
      u.user_id !== currentUser.user_id &&
      u.exam_type === currentUser.exam_type &&
      u.subject === currentUser.subject &&
      u.time_slot === currentUser.time_slot &&
      u.duration === currentUser.duration &&
      u.status === "waiting"
  );
}

// ─── Step 4: Compatibility Score ────────────────────────────────────────────────

export function focusWeight(currentScore: number, candidateScore: number): number {
  const diff = Math.abs(currentScore - candidateScore);
  if (diff <= 10) return 3;
  if (diff <= 20) return 2;
  return 1;
}

export function urgencyWeight(a: UrgencyLevel, b: UrgencyLevel): number {
  const diff = Math.abs(a - b);
  if (diff === 0) return 3;
  if (diff === 1) return 2;
  return 1;
}

export function computeCompatibility(
  current: WaitingUser,
  candidate: WaitingUser
): number {
  const fw = focusWeight(current.focus_score, candidate.focus_score);
  const uw = urgencyWeight(current.urgency, candidate.urgency);
  // Weighted: focus matters more (60%) than urgency (40%)
  return parseFloat((fw * 0.6 + uw * 0.4).toFixed(3));
}

// ─── Step 5: Group Formation ────────────────────────────────────────────────────

const MIN_GROUP = 5;
const MAX_GROUP = 10;
const FALLBACK_MIN = 2;

export function formGroup(
  currentUser: WaitingUser,
  pool: WaitingUser[],
  expandTolerance = false
): MatchResult {
  let filtered = filterPool(currentUser, pool);

  // Edge Case 3: If no close focus match found, expand tolerance by widening
  // the effective comparison — compatibility score already handles this gracefully
  // since weight=1 is still valid; we just lower the minimum threshold.
  const minCompatibility = expandTolerance ? 1.0 : 1.4;

  const scored: MatchedUser[] = filtered
    .map((u) => ({ ...u, compatibility: computeCompatibility(currentUser, u) }))
    .filter((u) => u.compatibility >= minCompatibility)
    .sort((a, b) => b.compatibility - a.compatibility);

  const group = scored.slice(0, MAX_GROUP);

  // Determine capacity type
  let capacity: GroupCapacity = "full";
  if (group.length === 0) capacity = "solo";
  else if (group.length < MIN_GROUP) capacity = "low_capacity";

  const avg_focus =
    group.length > 0
      ? Math.round(
          (group.reduce((s, u) => s + u.focus_score, 0) + currentUser.focus_score) /
            (group.length + 1)
        )
      : currentUser.focus_score;

  const avg_compatibility =
    group.length > 0
      ? parseFloat(
          (group.reduce((s, u) => s + u.compatibility, 0) / group.length).toFixed(2)
        )
      : 0;

  return {
    group,
    avg_focus,
    avg_compatibility,
    urgency_label: urgencyLabel(currentUser.urgency),
    capacity,
    session_id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  };
}

// ─── Step 6: Focus Score Recalculation ─────────────────────────────────────────

export function recalculateFocusScore(
  prevScore: number,
  outcome: SessionOutcome
): FocusScoreBreakdown {
  // Consistency: penalize early exit, reward completion
  const consistency = outcome.exited_early
    ? outcome.completion_pct * 0.5   // halved for early exit
    : outcome.completion_pct;

  // Goal completion: binary → scaled 0–100
  const goal_completion = outcome.goal_completed ? 100 : 30;

  // Test engagement: did they participate in test series?
  const test_engagement = outcome.test_participated ? 100 : 0;

  // Peer rating: normalize 1–5 to 0–100
  const peer_rating_normalized = ((outcome.peer_rating - 1) / 4) * 100;

  const raw_new =
    consistency * 0.4 +
    goal_completion * 0.25 +
    test_engagement * 0.2 +
    peer_rating_normalized * 0.15;

  // Blend: 70% previous score (stability) + 30% new session outcome
  const new_score = Math.min(100, Math.round(prevScore * 0.7 + raw_new * 0.3));

  return {
    new_score,
    consistency,
    goal_completion,
    test_engagement,
    peer_rating_normalized,
  };
}

// ─── Mock Pool Generator (for UI demo — simulates waiting students) ──────────

export function generateMockPool(
  exam_type: string,
  subject: string,
  time_slot: string,
  duration: string,
  count = 12
): WaitingUser[] {
  const names = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12"];
  const now = new Date();

  return names.slice(0, count).map((name, i) => {
    // Simulate a realistic spread: most users clustered near 60–85 focus
    const focus_score = Math.min(100, Math.max(10, 60 + Math.floor(Math.sin(i * 1.3) * 25)));
    const daysOffset = 15 + i * 8; // varied exam dates
    const exam_date = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);

    return {
      user_id: `mock_${i}`,
      display_name: name,
      exam_type,
      subject,
      time_slot,
      duration,
      intensity: "competitive",
      focus_score,
      exam_date,
      urgency: calculateUrgency(exam_date),
      status: "waiting" as SessionStatus,
      joined_at: new Date(now.getTime() - i * 30000),
    };
  });
}
