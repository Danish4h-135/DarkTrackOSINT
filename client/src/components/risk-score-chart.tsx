import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RiskScoreChartProps {
  score: number;
  label?: string;
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
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">{label}</p>
          <div className="text-5xl font-bold font-mono mb-2" data-testid="safety-score">
            {safetyScore}
          </div>
          <p className={cn("text-sm font-medium", risk.color)}>
            {risk.level}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Risk Level</span>
            <span className="font-medium">{score}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-500 rounded-full", getProgressColor(score))}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t text-center">
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
        </div>
      </div>
    </Card>
  );
}
