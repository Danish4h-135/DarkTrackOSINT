import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Calendar, Database, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Breach } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface BreachCardProps {
  breach: Breach;
  scanId?: string;
}

export function BreachCard({ breach, scanId }: BreachCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [, setLocation] = useLocation();

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-warning";
      case "low":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className="p-6 transition-shadow hover:shadow-lg">
        <div className="flex items-start gap-4">
          <motion.div 
            className={cn(
              "rounded-lg p-2 flex-shrink-0",
              breach.severity === "high" && "bg-destructive/10",
              breach.severity === "medium" && "bg-warning/10",
              breach.severity === "low" && "bg-muted"
            )}
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ duration: 0.2 }}
          >
            <AlertTriangle className={cn("h-5 w-5", getSeverityColor(breach.severity))} />
          </motion.div>
          
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{breach.name}</h3>
                {breach.domain && (
                  <p className="text-sm text-muted-foreground">{breach.domain}</p>
                )}
              </div>
              <Badge variant={getSeverityVariant(breach.severity)} className="capitalize">
                {breach.severity}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {breach.breachDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Breach: {breach.breachDate}</span>
                </div>
              )}
              {breach.pwnCount !== null && (
                <div className="flex items-center gap-1.5">
                  <Database className="h-4 w-4" />
                  <span>{breach.pwnCount.toLocaleString()} accounts</span>
                </div>
              )}
            </div>

            {breach.dataClasses && breach.dataClasses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {breach.dataClasses.slice(0, expanded ? undefined : 5).map((dataClass, idx) => (
                  <motion.div
                    key={dataClass}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Badge variant="outline" className="text-xs">
                      {dataClass}
                    </Badge>
                  </motion.div>
                ))}
                {!expanded && breach.dataClasses.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{breach.dataClasses.length - 5} more
                  </Badge>
                )}
              </div>
            )}

            <AnimatePresence>
              {breach.description && expanded && (
                <motion.p 
                  className="text-sm text-muted-foreground pt-2 border-t"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {breach.description}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-2 items-center mt-2 -ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="transition-all hover:scale-105"
                data-testid={`button-expand-breach-${breach.id}`}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show More
                  </>
                )}
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  const breachContext = {
                    scanId: scanId || breach.scanId,
                    breachId: breach.id,
                    breachName: breach.name,
                    domain: breach.domain,
                    severity: breach.severity,
                    description: breach.description,
                    dataClasses: breach.dataClasses,
                  };
                  sessionStorage.setItem('breachContext', JSON.stringify(breachContext));
                  setLocation('/chat');
                }}
                className="transition-all hover:scale-105"
                data-testid={`button-solve-breach-${breach.id}`}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Solve
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
