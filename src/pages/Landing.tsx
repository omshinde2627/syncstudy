import { motion } from "framer-motion";
import { ArrowRight, Users, Target, Brain, Shield, Zap, Timer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: Brain, title: "AI-Matched Groups", description: "Matched by exam, subject, urgency and focus score. No random grouping." },
  { icon: Timer, title: "Timed Sessions", description: "Pomodoro or custom timers. Locked sessions with exit penalties." },
  { icon: Target, title: "Focus Scoring", description: "0–100 behavioral score. High discipline users matched together." },
  { icon: Shield, title: "Accountability Engine", description: "Session tracking, peer ratings, consistency monitoring. No hiding." },
  { icon: Zap, title: "Performance Analytics", description: "Heatmaps, streaks, subject distribution. Know exactly where you stand." },
  { icon: Users, title: "Anonymous & Focused", description: "No names. No socializing. Just subject, focus level, and work." },
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
    <div className="min-h-screen bg-background overflow-hidden relative">

      {/* ── Hero ── */}
      <header className="relative min-h-screen flex flex-col bg-white overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 pointer-events-none">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/90" />
          {/* Soft colored orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[hsl(263,70%,58%)] opacity-10 blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-[hsl(217,91%,55%)] opacity-10 blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 lg:px-14 py-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(263,70%,58%)] to-[hsl(217,91%,55%)] flex items-center justify-center shadow-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight text-gray-900">SyncStudy</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#stats" className="hover:text-gray-900 transition-colors">Stats</a>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="h-9 px-5 rounded-xl border-2 border-[hsl(263,70%,58%)] text-[hsl(263,70%,58%)] text-sm font-semibold hover:bg-[hsl(263,70%,58%)] hover:text-white transition-all duration-200"
          >
            Enter Platform
          </button>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 pt-12">
          <div className="max-w-5xl mx-auto text-center">

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-7"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-[hsl(263,70%,58%)]/30 text-sm text-[hsl(263,70%,45%)] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                47 students studying right now
                <Sparkles className="h-3 w-3 ml-0.5 opacity-70" />
              </div>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-[88px] font-display font-bold tracking-tight leading-[1.05] mb-6 text-gray-900"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Stop Studying Alone.{" "}
              <br className="hidden md:block" />
              <span className="text-gradient-brand">Study Like It Matters.</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              AI-matched accountability sessions for serious students.
              Timed. Tracked. No excuses.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Primary CTA — vivid gradient */}
              <button
                onClick={() => navigate("/join-session")}
                className="group inline-flex items-center justify-center gap-2 h-14 px-10 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-[hsl(263,70%,58%)] to-[hsl(217,91%,55%)] shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
              >
                Join Next Session
                <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
              {/* Secondary CTA — white with border */}
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center justify-center h-14 px-10 rounded-2xl text-base font-semibold text-gray-800 bg-white border-2 border-gray-200 shadow hover:border-[hsl(263,70%,58%)]/50 hover:text-[hsl(263,70%,58%)] hover:shadow-md active:scale-[0.97] transition-all duration-200"
              >
                View Dashboard
              </button>
            </motion.div>

            {/* Live avatar row */}
            <motion.div
              className="mt-14 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-4 text-sm text-gray-600 bg-white/80 backdrop-blur rounded-full px-5 py-2.5 border border-gray-200 shadow-sm">
                <div className="flex -space-x-2.5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-7 w-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-semibold text-white"
                      style={{ background: `linear-gradient(135deg, hsl(${250 + i * 15}, 70%, 55%), hsl(${210 + i * 15}, 80%, 50%))` }}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span>5 people studying Physics right now</span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ── Stats ── */}
      <section id="stats" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="text-3xl md:text-4xl font-display font-bold text-gradient-brand">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 tracking-tight">
              Not a Study App.{" "}
              <span className="text-gradient-brand">A Discipline System.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Every feature engineered to maximize focus and accountability.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="group p-6 rounded-2xl glass-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-default"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-brand-subtle border border-primary/20 flex items-center justify-center mb-4 group-hover:shadow-glow-sm transition-all duration-300">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-display font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-radial-blue pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <motion.h2
            className="text-3xl md:text-5xl font-display font-bold text-center mb-16 tracking-tight"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>

          <div className="space-y-8">
            {[
              { step: "01", title: "Set Your Profile", desc: "Select exam, subjects, available slots, and daily goals." },
              { step: "02", title: "Get AI-Matched", desc: "Our engine groups 5–10 students by subject, urgency, and focus score." },
              { step: "03", title: "Enter the Room", desc: "Timed session. Locked in. Goals set. No distractions." },
              { step: "04", title: "Build Your Score", desc: "Every session builds your Focus Score. Higher score → better groups." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="flex gap-6 items-start p-5 rounded-2xl glass-card hover:border-primary/20 transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl font-display font-bold text-gradient-brand opacity-60 min-w-[2.5rem]">{item.step}</div>
                <div>
                  <h3 className="text-lg font-display font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6 relative">
        <div className="absolute inset-0 bg-radial-purple pointer-events-none" />
        <motion.div
          className="relative max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 tracking-tight">
            Ready to Study <span className="text-gradient-brand">Seriously?</span>
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join the next session. No signup walls. Just pick your subject and go.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate("/join-session")} className="group">
            Join Next Session
            <ArrowRight className="ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-[hsl(263,70%,58%)] to-[hsl(217,91%,55%)] flex items-center justify-center">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="font-display font-semibold text-foreground">SyncStudy</span>
          </div>
          <p>Discipline-tech for serious students.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
