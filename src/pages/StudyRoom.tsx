import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, LogOut, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const participants = [
  { id: 1, initial: "A", status: "active", score: 82 },
  { id: 2, initial: "K", status: "active", score: 75 },
  { id: 3, initial: "R", status: "active", score: 91 },
  { id: 4, initial: "M", status: "inactive", score: 68 },
  { id: 5, initial: "P", status: "active", score: 77 },
  { id: 6, initial: "S", status: "left", score: 45 },
];

const goals = [
  { text: "Complete Chapter 5 problems", done: true },
  { text: "Review wave optics formulas", done: false },
  { text: "Solve 10 practice questions", done: false },
];

const statusColors: Record<string, string> = {
  active: "ring-primary shadow-[0_0_12px_hsl(155_100%_45%_/_0.4)]",
  inactive: "ring-warning shadow-[0_0_12px_hsl(38_92%_50%_/_0.3)]",
  left: "ring-destructive shadow-[0_0_12px_hsl(0_72%_51%_/_0.3)]",
};

const StudyRoom = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 min
  const [showExitModal, setShowExitModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = ((45 * 60 - timeLeft) / (45 * 60)) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Physics · JEE Main</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium">
            Competitive Mode
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowChat(!showChat)}>
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setShowExitModal(true)}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-secondary">
        <motion.div className="h-full bg-primary" style={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
      </div>

      <div className="flex-1 flex">
        {/* Main area */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Timer */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-8xl md:text-9xl font-display font-bold tracking-tighter text-foreground tabular-nums">
              {formatTime(timeLeft)}
            </div>
            <p className="text-muted-foreground mt-2 text-sm">Session in progress</p>
          </motion.div>

          {/* Participant avatars in circle */}
          <div className="mt-16 relative w-64 h-64">
            {participants.map((p, i) => {
              const angle = (i / participants.length) * 2 * Math.PI - Math.PI / 2;
              const x = Math.cos(angle) * 100 + 100;
              const y = Math.sin(angle) * 100 + 100;

              return (
                <motion.div
                  key={p.id}
                  className={`absolute w-12 h-12 rounded-full ring-2 ${statusColors[p.status]} bg-secondary flex items-center justify-center text-sm font-medium`}
                  style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  {p.initial}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <motion.div
          className={`w-72 border-l border-border/50 bg-card p-4 flex flex-col transition-all ${showChat ? "" : "hidden lg:flex"}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Goals */}
          <div className="mb-6">
            <h3 className="text-sm font-display font-semibold mb-3">Session Goals</h3>
            <div className="space-y-2">
              {goals.map((g, i) => (
                <label key={i} className="flex items-start gap-2 cursor-pointer group">
                  <div className={`mt-0.5 h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${g.done ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}>
                    {g.done && <span className="text-primary-foreground text-[10px]">✓</span>}
                  </div>
                  <span className={`text-sm ${g.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{g.text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div className="mb-6">
            <h3 className="text-sm font-display font-semibold mb-3">Participants</h3>
            <div className="space-y-2">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${p.status === "active" ? "bg-primary" : p.status === "inactive" ? "bg-warning" : "bg-destructive"}`} />
                  <span className="text-sm text-muted-foreground">Student {p.initial}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{p.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Minimal chat */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-sm font-display font-semibold mb-3">Silent Chat</h3>
            <div className="flex-1 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
              <p className="italic">Chat is minimal. Focus on your work.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            className="max-w-sm w-full p-6 rounded-xl border border-destructive/30 bg-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="font-display font-semibold">Leave Session?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Leaving early will affect your Focus Score. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowExitModal(false)}>
                Stay
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => navigate("/dashboard")}>
                Leave
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudyRoom;
