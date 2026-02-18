import { motion } from "framer-motion";
import { ArrowRight, Clock, Target, TrendingUp, Users, Flame, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import FocusScoreRing from "@/components/FocusScoreRing";

const activityFeed = [
  { text: "12 students studying Math right now", time: "Live", live: true },
  { text: "Next JEE batch starts in 20 min", time: "Soon", live: false },
  { text: "Physics group completed 45-min session", time: "5m ago", live: false },
  { text: "New Chemistry batch forming", time: "12m ago", live: false },
  { text: "8 students completed their daily goal", time: "1h ago", live: false },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-display font-bold tracking-tight">Good evening, Student</h1>
          <p className="text-muted-foreground text-sm mt-1">Your focus is building. Keep the streak alive.</p>
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
                  <FocusScoreRing score={76} />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-lg font-display font-semibold">Focus Score</h2>
                    <p className="text-sm text-muted-foreground">Ranked: Focused · Top 28%</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-secondary/70 border border-white/4">
                      <div className="text-xs text-muted-foreground mb-1">Sessions This Week</div>
                      <div className="text-xl font-display font-bold">14</div>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/70 border border-white/4">
                      <div className="text-xs text-muted-foreground mb-1">Streak</div>
                      <div className="text-xl font-display font-bold flex items-center gap-1">
                        7 <Flame className="h-4 w-4 text-glow-amber" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Target, label: "Today's Goal", value: "3/5 hrs", color: "text-primary" },
                { icon: Clock, label: "Next Session", value: "20 min", color: "text-glow-blue" },
                { icon: TrendingUp, label: "Weekly Hours", value: "24.5h", color: "text-primary" },
                { icon: Users, label: "Sessions Done", value: "156", color: "text-glow-amber" },
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
                <p className="text-sm font-medium">JEE Main</p>
                <p className="text-xs text-muted-foreground">24 days remaining</p>
              </div>
              <div className="text-2xl font-display font-bold text-gradient-brand">24</div>
            </motion.div>

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
                  <p className="text-sm text-muted-foreground mt-0.5">3 batches forming right now in your subjects.</p>
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
