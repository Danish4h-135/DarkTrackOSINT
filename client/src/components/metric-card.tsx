import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  variant?: "default" | "danger" | "warning" | "success";
  testId?: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
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

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = "default",
  testId
}: MetricCardProps) {
  const variantColors = {
    default: "text-primary",
    danger: "text-destructive",
    warning: "text-warning",
    success: "text-success",
  };

  const isNumeric = typeof value === "number";
  const numericValue = isNumeric ? value : parseFloat(value as string);
  const shouldAnimate = isNumeric || !isNaN(numericValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="p-6 transition-shadow hover:shadow-lg" data-testid={testId}>
        <div className="flex items-start justify-between mb-4">
          <motion.div 
            className={cn(
              "rounded-lg p-2.5",
              variant === "danger" && "bg-destructive/10",
              variant === "warning" && "bg-warning/10",
              variant === "success" && "bg-success/10",
              variant === "default" && "bg-primary/10"
            )}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className={cn("h-5 w-5", variantColors[variant])} />
          </motion.div>
          {trend && (
            <motion.div 
              className={cn(
                "text-xs font-medium flex items-center gap-1",
                trend.direction === "up" ? "text-destructive" : "text-success"
              )}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
            </motion.div>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-bold font-mono" data-testid={`${testId}-value`}>
            {shouldAnimate ? (
              <AnimatedNumber value={numericValue} />
            ) : (
              value
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
