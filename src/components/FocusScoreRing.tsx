import { motion } from "framer-motion";

interface FocusScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

const getLevel = (score: number) => {
  if (score >= 95) return { label: "Apex",        color: "hsl(263 70% 68%)", glow: "hsl(263 70% 58%)" };
  if (score >= 80) return { label: "Elite",       color: "hsl(263 70% 62%)", glow: "hsl(263 70% 58%)" };
  if (score >= 60) return { label: "Focused",     color: "hsl(199 89% 52%)", glow: "hsl(199 89% 48%)" };
  if (score >= 40) return { label: "Stabilizing", color: "hsl(38 92% 50%)",  glow: "hsl(38 92% 44%)" };
  return             { label: "Drifter",          color: "hsl(0 72% 55%)",   glow: "hsl(0 72% 51%)" };
};

const FocusScoreRing = ({ score, size = 180, strokeWidth = 9, showLabel = true }: FocusScoreRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const level = getLevel(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Ambient glow behind ring */}
      <div
        className="absolute inset-4 rounded-full blur-xl opacity-20"
        style={{ background: level.glow }}
      />

      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(228 14% 16%)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={level.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.4, ease: [0.34, 1.2, 0.64, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${level.glow})` }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-display font-bold tabular-nums" style={{ color: level.color }}>
          {score}
        </span>
        {showLabel && (
          <span className="text-xs text-muted-foreground mt-1 font-medium tracking-wide">
            {level.label}
          </span>
        )}
      </div>
    </div>
  );
};

export default FocusScoreRing;
