import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  score: number;
  showBars?: boolean;
  className?: string;
  testId?: string;
}

type RiskCategory = {
  level: string;
  color: string;
  barColor: string;
  bars: number;
};

function getRiskCategory(score: number): RiskCategory {
  if (score < 20) {
    return {
      level: "Safe",
      color: "text-green-600 dark:text-green-400",
      barColor: "bg-green-500",
      bars: 1,
    };
  }
  if (score < 40) {
    return {
      level: "Low Risk",
      color: "text-teal-600 dark:text-teal-400",
      barColor: "bg-teal-500",
      bars: 2,
    };
  }
  if (score < 60) {
    return {
      level: "Medium Risk",
      color: "text-amber-600 dark:text-amber-400",
      barColor: "bg-amber-500",
      bars: 3,
    };
  }
  if (score < 80) {
    return {
      level: "High Risk",
      color: "text-orange-600 dark:text-orange-400",
      barColor: "bg-orange-500",
      bars: 4,
    };
  }
  return {
    level: "Critical",
    color: "text-red-600 dark:text-red-400",
    barColor: "bg-red-500",
    bars: 5,
  };
}

export function RiskBadge({ score, showBars = true, className, testId }: RiskBadgeProps) {
  const category = getRiskCategory(score);

  return (
    <div className={cn("flex items-center gap-2", className)} data-testid={testId}>
      {showBars && (
        <div className="flex gap-1" data-testid={`${testId}-bars`}>
          {[1, 2, 3, 4, 5].map((index) => (
            <motion.div
              key={index}
              className={cn(
                "w-1.5 h-4 rounded-full",
                index <= category.bars ? category.barColor : "bg-gray-300 dark:bg-gray-700"
              )}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                ease: [0.22, 1, 0.36, 1]
              }}
            />
          ))}
        </div>
      )}
      <motion.span
        className={cn("text-sm font-semibold", category.color)}
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        data-testid={`${testId}-label`}
      >
        {category.level}
      </motion.span>
    </div>
  );
}
