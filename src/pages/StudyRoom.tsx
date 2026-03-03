import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, LogOut, AlertTriangle, Volume2, VolumeX, UserX, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ActiveSessionRow } from "@/hooks/useMatchmaking";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse "45 min", "1 hour", "1.5 hours", "25 min (Pomodoro)" → seconds */
function durationToSeconds(dur: string): number {
  if (!dur) return 45 * 60;
  const minMatch = dur.match(/(\d+)\s*min/);
  if (minMatch) return parseInt(minMatch[1]) * 60;
  const hrMatch = dur.match(/([\d.]+)\s*hour/);
  if (hrMatch) return Math.round(parseFloat(hrMatch[1]) * 3600);
  return 45 * 60;
}

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

// Simulate activity: first 80% active, next 15% inactive, rest left
function deriveStatus(idx: number, total: number): "active" | "inactive" | "left" {
  const pct = idx / total;
  if (pct < 0.75) return "active";
  if (pct < 0.9) return "inactive";
  return "left";
}

// Generate initials from display_name
function initials(name: string) {
  return name.slice(0, 1).toUpperCase();
}

// ─── Goals derived from intensity ────────────────────────────────────────────

function defaultGoals(subject: string, intensity: string) {
  const base = [
    { text: `Review core ${subject} concepts`, done: false },
    { text: `Solve 10 ${subject} practice questions`, done: false },
    { text: "Track weak areas for next session", done: false },
  ];
  if (intensity === "strict") {
    base.push({ text: "Complete without early exit", done: false });
  }
  return base;
}

// ─── Solo Mode ────────────────────────────────────────────────────────────────

const SoloMode = ({
  timeLeft,
  progress,
  formatTime,
  subject,
  exam,
}: {
  timeLeft: number;
  progress: number;
  formatTime: (s: number) => string;
  subject: string;
  exam: string;
}) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-glow-amber/30 bg-glow-amber/5 mb-6">
        <UserX className="h-3.5 w-3.5 text-glow-amber" />
        <span className="text-xs text-glow-amber font-medium">Solo Structured Mode</span>
      </div>
      <p className="text-sm text-muted-foreground">
        No peers found for {subject} · {exam}. You're studying solo — discipline tracked.
      </p>
    </div>

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
          stroke="hsl(38,92%,50%)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 54}
          strokeDashoffset={2 * Math.PI * 54 - (progress / 100) * 2 * Math.PI * 54}
          transition={{ duration: 0.5 }}
        />
      </svg>
      <div className="text-center">
        <div className="text-7xl md:text-8xl font-display font-bold tracking-tighter tabular-nums leading-none">
          {formatTime(timeLeft)}
        </div>
        <p className="text-muted-foreground text-sm mt-3 font-medium">Solo session in progress</p>
      </div>
    </motion.div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface LocationState {
  activeSession?: ActiveSessionRow;
  exam: string;
  subject: string;
  duration: string;
  intensity: string;
}

interface Peer {
  id: string;
  label: string;
}

interface PeerProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

const StudyRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as LocationState | null;

  // Real data from matchmaking or fallback defaults
  const activeSession: ActiveSessionRow | null = state?.activeSession ?? null;
  const exam = state?.exam ?? "JEE Main";
  const subject = state?.subject ?? "Physics";
  const duration = state?.duration ?? "45 min";
  const intensity = state?.intensity ?? "competitive";

  const totalTime = durationToSeconds(duration);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [muted, setMuted] = useState(true);
  const [goals, setGoals] = useState(() => defaultGoals(subject, intensity));
  const [peerProfiles, setPeerProfiles] = useState<PeerProfile[]>([]);
  const [chatMessages, setChatMessages] = useState<{ id: string; user_id: string; display_name: string; content: string; created_at: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sessionId = activeSession?.session_id ?? "solo-" + user?.id;
  const isSolo = !activeSession || activeSession.capacity === "solo";
  // Deduplicate participant_user_ids
  const uniqueParticipantIds = [...new Set(activeSession?.participant_user_ids ?? [])];
  const peers: Peer[] = uniqueParticipantIds
    .map((uid, i) => ({ id: uid, label: peerProfiles.find(p => p.id === uid)?.display_name || `S${i + 1}` }));

  // Fetch participant profiles
  useEffect(() => {
    if (!activeSession?.participant_user_ids?.length) return;
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", activeSession.participant_user_ids);
      if (data) {
        setPeerProfiles(data.map(p => ({
          id: p.user_id,
          display_name: p.display_name || "Student",
          avatar_url: p.avatar_url,
        })));
      }
    };
    fetchProfiles();
  }, [activeSession]);

  // Fetch existing chat messages & subscribe to realtime
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setChatMessages(data as any);
    };
    fetchMessages();

    const channel = supabase
      .channel(`chat-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setChatMessages((prev) => [...prev, payload.new as any]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!chatInput.trim() || sendingChat) return;
    setSendingChat(true);
    const profileName = peerProfiles.find(p => p.id === user?.id)?.display_name || user?.email?.split("@")[0] || "You";
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      user_id: user?.id ?? "",
      display_name: profileName,
      content: chatInput.trim(),
    } as any);
    setChatInput("");
    setSendingChat(false);
  };

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

  const intensityLabel =
    intensity === "strict" ? "Strict Mode" :
    intensity === "competitive" ? "Competitive Mode" : "Casual Mode";

  const toggleGoal = (i: number) => {
    setGoals((prev) => prev.map((g, idx) => idx === i ? { ...g, done: !g.done } : g));
  };

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
          <div className={`h-2 w-2 rounded-full ${isSolo ? "bg-glow-amber" : "bg-glow-green animate-pulse-green"}`} />
          <span className="text-sm font-medium">{subject} · {exam}</span>
          <span className="text-xs text-muted-foreground">
            {isSolo ? "Solo mode" : `${peers.length} peer${peers.length !== 1 ? "s" : ""} · Session live`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/8 text-primary text-xs font-medium">
            {intensityLabel}
          </span>
          {activeSession && (
            <span className="px-2 py-1 rounded-full border border-border text-muted-foreground text-xs font-mono">
              Avg Focus {activeSession.avg_focus}
            </span>
          )}
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
        {isSolo ? (
          <SoloMode
            timeLeft={timeLeft}
            progress={progress}
            formatTime={formatTime}
            subject={subject}
            exam={exam}
          />
        ) : (
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

            {/* Participant avatars — circular layout from real match data */}
            <div className="relative w-60 h-60">
              {peers.map((p, i) => {
                const angle = (i / peers.length) * 2 * Math.PI - Math.PI / 2;
                const x = Math.cos(angle) * 96 + 96;
                const y = Math.sin(angle) * 96 + 96;
                const status = deriveStatus(i, peers.length);

                return (
                  <motion.div
                    key={`${p.id}-${i}`}
                    className={`absolute w-12 h-12 rounded-full ring-2 ${statusRing[status]} bg-secondary flex items-center justify-center text-sm font-semibold cursor-default overflow-hidden`}
                    style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 260, damping: 20 }}
                    whileHover={{ scale: 1.12 }}
                    title={p.label}
                  >
                    {(() => {
                      const profile = peerProfiles.find(pp => pp.id === p.id);
                      if (profile?.avatar_url) {
                        return <img src={profile.avatar_url} alt={p.label} className="h-full w-full object-cover" />;
                      }
                      return initials(p.label);
                    })()}
                  </motion.div>
                );
              })}

              {/* Center pulse */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-glow-green animate-pulse-green" />
              </div>
            </div>
          </div>
        )}

        {/* ── Right side panel ── */}
        <motion.div
          className={`w-72 border-l border-white/5 glass flex flex-col p-4 gap-5 ${showChat ? "" : "hidden lg:flex"}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Session Goals — interactive */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Session Goals</h3>
            <div className="space-y-2.5">
              {goals.map((g, i) => (
                <button
                  key={i}
                  onClick={() => toggleGoal(i)}
                  className="flex items-start gap-2.5 cursor-pointer group w-full text-left"
                >
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
                </button>
              ))}
            </div>
          </div>

          {/* Peers list — real matched users */}
          {!isSolo && peers.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Peers ({peers.length})
              </h3>
              <div className="space-y-2">
                {peers.map((p, i) => {
                  const status = deriveStatus(i, peers.length);
                  return (
                    <div key={`${p.id}-${i}`} className="flex items-center gap-2.5 py-1">
                      <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${statusDot[status]}`} />
                      <span className="text-sm text-muted-foreground flex-1">{p.label}</span>
                      <span className="text-xs text-muted-foreground/60 font-mono">—</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Match stats */}
          {activeSession && !isSolo && (
            <div className="p-3 rounded-lg bg-secondary/50 border border-white/4 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Avg Compatibility</span>
                <span className="font-mono text-primary">{Number(activeSession.avg_compatibility).toFixed(2)}/3.00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Avg Focus</span>
                <span className="font-mono">{activeSession.avg_focus}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Urgency</span>
                <span className="font-mono">{activeSession.urgency_label}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Session ID</span>
                <span className="font-mono text-muted-foreground/50">{activeSession.session_id.slice(-8)}</span>
              </div>
            </div>
          )}

          {/* Chat */}
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Chat</h3>
            <ScrollArea className="flex-1 rounded-xl bg-secondary/50 border border-white/4 p-3 mb-2 max-h-48">
              <div className="space-y-2">
                {chatMessages.length === 0 && (
                  <p className="text-xs text-muted-foreground/60 text-center italic py-4">
                    No messages yet. Say hi!
                  </p>
                )}
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`text-xs ${msg.user_id === user?.id ? "text-right" : ""}`}>
                    <span className="font-semibold text-primary/80">{msg.user_id === user?.id ? "You" : msg.display_name}: </span>
                    <span className="text-foreground/80">{msg.content}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-1.5"
            >
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="h-8 text-xs bg-secondary/50 border-white/4"
                maxLength={200}
              />
              <Button type="submit" size="icon-sm" variant="ghost" disabled={sendingChat || !chatInput.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
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
