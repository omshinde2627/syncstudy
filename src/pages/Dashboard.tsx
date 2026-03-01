import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Target, TrendingUp, Users, Flame, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import FocusScoreRing from "@/components/FocusScoreRing";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const activityFeed = [
  { text: "Students studying right now", time: "Live", live: true },
  { text: "Join a session to get started", time: "Now", live: false },
];

interface ProfileStats {
  display_name: string;
  focus_score: number;
  total_sessions: number;
  streak_days: number;
  total_study_hours: number;
  sessions_completed: number;
  exam_target: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setStats(data as unknown as ProfileStats);
      });
  }, [user]);

  const focusScore = stats?.focus_score ?? 50;
  const displayName = stats?.display_name || "Student";
  const totalSessions = stats?.total_sessions ?? 0;
  const streakDays = stats?.streak_days ?? 0;
  const totalHours = stats?.total_study_hours ?? 0;
  const sessionsCompleted = stats?.sessions_completed ?? 0;
  const examTarget = stats?.exam_target || null;

  // Focus tier
  const tier = focusScore >= 90 ? "Apex" : focusScore >= 75 ? "Focused" : focusScore >= 55 ? "Stabilizing" : "Drifter";

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-display font-bold tracking-tight">
            {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening"}, {displayName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {streakDays > 0 ? `Your focus is building. ${streakDays}-day streak!` : "Start your first session to build your focus score."}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Focus Score Card */}
            <motion.div
              className="p-6 rounded-2xl glass-card border-gradient"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-radial-purple opacity-40 blur-xl" />
                  <FocusScoreRing score={focusScore} />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-lg font-display font-semibold">Focus Score</h2>
                    <p className="text-sm text-muted-foreground">Ranked: {tier}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-secondary/70 border border-white/4">
                      <div className="text-xs text-muted-foreground mb-1">Total Sessions</div>
                      <div className="text-xl font-display font-bold">{totalSessions}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/70 border border-white/4">
                      <div className="text-xs text-muted-foreground mb-1">Streak</div>
                      <div className="text-xl font-display font-bold flex items-center gap-1">
                        {streakDays} {streakDays > 0 && <Flame className="h-4 w-4 text-glow-amber" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Target, label: "Focus Score", value: `${focusScore}`, color: "text-primary" },
                { icon: Clock, label: "Study Hours", value: `${Number(totalHours).toFixed(1)}h`, color: "text-glow-blue" },
                { icon: TrendingUp, label: "Streak", value: `${streakDays}d`, color: "text-primary" },
                { icon: Users, label: "Sessions Done", value: `${sessionsCompleted}`, color: "text-glow-amber" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="p-4 rounded-2xl glass-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200 cursor-default"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14 + i * 0.05 }}
                >
                  <stat.icon className={`h-4 w-4 ${stat.color} mb-2.5`} />
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className="text-lg font-display font-bold mt-0.5">{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Exam countdown */}
            {examTarget && (
              <motion.div
                className="p-4 rounded-2xl glass-card flex items-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-brand-subtle border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{examTarget}</p>
                  <p className="text-xs text-muted-foreground">Your target exam</p>
                </div>
              </motion.div>
            )}

            {/* Join Session CTA */}
            <motion.div
              className="p-6 rounded-2xl border-gradient-animated relative overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34 }}
            >
              <div className="absolute inset-0 bg-gradient-brand-subtle rounded-2xl" />
              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-semibold text-lg">Ready for your next session?</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Find study partners and start focusing.</p>
                </div>
                <Button variant="hero" onClick={() => navigate("/join-session")} className="flex-shrink-0 group">
                  Join <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </motion.div>
          </div>

          {/* ── Right column — Activity Feed ── */}
          <motion.div
            className="p-5 rounded-2xl glass-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-sm">Live Activity</h3>
              <div className="flex items-center gap-1.5 text-xs text-glow-green">
                <span className="h-1.5 w-1.5 rounded-full bg-glow-green animate-pulse-green" />
                Live
              </div>
            </div>
            <div className="space-y-4">
              {activityFeed.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 transition-all ${
                      item.live
                        ? "bg-glow-green animate-pulse-green"
                        : "bg-muted-foreground/25"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/85 leading-snug">{item.text}</p>
                    <span className="text-xs text-muted-foreground mt-0.5 block">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
