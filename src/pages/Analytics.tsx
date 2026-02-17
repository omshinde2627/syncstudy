import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import FocusScoreRing from "@/components/FocusScoreRing";

const weeklyData = [
  { day: "Mon", hours: 4.5 },
  { day: "Tue", hours: 3.2 },
  { day: "Wed", hours: 5.1 },
  { day: "Thu", hours: 2.8 },
  { day: "Fri", hours: 6.0 },
  { day: "Sat", hours: 4.0 },
  { day: "Sun", hours: 3.5 },
];

const subjectData = [
  { name: "Physics", value: 35, color: "hsl(155, 100%, 45%)" },
  { name: "Math", value: 30, color: "hsl(210, 100%, 55%)" },
  { name: "Chemistry", value: 20, color: "hsl(38, 92%, 50%)" },
  { name: "CS", value: 15, color: "hsl(280, 60%, 55%)" },
];

// Heatmap data (GitHub-style)
const heatmapWeeks = 12;
const heatmapDays = 7;
const heatmapData = Array.from({ length: heatmapWeeks }, () =>
  Array.from({ length: heatmapDays }, () => Math.floor(Math.random() * 5))
);

const heatColors = [
  "hsl(210, 8%, 12%)",
  "hsl(155, 100%, 45%, 0.15)",
  "hsl(155, 100%, 45%, 0.35)",
  "hsl(155, 100%, 45%, 0.6)",
  "hsl(155, 100%, 45%, 0.9)",
];

const Analytics = () => {
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
            <FocusScoreRing score={76} size={160} />
            <h3 className="font-display font-semibold mt-4">Focus Score</h3>
            <p className="text-xs text-muted-foreground">Focused · Top 28%</p>
            <div className="w-full mt-4 grid grid-cols-2 gap-3">
              <div className="p-2 rounded-lg bg-secondary text-center">
                <div className="text-lg font-display font-bold">156</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
              <div className="p-2 rounded-lg bg-secondary text-center">
                <div className="text-lg font-display font-bold">94%</div>
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
          </motion.div>

          {/* Heatmap */}
          <motion.div
            className="lg:col-span-2 p-6 rounded-xl border border-border/50 bg-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-display font-semibold mb-4">Study Heatmap</h3>
            <div className="flex gap-1">
              {heatmapData.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((val, di) => (
                    <div
                      key={di}
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: heatColors[val] }}
                      title={`${val} sessions`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <span>Less</span>
              {heatColors.map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
              ))}
              <span>More</span>
            </div>
          </motion.div>

          {/* Subject Distribution */}
          <motion.div
            className="p-6 rounded-xl border border-border/50 bg-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h3 className="font-display font-semibold mb-4">Subject Distribution</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={subjectData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" stroke="none">
                  {subjectData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {subjectData.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="ml-auto text-foreground font-medium">{s.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Streak */}
          <motion.div
            className="lg:col-span-3 p-6 rounded-xl border border-primary/20 bg-primary/5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold">Consistency Streak</h3>
                <p className="text-sm text-muted-foreground mt-1">You've studied 7 days in a row. Keep it going!</p>
              </div>
              <div className="text-4xl font-display font-bold text-primary">🔥 7</div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
