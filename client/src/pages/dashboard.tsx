import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Shield, AlertTriangle, Globe, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MetricCard } from "@/components/metric-card";
import { BreachCard } from "@/components/breach-card";
import { AIRecommendationsPanel } from "@/components/ai-recommendations-panel";
import { RiskScoreChart } from "@/components/risk-score-chart";
import { ScanEmailForm } from "@/components/scan-email-form";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Scan, Breach } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

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

  const { data: latestScan, isLoading: scanLoading } = useQuery<Scan>({
    queryKey: ["/api/scans/latest"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: breaches = [], isLoading: breachesLoading } = useQuery<Breach[]>({
    queryKey: ["/api/breaches", latestScan?.id],
    retry: false,
    enabled: !!latestScan?.id,
  });

  const scanMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest("POST", "/api/scan", { email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scans/latest"] });
      toast({
        title: "Scan Complete",
        description: "Your digital footprint analysis is ready.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to complete scan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleScan = (email: string) => {
    scanMutation.mutate(email);
  };

  if (authLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">
          Welcome back, {user?.firstName || "User"}
        </h1>
        <p className="text-muted-foreground">
          {latestScan 
            ? `Last scan: ${new Date(latestScan.createdAt!).toLocaleDateString()}`
            : "Run your first scan to analyze your digital footprint"
          }
        </p>
      </div>

      <ScanEmailForm onScan={handleScan} isScanning={scanMutation.isPending} />

      {scanLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : latestScan ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Breaches Found"
              value={latestScan.breachCount}
              icon={AlertTriangle}
              variant={latestScan.breachCount > 0 ? "danger" : "default"}
              testId="metric-breaches"
            />
            <MetricCard
              title="Profiles Detected"
              value={latestScan.profilesDetected}
              icon={Globe}
              testId="metric-profiles"
            />
            <MetricCard
              title="Risk Score"
              value={latestScan.riskScore}
              icon={Shield}
              variant={
                latestScan.riskScore > 60 
                  ? "danger" 
                  : latestScan.riskScore > 30 
                  ? "warning" 
                  : "success"
              }
              testId="metric-risk-score"
            />
            <MetricCard
              title="Secured Data"
              value={`${latestScan.securedDataPercentage}%`}
              icon={ShieldCheck}
              variant="success"
              testId="metric-secured-data"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {latestScan.aiSummary && (
                <AIRecommendationsPanel 
                  summary={latestScan.aiSummary}
                  recommendations={latestScan.aiRecommendations || []}
                />
              )}

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Breach Findings</h2>
                {breachesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-40" />
                    ))}
                  </div>
                ) : breaches.length > 0 ? (
                  <div className="space-y-4">
                    {breaches.map((breach) => (
                      <BreachCard key={breach.id} breach={breach} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No breaches found. Your email appears to be secure!
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <RiskScoreChart score={latestScan.riskScore} />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="rounded-full bg-primary/10 p-6 inline-block mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Scans Yet</h3>
          <p className="text-muted-foreground">
            Run your first scan to see your digital security analysis
          </p>
        </div>
      )}
    </div>
  );
}
