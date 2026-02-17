import { motion } from "framer-motion";
import { ArrowRight, Clock, Target, TrendingUp, Users, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import FocusScoreRing from "@/components/FocusScoreRing";

const activityFeed = [
  { text: "12 students studying Math right now", time: "Live" },
  { text: "Next JEE batch starts in 20 min", time: "Soon" },
  { text: "Physics group completed 45-min session", time: "5m ago" },
  { text: "New Chemistry batch forming", time: "12m ago" },
  { text: "8 students completed their daily goal", time: "1h ago" },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-display font-bold">Good evening, Student</h1>
          <p className="text-muted-foreground text-sm mt-1">Your focus is building. Keep the streak alive.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Focus Score + Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Focus Score Card */}
            <motion.div
              className="p-6 rounded-xl border border-border/50 bg-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <FocusScoreRing score={76} />
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-lg font-display font-semibold">Focus Score</h2>
                    <p className="text-sm text-muted-foreground">Ranked: Focused · Top 28%</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-secondary">
                      <div className="text-xs text-muted-foreground mb-1">Sessions This Week</div>
                      <div className="text-xl font-display font-bold">14</div>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Target, label: "Today's Goal", value: "3/5 hrs", color: "text-primary" },
                { icon: Clock, label: "Next Session", value: "20 min", color: "text-accent" },
                { icon: TrendingUp, label: "Weekly Hours", value: "24.5h", color: "text-primary" },
                { icon: Users, label: "Sessions Done", value: "156", color: "text-glow-amber" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="p-4 rounded-xl border border-border/50 bg-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <stat.icon className={`h-4 w-4 ${stat.color} mb-2`} />
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className="text-lg font-display font-bold mt-1">{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Join Session CTA */}
            <motion.div
              className="p-6 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div>
                <h3 className="font-display font-semibold">Ready for your next session?</h3>
                <p className="text-sm text-muted-foreground">3 batches forming right now in your subjects.</p>
              </div>
              <Button variant="hero" onClick={() => navigate("/join-session")}>
                Join <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Right - Activity Feed */}
          <motion.div
            className="p-6 rounded-xl border border-border/50 bg-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-display font-semibold mb-4">Live Activity</h3>
            <div className="space-y-4">
              {activityFeed.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${i === 0 ? "bg-primary animate-pulse-glow" : "bg-muted-foreground/30"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/90 leading-snug">{item.text}</p>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
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
