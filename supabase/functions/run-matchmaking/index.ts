/**
 * run-matchmaking edge function
 *
 * Called by each client after joining the waiting_pool.
 * Atomically groups compatible users and creates an active_session.
 *
 * Two users are compatible when:
 *  - Same exam_type, subject, duration
 *  - Both status = 'waiting'
 *  - Focus score within ±20
 *
 * Returns: { session_id } if a group was created, or { waiting: true } if still scanning.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchRequest {
  user_id: string;
  exam_type: string;
  subject: string;
  duration: string;
  focus_score: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: MatchRequest = await req.json();
    const { user_id, exam_type, subject, duration, focus_score } = body;

    if (!user_id || !exam_type || !subject || !duration) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Check if this user is already in an active session
    const { data: existingSession } = await supabase
      .from("active_sessions")
      .select("session_id")
      .contains("participant_user_ids", [user_id])
      .eq("exam_type", exam_type)
      .eq("subject", subject)
      .maybeSingle();

    if (existingSession) {
      return new Response(
        JSON.stringify({ session_id: existingSession.session_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Fetch all waiting users for same exam+subject+duration
    const { data: pool, error: poolErr } = await supabase
      .from("waiting_pool")
      .select("*")
      .eq("exam_type", exam_type)
      .eq("subject", subject)
      .eq("duration", duration)
      .eq("status", "waiting")
      .order("joined_at", { ascending: true });

    if (poolErr) throw poolErr;
    if (!pool || pool.length < 2) {
      return new Response(JSON.stringify({ waiting: true, pool_size: pool?.length ?? 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Score and sort by compatibility with current user
    const scored = pool
      .filter((u) => u.user_id !== user_id)
      .map((u) => {
        const focusDiff = Math.abs((u.focus_score ?? 50) - focus_score);
        const focusW = focusDiff <= 10 ? 3 : focusDiff <= 20 ? 2 : 1;
        const urgencyDiff = Math.abs((u.urgency ?? 1) - 2); // mid-point ref
        const urgencyW = urgencyDiff === 0 ? 3 : urgencyDiff === 1 ? 2 : 1;
        const compatibility = focusW * 0.6 + urgencyW * 0.4;
        return { ...u, compatibility };
      })
      .filter((u) => u.compatibility >= 1.0)
      .sort((a, b) => b.compatibility - a.compatibility);

    // Need at least 1 other person (allow micro-groups)
    if (scored.length === 0) {
      return new Response(JSON.stringify({ waiting: true, pool_size: pool.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Take up to 9 best matches + current user = max 10
    const groupMembers = [
      pool.find((u) => u.user_id === user_id)!,
      ...scored.slice(0, 9),
    ].filter(Boolean);

    const participantIds = groupMembers.map((u) => u.user_id);
    const avgFocus = Math.round(
      groupMembers.reduce((s, u) => s + (u.focus_score ?? 50), 0) / groupMembers.length,
    );
    const avgCompatibility = scored.length > 0
      ? scored.slice(0, 9).reduce((s, u) => s + u.compatibility, 0) / Math.min(scored.length, 9)
      : 0;

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Determine duration in minutes for ends_at
    const durationMap: Record<string, number> = {
      "25 min (Pomodoro)": 25,
      "45 min": 45,
      "1 hour": 60,
      "1.5 hours": 90,
      "2 hours": 120,
    };
    const durationMinutes = durationMap[duration] ?? 60;
    const endsAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

    // Find the intensity from the initiating user
    const initiatorRow = pool.find((u) => u.user_id === user_id);
    const intensity = initiatorRow?.intensity ?? "competitive";
    const urgencyLabel =
      (initiatorRow?.urgency ?? 1) === 3 ? "High" : (initiatorRow?.urgency ?? 1) === 2 ? "Medium" : "Low";

    // 4. Create the active session
    const { error: insertErr } = await supabase.from("active_sessions").insert({
      session_id: sessionId,
      exam_type,
      subject,
      duration,
      intensity,
      avg_focus: avgFocus,
      avg_compatibility: avgCompatibility,
      urgency_label: urgencyLabel,
      capacity: groupMembers.length >= 5 ? "full" : "low_capacity",
      participant_user_ids: participantIds,
      ends_at: endsAt,
    });

    if (insertErr) throw insertErr;

    // 5. Mark all participants as in_session in waiting_pool
    await supabase
      .from("waiting_pool")
      .update({ status: "in_session" })
      .in("user_id", participantIds);

    return new Response(
      JSON.stringify({ session_id: sessionId, group_size: groupMembers.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("Matchmaking error:", errorMsg);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
