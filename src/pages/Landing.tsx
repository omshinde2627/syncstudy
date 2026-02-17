import { motion } from "framer-motion";
import { ArrowRight, Users, Target, Brain, Shield, Zap, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: Brain,
    title: "AI-Matched Groups",
    description: "Matched by exam, subject, urgency and focus score. No random grouping.",
  },
  {
    icon: Timer,
    title: "Timed Sessions",
    description: "Pomodoro or custom timers. Locked sessions with exit penalties.",
  },
  {
    icon: Target,
    title: "Focus Scoring",
    description: "0–100 behavioral score. High discipline users matched together.",
  },
  {
    icon: Shield,
    title: "Accountability Engine",
    description: "Session tracking, peer ratings, consistency monitoring. No hiding.",
  },
  {
    icon: Zap,
    title: "Performance Analytics",
    description: "Heatmaps, streaks, subject distribution. Know exactly where you stand.",
  },
  {
    icon: Users,
    title: "Anonymous & Focused",
    description: "No names. No socializing. Just subject, focus level, and work.",
  },
];

const stats = [
  { value: "2,400+", label: "Active Students" },
  { value: "156K", label: "Sessions Completed" },
  { value: "78", label: "Avg Focus Score" },
  { value: "94%", label: "Completion Rate" },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero */}
      <header className="relative min-h-screen flex flex-col">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div className="absolute inset-0 bg-radial-glow" />
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">SyncStudy</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Stats</a>
          </div>
          <Button variant="hero-outline" size="sm" onClick={() => navigate("/dashboard")}>
            Enter Platform
          </Button>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm mb-8">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
                47 students studying right now
              </div>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Stop Studying Alone.{" "}
              <span className="text-gradient-green">Study Like It Matters.</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              AI-matched accountability sessions for serious students. 
              Timed. Tracked. No excuses.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button variant="hero" size="xl" onClick={() => navigate("/join-session")}>
                Join Next Session
                <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
              <Button variant="hero-outline" size="xl" onClick={() => navigate("/dashboard")}>
                View Dashboard
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Live indicator */}
        <motion.div
          className="relative z-10 pb-12 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: `hsl(${155 + i * 30} 40% ${20 + i * 5}%)` }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span>5 people studying Physics right now</span>
          </div>
        </motion.div>
      </header>

      {/* Stats */}
      <section id="stats" className="py-20 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-3xl md:text-4xl font-display font-bold text-gradient-green">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Not a Study App. A <span className="text-gradient-green">Discipline System.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every feature engineered to maximize focus and accountability.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="group p-6 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-green-subtle transition-all">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24 px-6 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-3xl md:text-5xl font-display font-bold text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>

          <div className="space-y-12">
            {[
              { step: "01", title: "Set Your Profile", desc: "Select exam, subjects, available slots, and daily goals." },
              { step: "02", title: "Get AI-Matched", desc: "Our engine groups 5–10 students by subject, urgency, and focus score." },
              { step: "03", title: "Enter the Room", desc: "Timed session. Locked in. Goals set. No distractions." },
              { step: "04", title: "Build Your Score", desc: "Every session builds your Focus Score. Higher score → better groups." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="flex gap-6 items-start"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl font-display font-bold text-primary/30">{item.step}</div>
                <div>
                  <h3 className="text-xl font-display font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-radial-glow" />
        <motion.div
          className="relative max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Ready to Study <span className="text-gradient-green">Seriously?</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Join the next session. No signup walls. Just pick your subject and go.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate("/join-session")}>
            Join Next Session
            <ArrowRight className="ml-1" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold text-foreground">SyncStudy</span>
          </div>
          <p>Discipline-tech for serious students.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
