import { motion } from "framer-motion";

interface FocusScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

const getLevel = (score: number) => {
  if (score >= 95) return { label: "Apex", color: "hsl(155 100% 45%)" };
  if (score >= 80) return { label: "Elite", color: "hsl(155 100% 45%)" };
  if (score >= 60) return { label: "Focused", color: "hsl(210 100% 55%)" };
  if (score >= 40) return { label: "Stabilizing", color: "hsl(38 92% 50%)" };
  return { label: "Drifter", color: "hsl(0 72% 51%)" };
};

const FocusScoreRing = ({ score, size = 180, strokeWidth = 8, showLabel = true }: FocusScoreRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const level = getLevel(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(210 8% 16%)"
          strokeWidth={strokeWidth}
        />
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
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${level.color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-bold" style={{ color: level.color }}>
          {score}
        </span>
        {showLabel && (
          <span className="text-xs text-muted-foreground mt-1">{level.label}</span>
        )}
      </div>
    </div>
  );
};

export default FocusScoreRing;
