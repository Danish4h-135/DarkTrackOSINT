import { Sparkles, Shield, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AIRecommendationsPanelProps {
  summary?: string;
  recommendations?: string[];
}

export function AIRecommendationsPanel({ 
  summary, 
  recommendations 
}: AIRecommendationsPanelProps) {
  if (!summary && (!recommendations || recommendations.length === 0)) {
    return null;
  }

  return (
    <Card className="p-6 border-l-4 border-l-primary bg-primary/5">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">AI Security Analysis</h3>
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
            {summary && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {summary}
              </p>
            )}
          </div>

          {recommendations && recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Recommended Actions:</h4>
              <ul className="space-y-2">
                {recommendations.map((recommendation, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-3 text-sm hover-elevate rounded-lg p-3 -mx-3"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
