import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, LogOut, AlertTriangle, Volume2, VolumeX } from "lucide-react";
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

// Status ring colours mapped to design tokens
const statusRing: Record<string, string> = {
  active: "ring-[hsl(142,76%,45%)] shadow-[0_0_14px_hsl(142,76%,45%,0.45)]",
  inactive: "ring-[hsl(38,92%,50%)] shadow-[0_0_10px_hsl(38,92%,50%,0.3)]",
  left: "ring-[hsl(0,72%,51%)] shadow-[0_0_10px_hsl(0,72%,51%,0.3)] opacity-40",
};

const statusDot: Record<string, string> = {
  active: "bg-glow-green",
  inactive: "bg-glow-amber",
  left: "bg-destructive",
};

const StudyRoom = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [muted, setMuted] = useState(true);
  const totalTime = 45 * 60;

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

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">

      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(263,70%,58%,0.04)] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[hsl(217,91%,55%,0.04)] blur-3xl" />
      </div>

      {/* ── Top bar ── */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 glass z-10 relative">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-glow-green animate-pulse-green" />
          <span className="text-sm font-medium">Physics · JEE Main</span>
          <span className="text-xs text-muted-foreground">6 peers · Session live</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/8 text-primary text-xs font-medium">
            Competitive Mode
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon-sm" onClick={() => setMuted(!muted)}>
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setShowChat(!showChat)}>
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => setShowExitModal(true)}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Thin progress line */}
      <div className="h-0.5 bg-border relative z-10">
        <motion.div
          className="h-full bg-gradient-to-r from-[hsl(263,70%,58%)] to-[hsl(217,91%,55%)]"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* ── Main body ── */}
      <div className="flex-1 flex relative z-10">

        {/* Center — Timer + Avatars */}
        <div className="flex-1 flex flex-col items-center justify-center gap-14 px-6">

          {/* Circular timer */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <svg width="140" height="140" className="-rotate-90 absolute opacity-30">
              <circle cx="70" cy="70" r="54" fill="none" stroke="hsl(228,14%,18%)" strokeWidth="3" />
              <motion.circle
                cx="70" cy="70" r="54" fill="none"
                stroke="url(#timerGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                transition={{ duration: 0.5 }}
              />
              <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(263,70%,58%)" />
                  <stop offset="100%" stopColor="hsl(217,91%,55%)" />
                </linearGradient>
              </defs>
            </svg>

            <div className="text-center">
              <div className="text-7xl md:text-8xl font-display font-bold tracking-tighter tabular-nums leading-none">
                {formatTime(timeLeft)}
              </div>
              <p className="text-muted-foreground text-sm mt-3 font-medium">Session in progress</p>
            </div>
          </motion.div>

          {/* Participant avatars — circular layout */}
          <div className="relative w-60 h-60">
            {participants.map((p, i) => {
              const angle = (i / participants.length) * 2 * Math.PI - Math.PI / 2;
              const x = Math.cos(angle) * 96 + 96;
              const y = Math.sin(angle) * 96 + 96;

              return (
                <motion.div
                  key={p.id}
                  className={`absolute w-12 h-12 rounded-full ring-2 ${statusRing[p.status]} bg-secondary flex items-center justify-center text-sm font-semibold cursor-default`}
                  style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 260, damping: 20 }}
                  whileHover={{ scale: 1.12 }}
                  title={`Focus: ${p.score}`}
                >
                  {p.initial}
                </motion.div>
              );
            })}

            {/* Center indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-glow-green animate-pulse-green" />
            </div>
          </div>
        </div>

        {/* ── Right side panel ── */}
        <motion.div
          className={`w-72 border-l border-white/5 glass flex flex-col p-4 gap-5 ${showChat ? "" : "hidden lg:flex"}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Session Goals */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Session Goals</h3>
            <div className="space-y-2.5">
              {goals.map((g, i) => (
                <label key={i} className="flex items-start gap-2.5 cursor-pointer group">
                  <div
                    className={`mt-0.5 h-4 w-4 rounded-md border flex-shrink-0 flex items-center justify-center transition-all ${
                      g.done
                        ? "bg-gradient-to-br from-[hsl(263,70%,58%)] to-[hsl(217,91%,55%)] border-transparent"
                        : "border-border group-hover:border-primary/50"
                    }`}
                  >
                    {g.done && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                  <span className={`text-sm leading-snug ${g.done ? "text-muted-foreground line-through" : "text-foreground/90"}`}>
                    {g.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Peers</h3>
            <div className="space-y-2">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center gap-2.5 py-1">
                  <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${statusDot[p.status]}`} />
                  <span className="text-sm text-muted-foreground flex-1">Student {p.initial}</span>
                  <span className="text-xs text-muted-foreground/60 font-mono">{p.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Silent chat */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Silent Chat</h3>
            <div className="flex-1 rounded-xl bg-secondary/50 border border-white/4 p-3 flex items-center justify-center">
              <p className="text-xs text-muted-foreground/60 text-center italic">
                Chat is minimal.<br />Focus on your work.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Exit Modal ── */}
      <AnimatePresence>
        {showExitModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/85 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-sm w-full p-6 rounded-2xl glass-card border border-destructive/25"
              initial={{ opacity: 0, scale: 0.93, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-destructive/15 border border-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <h3 className="font-display font-semibold">Leave Session?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Leaving early will affect your Focus Score and reduce your peer rating. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setShowExitModal(false)}>
                  Stay & Focus
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => navigate("/dashboard")}>
                  Leave Anyway
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyRoom;
