import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import FocusScoreRing from "@/components/FocusScoreRing";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ProfileStats {
  focus_score: number;
  total_sessions: number;
  streak_days: number;
  total_study_hours: number;
  sessions_completed: number;
}

const Analytics = () => {
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
  const totalSessions = stats?.total_sessions ?? 0;
  const sessionsCompleted = stats?.sessions_completed ?? 0;
  const streakDays = stats?.streak_days ?? 0;
  const totalHours = Number(stats?.total_study_hours ?? 0);

  const completionRate = totalSessions > 0 ? Math.round((sessionsCompleted / totalSessions) * 100) : 0;
  const tier = focusScore >= 90 ? "Apex" : focusScore >= 75 ? "Focused" : focusScore >= 55 ? "Stabilizing" : "Drifter";

  // Generate empty weekly data for new users
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyData = days.map(day => ({ day, hours: 0 }));

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold mb-1">Analytics</h1>
          <p className="text-muted-foreground text-sm mb-8">Your study performance at a glance.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Focus Score */}
          <motion.div
            className="p-6 rounded-xl border border-border/50 bg-card flex flex-col items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <FocusScoreRing score={focusScore} size={160} />
            <h3 className="font-display font-semibold mt-4">Focus Score</h3>
            <p className="text-xs text-muted-foreground">{tier}</p>
            <div className="w-full mt-4 grid grid-cols-2 gap-3">
              <div className="p-2 rounded-lg bg-secondary text-center">
                <div className="text-lg font-display font-bold">{totalSessions}</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
              <div className="p-2 rounded-lg bg-secondary text-center">
                <div className="text-lg font-display font-bold">{completionRate}%</div>
                <div className="text-xs text-muted-foreground">Completion</div>
              </div>
            </div>
          </motion.div>

          {/* Weekly Hours */}
          <motion.div
            className="lg:col-span-2 p-6 rounded-xl border border-border/50 bg-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h3 className="font-display font-semibold mb-4">Weekly Study Hours</h3>
            {totalHours === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                Complete sessions to see your weekly chart
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(210, 10%, 50%)", fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: "hsl(210, 8%, 12%)", border: "1px solid hsl(210, 8%, 18%)", borderRadius: 8, color: "hsl(210, 20%, 92%)", fontSize: 12 }}
                    cursor={{ fill: "hsl(210, 8%, 14%)" }}
                  />
                  <Bar dataKey="hours" fill="hsl(155, 100%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Stats summary */}
          <motion.div
            className="lg:col-span-2 p-6 rounded-xl border border-border/50 bg-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-display font-semibold mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-secondary text-center">
                <div className="text-2xl font-display font-bold">{focusScore}</div>
                <div className="text-xs text-muted-foreground">Focus Score</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary text-center">
                <div className="text-2xl font-display font-bold">{totalHours.toFixed(1)}h</div>
                <div className="text-xs text-muted-foreground">Total Hours</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary text-center">
                <div className="text-2xl font-display font-bold">{sessionsCompleted}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary text-center">
                <div className="text-2xl font-display font-bold">{completionRate}%</div>
                <div className="text-xs text-muted-foreground">Rate</div>
              </div>
            </div>
          </motion.div>

          {/* Streak */}
          <motion.div
            className="p-6 rounded-xl border border-border/50 bg-card flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="text-4xl font-display font-bold text-primary mb-2">
              {streakDays > 0 ? `🔥 ${streakDays}` : "0"}
            </div>
            <h3 className="font-display font-semibold">Streak Days</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              {streakDays > 0
                ? `You've studied ${streakDays} days in a row!`
                : "Start a session to begin your streak."}
            </p>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
