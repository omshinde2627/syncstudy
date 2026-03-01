/**
 * useMatchmaking — Real matchmaking via edge function + Supabase Realtime
 *
 * Flow:
 * 1. Generate or retrieve anonymous user_id from localStorage
 * 2. Insert current user into waiting_pool
 * 3. Call run-matchmaking edge function (server-side grouping)
 * 4. Subscribe to active_sessions realtime — detect when THIS user_id appears
 * 5. Poll every 3s as fallback if realtime misses an event
 * 6. When found → return session so UI can navigate to /study-room
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Get user ID (authenticated or anonymous fallback) ─────────────────────────

export function getOrCreateUserId(): string {
  const key = "syncstudy_user_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ActiveSessionRow {
  session_id: string;
  exam_type: string;
  subject: string;
  duration: string;
  intensity: string;
  avg_focus: number;
  avg_compatibility: number;
  urgency_label: string;
  capacity: string;
  participant_user_ids: string[];
  ends_at: string | null;
  created_at: string;
}

export interface UseMatchmakingParams {
  exam_type: string;
  subject: string;
  duration: string;
  intensity: string;
  focus_score: number;
  exam_date: Date;
  enabled: boolean;
  user_id?: string;
  display_name?: string;
}

export interface UseMatchmakingResult {
  matching: boolean;
  activeSession: ActiveSessionRow | null;
  poolSize: number;
  error: string | null;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useMatchmaking({
  exam_type,
  subject,
  duration,
  intensity,
  focus_score,
  exam_date,
  enabled,
  user_id,
  display_name,
}: UseMatchmakingParams): UseMatchmakingResult {
  const userId = useRef(user_id || getOrCreateUserId());
  const poolEntryId = useRef<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningRef = useRef(false);

  const [matching, setMatching] = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveSessionRow | null>(null);
  const [poolSize, setPoolSize] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Check active_sessions for a row that contains this user_id
  const checkForSession = useCallback(async (): Promise<ActiveSessionRow | null> => {
    const { data, error: err } = await supabase
      .from("active_sessions")
      .select("*")
      .eq("exam_type", exam_type)
      .eq("subject", subject)
      .contains("participant_user_ids", [userId.current])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (err) {
      console.error("checkForSession error:", err.message);
      return null;
    }
    return data as ActiveSessionRow | null;
  }, [exam_type, subject]);

  // Call edge function to attempt grouping
  const runMatchmaking = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const anonKey = (supabase as any).supabaseKey as string;

      const res = await supabase.functions.invoke("run-matchmaking", {
        body: {
          user_id: userId.current,
          exam_type,
          subject,
          duration,
          focus_score,
        },
      });

      if (res.error) {
        console.error("Edge fn error:", res.error);
        setError(res.error.message);
        return;
      }

      const result = res.data as { session_id?: string; waiting?: boolean; pool_size?: number; group_size?: number };

      if (result.pool_size !== undefined) {
        setPoolSize(result.pool_size);
      }

      if (result.session_id) {
        // Session created — fetch the full row
        const found = await checkForSession();
        if (found) {
          setActiveSession(found);
          setMatching(false);
        }
      }
    } catch (e) {
      console.error("runMatchmaking caught:", e);
    } finally {
      runningRef.current = false;
    }
  }, [exam_type, subject, duration, focus_score, checkForSession]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setMatching(true);
    setActiveSession(null);
    setError(null);
    setPoolSize(0);
    runningRef.current = false;

    // Step 1 — Insert into waiting_pool
    const bootstrap = async () => {
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysLeft = Math.ceil((exam_date.getTime() - Date.now()) / msPerDay);
      const urgency = daysLeft <= 30 ? 3 : daysLeft <= 90 ? 2 : 1;

      // Delete ALL old entries for this user to prevent duplicates
      await supabase.from("waiting_pool").delete().eq("user_id", userId.current);

      // Small delay to ensure delete completes before insert
      await new Promise(r => setTimeout(r, 300));

      const { data, error: insertErr } = await supabase
        .from("waiting_pool")
        .insert({
          user_id: userId.current,
          display_name: display_name || "Student",
          exam_type,
          subject,
          time_slot: "20:00",
          duration,
          intensity,
          focus_score,
          exam_date: exam_date.toISOString().split("T")[0],
          urgency,
          status: "waiting",
        })
        .select("id")
        .single();

      if (insertErr) {
        console.error("Insert waiting_pool error:", insertErr.message);
      } else if (data) {
        poolEntryId.current = data.id;
      }

      if (cancelled) return;

      // Check if already in a session (rejoining)
      const existing = await checkForSession();
      if (existing) {
        setActiveSession(existing);
        setMatching(false);
        return;
      }

      // First matchmaking attempt
      await runMatchmaking();
    };

    bootstrap();

    // Step 2 — Realtime subscription on active_sessions
    const channel = supabase
      .channel(`active_sessions:${exam_type}:${subject}:${userId.current}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "active_sessions",
          filter: `exam_type=eq.${exam_type}`,
        },
        async (payload) => {
          if (cancelled) return;
          const row = payload.new as ActiveSessionRow;
          // Check if this user is in the new session
          if (row.participant_user_ids?.includes(userId.current)) {
            setActiveSession(row);
            setMatching(false);
          } else {
            // Someone else got matched — trigger our own matchmaking attempt
            await runMatchmaking();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "waiting_pool",
          filter: `exam_type=eq.${exam_type}`,
        },
        async (payload) => {
          if (cancelled) return;
          const row = payload.new as any;
          if (row.subject === subject && row.duration === duration && row.user_id !== userId.current) {
            // New peer joined — try to form a group
            setPoolSize((prev) => prev + 1);
            await runMatchmaking();
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime channel status:", status);
      });

    channelRef.current = channel;

    // Step 3 — Polling fallback every 4s
    pollRef.current = setInterval(async () => {
      if (cancelled) return;

      // Check pool size
      const { count } = await supabase
        .from("waiting_pool")
        .select("id", { count: "exact", head: true })
        .eq("exam_type", exam_type)
        .eq("subject", subject)
        .eq("duration", duration)
        .eq("status", "waiting");

      if (count !== null) setPoolSize(count);

      // Check if we're now in a session
      const found = await checkForSession();
      if (found) {
        setActiveSession(found);
        setMatching(false);
        return;
      }

      // Try matching again
      await runMatchmaking();
    }, 4000);

    return () => {
      cancelled = true;
      runningRef.current = false;

      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }

      // Remove from waiting_pool
      if (poolEntryId.current) {
        supabase
          .from("waiting_pool")
          .delete()
          .eq("id", poolEntryId.current)
          .then(() => { poolEntryId.current = null; });
      }

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, exam_type, subject, duration, intensity, focus_score, exam_date, checkForSession, runMatchmaking]);

  return { matching, activeSession, poolSize, error };
}

// ─── Legacy persistSession (kept for compatibility) ────────────────────────────

export async function persistSession(): Promise<void> {
  // No-op: session is now created server-side by the edge function
}
