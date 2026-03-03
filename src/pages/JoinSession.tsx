import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Brain, Users, Zap, CalendarDays, Loader2, AlertTriangle, UserCheck, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import {
  calculateUrgency,
  urgencyLabel,
  daysUntilExam,
} from "@/lib/matchmaking";
import { useMatchmaking, type ActiveSessionRow } from "@/hooks/useMatchmaking";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// ─── Config ──────────────────────────────────────────────────────────────────

const exams = ["JEE Main", "JEE Advanced", "NEET", "Board Exams (CBSE)", "Board Exams (ICSE)", "College Semester", "GATE", "CAT"];
const subjects = ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "English", "Economics"];
const durations = ["25 min (Pomodoro)", "45 min", "1 hour", "1.5 hours", "2 hours"];
const intensities = [
  { id: "casual", label: "Casual", desc: "Relaxed pace. Good for revision.", color: "border-accent" },
  { id: "competitive", label: "Competitive", desc: "Timed goals. Peer tracking on.", color: "border-primary" },
  { id: "strict", label: "Strict", desc: "Locked session. Exit penalties.", color: "border-destructive" },
];

// ─── Urgency badge colours ────────────────────────────────────────────────────

const urgencyColors: Record<string, string> = {
  High: "text-destructive",
  Medium: "text-warning",
  Low: "text-primary",
};

// ─── Current user focus score from profile ────────────────────────────────────

// ─── Capacity messaging ──────────────────────────────────────────────────────

function capacityMessage(session: ActiveSessionRow) {
  if (session.capacity === "solo") {
    return {
      icon: <AlertTriangle className="h-4 w-4 text-warning" />,
      text: "No peers found right now. You'll enter Solo Structured Mode.",
      color: "border-warning/30 bg-warning/5",
    };
  }
  if (session.capacity === "low_capacity") {
    return {
      icon: <Users className="h-4 w-4 text-accent" />,
      text: `Small group matched. ${session.participant_user_ids.length} students ready.`,
      color: "border-accent/30 bg-accent/5",
    };
  }
  return {
    icon: <UserCheck className="h-4 w-4 text-primary" />,
    text: `Full batch matched — ${session.participant_user_ids.length} students locked in.`,
    color: "border-primary/20 bg-primary/5",
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

const JoinSession = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [profileName, setProfileName] = useState("Student");
  const [userFocusScore, setUserFocusScore] = useState(50);

  // Fetch profile display name and focus score
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setProfileName(data.display_name);
      });
    // Fetch focus_score separately (may not be in generated types yet)
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data && 'focus_score' in data) setUserFocusScore((data as any).focus_score ?? 50);
      });
  }, [user]);

  // Step 1 state
  const [exam, setExam] = useState("");
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");

  // Step 2 state
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("");

  const canProceed =
    step === 1 ? !!(exam && subject && examDate) :
    step === 2 ? !!(duration && intensity) :
    true;

  // ── Real matchmaking via Supabase ──────────────────────────────────────────
  const examDateObj = examDate ? new Date(examDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const { matching, activeSession, poolSize, error } = useMatchmaking({
    exam_type: exam,
    subject,
    duration,
    intensity,
    focus_score: userFocusScore,
    exam_date: examDateObj,
    enabled: step === 3 && !!(exam && subject && duration && intensity && examDate),
    user_id: user?.id,
    display_name: profileName,
  });

  // Auto-navigate when a real session is found
  useEffect(() => {
    if (activeSession) {
      navigate("/study-room", {
        state: { activeSession, exam, subject, duration, intensity },
      });
    }
  }, [activeSession, navigate, exam, subject, duration, intensity]);

  // Computed urgency display
  const urgency = examDate ? calculateUrgency(new Date(examDate)) : null;
  const days = examDate ? daysUntilExam(new Date(examDate)) : null;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full">

        {/* Progress stepper */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  s <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 transition-all ${s < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
          <span className="ml-2 text-xs text-muted-foreground">
            {step === 1 ? "Academic Focus" : step === 2 ? "Session Settings" : "Finding Match…"}
          </span>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 1 ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-display font-bold mb-2">Select Your Focus</h2>
              <p className="text-muted-foreground mb-8">Choose exam, subject, and exam date for precise matching.</p>

              <div className="space-y-6">
                {/* Exam */}
                <div>
                  <label className="text-sm text-muted-foreground mb-3 block">Exam</label>
                  <div className="grid grid-cols-2 gap-3">
                    {exams.map((e) => (
                      <button
                        key={e}
                        onClick={() => setExam(e)}
                        className={`p-3 rounded-lg border text-sm text-left transition-all ${
                          exam === e
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-border hover:bg-secondary"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-sm text-muted-foreground mb-3 block">Subject</label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSubject(s)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                          subject === s
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-card text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exam Date */}
                <div>
                  <label className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5" /> Exam Date
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full md:w-64 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                  {urgency && days !== null && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-2 text-xs font-medium ${urgencyColors[urgencyLabel(urgency)]}`}
                    >
                      {days} days until exam · Urgency:{" "}
                      <span className="uppercase tracking-wide">{urgencyLabel(urgency)}</span>
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-display font-bold mb-2">Session Settings</h2>
              <p className="text-muted-foreground mb-8">Duration and intensity level.</p>

              <div className="space-y-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-3 block">Duration</label>
                  <div className="flex flex-wrap gap-2">
                    {durations.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                          duration === d
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-card text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-3 block">Intensity</label>
                  <div className="grid gap-3">
                    {intensities.map((int) => (
                      <button
                        key={int.id}
                        onClick={() => setIntensity(int.id)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          intensity === int.id
                            ? `${int.color} bg-primary/5`
                            : "border-border bg-card hover:bg-secondary"
                        }`}
                      >
                        <div className="font-medium text-sm">{int.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{int.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3 — Live Matchmaking ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-display font-bold">Finding Your Squad</h2>
                <div className="flex items-center gap-1.5 ml-auto px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <Wifi className="h-3 w-3 text-primary animate-pulse" />
                  <span className="text-xs text-primary font-medium">Live · {poolSize} waiting</span>
                </div>
              </div>
              <p className="text-muted-foreground mb-8">
                You're in the waiting pool for <strong className="text-foreground">{exam} · {subject}</strong>.
                The engine will auto-match you when enough peers join.
              </p>

              {/* Error state */}
              {error && (
                <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 mb-4 text-sm text-destructive">
                  ⚠ Connection error: {error}
                </div>
              )}

              {/* Waiting / scanning state */}
              {matching && !activeSession && (
                <motion.div
                  className="p-10 rounded-xl border border-border/50 bg-card flex flex-col items-center gap-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
                      <Loader2 className="h-7 w-7 text-primary animate-spin" />
                    </div>
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-card animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="font-display font-semibold text-foreground mb-1">Scanning the pool…</p>
                    <p className="text-sm text-muted-foreground">
                      {poolSize <= 1
                        ? "You're the first one here. Waiting for peers to join…"
                        : `${poolSize} students waiting — running compatibility algorithm…`}
                    </p>
                  </div>

                  {/* Session details summary */}
                  <div className="w-full grid grid-cols-2 gap-2 text-sm">
                    {[
                      { label: "Exam", value: exam },
                      { label: "Subject", value: subject },
                      { label: "Duration", value: duration },
                      { label: "Mode", value: intensity.charAt(0).toUpperCase() + intensity.slice(1) },
                      { label: "Days to Exam", value: `${days} days` },
                      { label: "Urgency", value: urgency ? urgencyLabel(urgency) : "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-2.5 rounded-lg bg-secondary">
                        <div className="text-xs text-muted-foreground">{label}</div>
                        <div className="font-medium mt-0.5 text-foreground">{value}</div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    This page will automatically take you to the room when a match is found.
                    Open this page in another tab or device to test matching!
                  </p>
                </motion.div>
              )}

              {/* Match found! */}
              {activeSession && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="p-6 rounded-xl border border-primary/20 bg-card space-y-5">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-primary" />
                      <span className="font-display font-semibold">Match Found!</span>
                      <span className="ml-auto text-xs text-muted-foreground font-mono">
                        id: {activeSession.session_id.slice(-6)}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 rounded-lg bg-secondary">
                        <div className="text-2xl font-display font-bold text-primary">
                          {activeSession.participant_user_ids.length}
                        </div>
                        <div className="text-xs text-muted-foreground">Students</div>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary">
                        <div className="text-2xl font-display font-bold text-accent">
                          {activeSession.avg_focus}
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Focus</div>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary">
                        <div className={`text-2xl font-display font-bold ${urgencyColors[activeSession.urgency_label] ?? "text-foreground"}`}>
                          {activeSession.urgency_label}
                        </div>
                        <div className="text-xs text-muted-foreground">Urgency</div>
                      </div>
                    </div>

                    {/* Compatibility bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-muted-foreground">Avg Compatibility</span>
                        <span className="text-xs font-medium text-primary">
                          {Number(activeSession.avg_compatibility).toFixed(2)} / 3.00
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${(Number(activeSession.avg_compatibility) / 3) * 100}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Anonymous avatars */}
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Matched Peers ({activeSession.participant_user_ids.length} students, anonymous)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {activeSession.participant_user_ids.map((uid, i) => (
                          <div
                            key={i}
                            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                            style={{
                              background: `linear-gradient(135deg, hsl(${250 + i * 20}, 70%, 55%), hsl(${210 + i * 20}, 80%, 50%))`,
                            }}
                            title={`Student ${i + 1}`}
                          >
                            {String.fromCharCode(65 + (i % 26))}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Capacity banner */}
                    {(() => {
                      const msg = capacityMessage(activeSession);
                      return (
                        <div className={`flex items-center gap-3 p-3 rounded-lg border ${msg.color}`}>
                          {msg.icon}
                          <span className="text-sm">{msg.text}</span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="text-center text-xs text-muted-foreground">
                    Redirecting you to the study room automatically…
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        {/* Navigation */}
        <div className={`flex mt-8 ${step === 1 ? "justify-end" : "justify-between"}`}>
          {step > 1 && step < 3 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          )}

          {step < 3 && (
            <Button
              variant="hero"
              disabled={!canProceed}
              onClick={() => setStep(step + 1)}
              className="group"
            >
              {step === 2 ? "Find My Match" : "Continue"}
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          )}

          {step === 3 && (
            <Button
              variant="ghost"
              onClick={() => setStep(2)}
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Change Settings
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JoinSession;
