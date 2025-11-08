import { Sparkles, Shield, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="p-6 border-l-4 border-l-primary bg-primary/5 overflow-hidden">
        <div className="flex items-start gap-4">
          <motion.div 
            className="rounded-lg bg-primary/10 p-2 flex-shrink-0"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
          >
            <Sparkles className="h-5 w-5 text-primary" />
          </motion.div>
          
          <div className="flex-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">AI Security Analysis</h3>
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>
              {summary && (
                <motion.p 
                  className="text-sm text-muted-foreground leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {summary}
                </motion.p>
              )}
            </motion.div>

            {recommendations && recommendations.length > 0 && (
              <div className="space-y-3">
                <motion.h4 
                  className="font-medium text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Recommended Actions:
                </motion.h4>
                <ul className="space-y-2">
                  {recommendations.map((recommendation, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start gap-3 text-sm rounded-lg p-3 -mx-3 hover:bg-primary/5 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ x: 4 }}
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{recommendation}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
