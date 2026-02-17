import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Brain, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

const exams = ["JEE Main", "JEE Advanced", "NEET", "Board Exams (CBSE)", "Board Exams (ICSE)", "College Semester", "GATE", "CAT"];
const subjects = ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "English", "Economics"];
const durations = ["25 min (Pomodoro)", "45 min", "1 hour", "1.5 hours", "2 hours"];
const intensities = [
  { id: "casual", label: "Casual", desc: "Relaxed pace. Good for revision.", color: "border-accent" },
  { id: "competitive", label: "Competitive", desc: "Timed goals. Peer tracking on.", color: "border-primary" },
  { id: "strict", label: "Strict", desc: "Locked session. Exit penalties.", color: "border-destructive" },
];

const JoinSession = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [exam, setExam] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("");

  const canProceed = step === 1 ? exam && subject : step === 2 ? duration && intensity : true;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${s <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 transition-all ${s < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-display font-bold mb-2">Select Your Focus</h2>
              <p className="text-muted-foreground mb-8">Choose exam and subject for matching.</p>

              <div className="space-y-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-3 block">Exam</label>
                  <div className="grid grid-cols-2 gap-3">
                    {exams.map((e) => (
                      <button
                        key={e}
                        onClick={() => setExam(e)}
                        className={`p-3 rounded-lg border text-sm text-left transition-all ${exam === e ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:border-border hover:bg-secondary"}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-3 block">Subject</label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSubject(s)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${subject === s ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-secondary"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

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
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${duration === d ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-secondary"}`}
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
                        className={`p-4 rounded-lg border text-left transition-all ${intensity === int.id ? `${int.color} bg-primary/5` : "border-border bg-card hover:bg-secondary"}`}
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

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-display font-bold mb-2">AI Match Preview</h2>
              <p className="text-muted-foreground mb-8">Here's what your session looks like.</p>

              <div className="p-6 rounded-xl border border-primary/20 bg-card space-y-6">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-primary" />
                  <span className="font-display font-semibold">Match Found</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="text-xs text-muted-foreground">Exam</div>
                    <div className="text-sm font-medium mt-1">{exam}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="text-xs text-muted-foreground">Subject</div>
                    <div className="text-sm font-medium mt-1">{subject}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="text-xs text-muted-foreground">Duration</div>
                    <div className="text-sm font-medium mt-1">{duration}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="text-xs text-muted-foreground">Mode</div>
                    <div className="text-sm font-medium mt-1 capitalize">{intensity}</div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">You will be matched with:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-2xl font-display font-bold text-primary">6</div>
                      <div className="text-xs text-muted-foreground">Students</div>
                    </div>
                    <div>
                      <div className="text-2xl font-display font-bold text-accent">78</div>
                      <div className="text-xs text-muted-foreground">Avg Focus</div>
                    </div>
                    <div>
                      <div className="text-2xl font-display font-bold text-glow-amber">High</div>
                      <div className="text-xs text-muted-foreground">Urgency</div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">Exam &lt; 30 days · Matched by subject + focus score</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>

          {step < 3 ? (
            <Button
              variant="hero"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
            >
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="hero" onClick={() => navigate("/study-room")}>
              <Zap className="mr-1 h-4 w-4" /> Enter Session
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JoinSession;
