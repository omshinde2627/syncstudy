import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Brain, Users, Zap, CalendarDays, Loader2, AlertTriangle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import {
  calculateUrgency,
  urgencyLabel,
  daysUntilExam,
  formGroup,
  generateMockPool,
  type MatchResult,
  type WaitingUser,
} from "@/lib/matchmaking";

// ─── Config ──────────────────────────────────────────────────────────────────

const exams = ["JEE Main", "JEE Advanced", "NEET", "Board Exams (CBSE)", "Board Exams (ICSE)", "College Semester", "GATE", "CAT"];
const subjects = ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "English", "Economics"];
const durations = ["25 min (Pomodoro)", "45 min", "1 hour", "1.5 hours", "2 hours"];
const intensities = [
  { id: "casual", label: "Casual", desc: "Relaxed pace. Good for revision.", color: "border-accent" },
  { id: "competitive", label: "Competitive", desc: "Timed goals. Peer tracking on.", color: "border-primary" },
  { id: "strict", label: "Strict", desc: "Locked session. Exit penalties.", color: "border-destructive" },
];

// ─── Urgency badge colours (using design tokens) ────────────────────────────

const urgencyColors: Record<string, string> = {
  High: "text-destructive",
  Medium: "text-glow-amber",
  Low: "text-primary",
};

// ─── Current user mock focus score (would come from auth/profile in prod) ───

const CURRENT_USER_FOCUS = 76;

// ─── Capacity messaging ──────────────────────────────────────────────────────

function capacityMessage(result: MatchResult) {
  if (result.capacity === "solo") {
    return {
      icon: <AlertTriangle className="h-4 w-4 text-glow-amber" />,
      text: "No peers found right now. You'll enter Solo Structured Mode.",
      color: "border-glow-amber/30 bg-glow-amber/5",
    };
  }
  if (result.capacity === "low_capacity") {
    return {
      icon: <Users className="h-4 w-4 text-accent" />,
      text: `Only ${result.group.length} peers available. Starting a Low Capacity session.`,
      color: "border-accent/30 bg-accent/5",
    };
  }
  return {
    icon: <UserCheck className="h-4 w-4 text-primary" />,
    text: "Full batch matched. Session starting with optimal group.",
    color: "border-primary/20 bg-primary/5",
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

const JoinSession = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [exam, setExam] = useState("");
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");

  // Step 2 state
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("");

  // Step 3 — match result
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  const canProceed =
    step === 1 ? !!(exam && subject && examDate) :
    step === 2 ? !!(duration && intensity) :
    true;

  // Run matchmaking when entering step 3
  useEffect(() => {
    if (step !== 3) return;
    setMatching(true);
    setMatchResult(null);

    // Simulate network latency (matching engine call)
    const timeout = setTimeout(() => {
      const parsedDate = new Date(examDate);
      const currentUser: WaitingUser = {
        user_id: "current_user",
        display_name: "You",
        exam_type: exam,
        subject,
        time_slot: "20:00",             // would be real slot selection in prod
        duration,
        intensity,
        focus_score: CURRENT_USER_FOCUS,
        exam_date: parsedDate,
        urgency: calculateUrgency(parsedDate),
        status: "waiting",
        joined_at: new Date(),
      };

      // Generate a simulated waiting pool matching exam+subject+slot
      const pool = generateMockPool(exam, subject, "20:00", duration, 12);
      const result = formGroup(currentUser, pool);

      setMatchResult(result);
      setMatching(false);
    }, 1800); // realistic "AI thinking" delay

    return () => clearTimeout(timeout);
  }, [step, exam, subject, examDate, duration, intensity]);

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
            {step === 1 ? "Academic Focus" : step === 2 ? "Session Settings" : "AI Match Preview"}
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

          {/* ── Step 3 — AI Match Preview ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-display font-bold mb-2">AI Match Preview</h2>
              <p className="text-muted-foreground mb-8">Running compatibility analysis…</p>

              {/* Matching loader */}
              {matching && (
                <motion.div
                  className="p-10 rounded-xl border border-border/50 bg-card flex flex-col items-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Scanning waiting pool · Scoring compatibility · Forming batch…
                  </p>
                </motion.div>
              )}

              {/* Match result */}
              {!matching && matchResult && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Session summary */}
                  <div className="p-6 rounded-xl border border-primary/20 bg-card space-y-5">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-primary" />
                      <span className="font-display font-semibold">Match Found</span>
                      <span className="ml-auto text-xs text-muted-foreground font-mono">
                        id: {matchResult.session_id.slice(-6)}
                      </span>
                    </div>

                    {/* Params grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Exam", value: exam },
                        { label: "Subject", value: subject },
                        { label: "Duration", value: duration },
                        { label: "Mode", value: intensity.charAt(0).toUpperCase() + intensity.slice(1) },
                        {
                          label: "Days to Exam",
                          value: `${daysUntilExam(new Date(examDate))} days`,
                        },
                        {
                          label: "Your Urgency",
                          value: urgencyLabel(calculateUrgency(new Date(examDate))),
                        },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-3 rounded-lg bg-secondary">
                          <div className="text-xs text-muted-foreground">{label}</div>
                          <div className="text-sm font-medium mt-0.5">{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Match stats */}
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">You will be matched with:</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="text-2xl font-display font-bold text-primary">
                            {matchResult.group.length}
                          </div>
                          <div className="text-xs text-muted-foreground">Students</div>
                        </div>
                        <div>
                          <div className="text-2xl font-display font-bold text-accent">
                            {matchResult.avg_focus}
                          </div>
                          <div className="text-xs text-muted-foreground">Avg Focus</div>
                        </div>
                        <div>
                          <div
                            className={`text-2xl font-display font-bold ${
                              urgencyColors[matchResult.urgency_label]
                            }`}
                          >
                            {matchResult.urgency_label}
                          </div>
                          <div className="text-xs text-muted-foreground">Urgency</div>
                        </div>
                      </div>
                    </div>

                    {/* Compatibility bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-muted-foreground">Avg Compatibility Score</span>
                        <span className="text-xs font-medium text-primary">
                          {matchResult.avg_compatibility.toFixed(2)} / 3.00
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${(matchResult.avg_compatibility / 3) * 100}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Matched peers (anonymous) */}
                    {matchResult.group.length > 0 && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Matched Peers (anonymous)</div>
                        <div className="flex flex-wrap gap-2">
                          {matchResult.group.map((u, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-xs"
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <span className="text-muted-foreground">Focus</span>
                              <span className="font-medium">{u.focus_score}</span>
                              <span className="text-muted-foreground/50">·</span>
                              <span
                                className={`${urgencyColors[urgencyLabel(u.urgency)]} text-xs`}
                              >
                                {urgencyLabel(u.urgency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Capacity status */}
                  {(() => {
                    const msg = capacityMessage(matchResult);
                    return (
                      <div className={`flex items-center gap-3 p-3 rounded-lg border ${msg.color}`}>
                        {msg.icon}
                        <p className="text-xs text-foreground/80">{msg.text}</p>
                      </div>
                    );
                  })()}

                  <p className="text-xs text-muted-foreground text-center">
                    Algorithm: rule-based filter + weighted compatibility (focus ×0.6, urgency ×0.4)
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>

          {step < 3 ? (
            <Button variant="hero" onClick={() => setStep(step + 1)} disabled={!canProceed}>
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
          <Button
              variant="hero"
              onClick={() =>
                navigate("/study-room", {
                  state: {
                    matchResult,
                    exam,
                    subject,
                    duration,
                    intensity,
                  },
                })
              }
              disabled={matching || !matchResult}
            >
              <Zap className="mr-1 h-4 w-4" />
              {matchResult?.capacity === "solo" ? "Enter Solo Mode" : "Enter Session"}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JoinSession;
