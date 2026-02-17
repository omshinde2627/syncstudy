import { motion } from "framer-motion";
import { Clock, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";

const tests = [
  { subject: "Physics", topic: "Wave Optics", questions: 30, time: "45 min", difficulty: "Medium", avg: 72 },
  { subject: "Mathematics", topic: "Calculus", questions: 25, time: "40 min", difficulty: "Hard", avg: 58 },
  { subject: "Chemistry", topic: "Organic Reactions", questions: 35, time: "50 min", difficulty: "Medium", avg: 65 },
  { subject: "Physics", topic: "Thermodynamics", questions: 20, time: "30 min", difficulty: "Easy", avg: 81 },
];

const diffColors: Record<string, string> = {
  Easy: "text-primary",
  Medium: "text-glow-amber",
  Hard: "text-destructive",
};

const TestSeries = () => {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold mb-1">Test Series</h1>
          <p className="text-muted-foreground text-sm mb-8">Practice tests matched to your exam and subjects.</p>
        </motion.div>

        <div className="space-y-4">
          {tests.map((test, i) => (
            <motion.div
              key={i}
              className="p-5 rounded-xl border border-border/50 bg-card flex flex-col md:flex-row md:items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{test.subject}</span>
                  <span className={`text-xs font-medium ${diffColors[test.difficulty]}`}>{test.difficulty}</span>
                </div>
                <h3 className="font-display font-semibold">{test.topic}</h3>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {test.questions} Qs
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {test.time}
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Avg: {test.avg}%
                </div>
              </div>

              <Button variant="hero-outline" size="sm">Start Test</Button>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TestSeries;
