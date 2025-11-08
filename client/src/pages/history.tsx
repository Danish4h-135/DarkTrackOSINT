import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { History as HistoryIcon, Calendar, Mail, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge } from "@/components/risk-badge";
import type { Scan } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function History() {
  const { toast } = useToast();
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: scans = [], isLoading } = useQuery<Scan[]>({
    queryKey: ["/api/scans"],
    retry: false,
    enabled: isAuthenticated,
  });


  if (authLoading || isLoading) {
    return (
      <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Scan History</h1>
        <p className="text-muted-foreground">
          View all your previous security scans and their results
        </p>
      </div>

      {scans.length > 0 ? (
        <div className="space-y-4">
          {scans.map((scan) => {
            return (
              <Card key={scan.id} className="p-6 hover-elevate" data-testid={`scan-${scan.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="rounded-lg bg-primary/10 p-3 flex-shrink-0">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{scan.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(scan.createdAt!).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                        <RiskBadge score={scan.riskScore} />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Breaches</div>
                          <div className={cn(
                            "text-2xl font-bold font-mono",
                            scan.breachCount > 0 && "text-destructive"
                          )}>
                            {scan.breachCount}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Profiles</div>
                          <div className="text-2xl font-bold font-mono">
                            {scan.profilesDetected}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Secured</div>
                          <div className="text-2xl font-bold font-mono text-success">
                            {scan.securedDataPercentage}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="rounded-full bg-primary/10 p-6 inline-block mb-4">
            <HistoryIcon className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Scan History</h3>
          <p className="text-muted-foreground">
            Your scan history will appear here after you run your first scan
          </p>
        </div>
      )}
    </div>
  );
}
