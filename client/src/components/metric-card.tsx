import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

  return (
    <Card className="p-6 hover-elevate" data-testid={testId}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "rounded-lg p-2.5",
          variant === "danger" && "bg-destructive/10",
          variant === "warning" && "bg-warning/10",
          variant === "success" && "bg-success/10",
          variant === "default" && "bg-primary/10"
        )}>
          <Icon className={cn("h-5 w-5", variantColors[variant])} />
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-medium flex items-center gap-1",
            trend.direction === "up" ? "text-destructive" : "text-success"
          )}>
            {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold font-mono" data-testid={`${testId}-value`}>
          {value}
        </div>
        <p className="text-sm text-muted-foreground">
          {title}
        </p>
      </div>
    </Card>
  );
}
