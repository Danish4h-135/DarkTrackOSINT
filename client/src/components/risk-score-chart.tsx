import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

interface RiskScoreChartProps {
  score: number;
  label?: string;
}

function AnimatedScore({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, value, isInView]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toString();
      }
    });
    return unsubscribe;
  }, [springValue]);

  return <span ref={ref}>0</span>;
}

export function RiskScoreChart({ score, label = "Digital Safety Score" }: RiskScoreChartProps) {
  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: "Low Risk", color: "text-success" };
    if (score <= 60) return { level: "Medium Risk", color: "text-warning" };
    return { level: "High Risk", color: "text-destructive" };
  };

  const getProgressColor = (score: number) => {
    if (score <= 30) return "bg-success";
    if (score <= 60) return "bg-warning";
    return "bg-destructive";
  };

  const risk = getRiskLevel(score);
  const safetyScore = 100 - score;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="p-6">
        <div className="space-y-6">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm text-muted-foreground mb-2">{label}</p>
            <div className="text-5xl font-bold font-mono mb-2" data-testid="safety-score">
              <AnimatedScore value={safetyScore} />
            </div>
            <motion.p 
              className={cn("text-sm font-medium", risk.color)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {risk.level}
            </motion.p>
          </motion.div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Risk Level</span>
              <span className="font-medium">{score}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className={cn("h-full rounded-full", getProgressColor(score))}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          <motion.div 
            className="grid grid-cols-3 gap-4 pt-4 border-t text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div>
              <div className="text-xs text-muted-foreground mb-1">Low</div>
              <div className="text-sm font-medium text-success">0-30</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Medium</div>
              <div className="text-sm font-medium text-warning">31-60</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">High</div>
              <div className="text-sm font-medium text-destructive">61-100</div>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
