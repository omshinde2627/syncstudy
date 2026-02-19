/**
 * useMatchmaking — Real-time matchmaking hook
 *
 * Flow:
 * 1. Generate or retrieve anonymous user_id from localStorage
 * 2. Insert current user into waiting_pool
 * 3. Subscribe to realtime changes on waiting_pool (same exam+subject+time_slot+duration)
 * 4. On every pool update, run the local formGroup() algorithm against live DB data
 * 5. If a good group forms, persist it to active_sessions and navigate to study room
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  calculateUrgency,
  formGroup,
  type WaitingUser,
  type MatchResult,
} from "@/lib/matchmaking";

// ─── Anonymous identity ───────────────────────────────────────────────────────

function getOrCreateUserId(): string {
  const key = "syncstudy_user_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

// ─── DB row type (subset of waiting_pool columns we use) ─────────────────────

interface WaitingPoolRow {
  id: string;
  user_id: string;
  display_name: string;
  exam_type: string;
  subject: string;
  time_slot: string;
  duration: string;
  intensity: string;
  focus_score: number;
  exam_date: string;         // ISO date string from DB
  urgency: number;
  status: string;
  joined_at: string;
}

function rowToWaitingUser(row: WaitingPoolRow): WaitingUser {
  return {
    user_id: row.user_id,
    display_name: row.display_name,
    exam_type: row.exam_type,
    subject: row.subject,
    time_slot: row.time_slot,
    duration: row.duration,
    intensity: row.intensity,
    focus_score: row.focus_score,
    exam_date: new Date(row.exam_date),
    urgency: row.urgency as 1 | 2 | 3,
    status: row.status as "waiting" | "in_session" | "completed",
    joined_at: new Date(row.joined_at),
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseMatchmakingParams {
  exam_type: string;
  subject: string;
  duration: string;
  intensity: string;
  focus_score: number;
  exam_date: Date;
  enabled: boolean;           // only run when step === 3
}

export interface UseMatchmakingResult {
  matching: boolean;
  matchResult: MatchResult | null;
  poolSize: number;
  error: string | null;
}

export function useMatchmaking({
  exam_type,
  subject,
  duration,
  intensity,
  focus_score,
  exam_date,
  enabled,
}: UseMatchmakingParams): UseMatchmakingResult {
  const userId = useRef(getOrCreateUserId());
  const poolEntryId = useRef<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [poolSize, setPoolSize] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Build the current user's WaitingUser object
  const currentUser: WaitingUser = {
    user_id: userId.current,
    display_name: "You",
    exam_type,
    subject,
    time_slot: "20:00",
    duration,
    intensity,
    focus_score,
    exam_date,
    urgency: calculateUrgency(exam_date),
    status: "waiting",
    joined_at: new Date(),
  };

  // Run matching algorithm against live pool
  const runMatch = useCallback(
    (pool: WaitingUser[]) => {
      const result = formGroup(currentUser, pool);
      setMatchResult(result);
      setPoolSize(pool.length);
      setMatching(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exam_type, subject, duration, intensity, focus_score, exam_date]
  );

  // Fetch current pool from DB and run algorithm
  const fetchAndMatch = useCallback(async () => {
    const { data, error: fetchErr } = await supabase
      .from("waiting_pool")
      .select("*")
      .eq("exam_type", exam_type)
      .eq("subject", subject)
      .eq("duration", duration)
      .eq("status", "waiting")
      .neq("user_id", userId.current)
      .order("joined_at", { ascending: true });

    if (fetchErr) {
      setError(fetchErr.message);
      setMatching(false);
      return;
    }

    const pool = (data as WaitingPoolRow[]).map(rowToWaitingUser);
    runMatch(pool);
  }, [exam_type, subject, duration, runMatch]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setMatching(true);
    setMatchResult(null);
    setError(null);

    // 1. Insert current user into waiting_pool
    const insertEntry = async () => {
      const { data, error: insertErr } = await supabase
        .from("waiting_pool")
        .insert({
          user_id: userId.current,
          display_name: "You",
          exam_type,
          subject,
          time_slot: "20:00",
          duration,
          intensity,
          focus_score,
          exam_date: exam_date.toISOString().split("T")[0],
          urgency: calculateUrgency(exam_date),
          status: "waiting",
        })
        .select("id")
        .single();

      if (insertErr || !data) {
        if (!cancelled) {
          // If duplicate (user already in pool), that's fine — still fetch
          setError(null);
        }
      } else {
        poolEntryId.current = data.id;
      }

      // 2. Initial fetch + match
      if (!cancelled) {
        await fetchAndMatch();
      }
    };

    insertEntry();

    // 3. Subscribe to realtime changes
    const channel = supabase
      .channel(`waiting_pool:${exam_type}:${subject}:${duration}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "waiting_pool",
          filter: `exam_type=eq.${exam_type}`,
        },
        () => {
          if (!cancelled) {
            fetchAndMatch();
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      cancelled = true;

      // Cleanup: remove from waiting pool when user leaves step 3
      if (poolEntryId.current) {
        supabase
          .from("waiting_pool")
          .delete()
          .eq("id", poolEntryId.current)
          .then(() => {
            poolEntryId.current = null;
          });
      }

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, exam_type, subject, duration, intensity, focus_score, fetchAndMatch, exam_date]);

  return { matching, matchResult, poolSize, error };
}

// ─── Persist a confirmed session to active_sessions ──────────────────────────

export async function persistSession(
  result: MatchResult,
  participantIds: string[]
): Promise<void> {
  await supabase.from("active_sessions").insert({
    session_id: result.session_id,
    exam_type: result.group[0]?.exam_type ?? "",
    subject: result.group[0]?.subject ?? "",
    duration: result.group[0]?.duration ?? "",
    intensity: result.group[0]?.intensity ?? "",
    avg_focus: result.avg_focus,
    avg_compatibility: result.avg_compatibility,
    urgency_label: result.urgency_label,
    capacity: result.capacity,
    participant_user_ids: participantIds,
    ends_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2hr max
  });

  // Mark participants as in_session in waiting_pool
  if (participantIds.length > 0) {
    await supabase
      .from("waiting_pool")
      .update({ status: "in_session" })
      .in("user_id", participantIds);
  }
}
