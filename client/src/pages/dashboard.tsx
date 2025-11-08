import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Shield, AlertTriangle, Globe, ShieldCheck, Search, Save, ScanLine } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MetricCard } from "@/components/metric-card";
import { BreachCard } from "@/components/breach-card";
import { AIRecommendationsPanel } from "@/components/ai-recommendations-panel";
import { RiskBadge } from "@/components/risk-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Scan, Breach } from "@shared/schema";

interface DashboardData {
  scans: (Scan & { breaches: Breach[] })[];
  overview: {
    totalScans: number;
    avgRiskScore: number;
    highRiskFindings: number;
    mediumRiskFindings: number;
    lowRiskFindings: number;
  };
  quota: {
    manualLookupAvailable: boolean;
    nextLookupAvailableAt: string | null;
  };
}

interface LookupResult {
  email: string;
  breachCount: number;
  riskScore: number;
  securedDataPercentage: number;
  aiSummary: string;
  aiRecommendations: string[];
  breaches: any[];
}

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [quickCheckEmail, setQuickCheckEmail] = useState("");
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);

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

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    retry: false,
    enabled: isAuthenticated,
  });

  const selfScanMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/scan/self", {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
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

  const lookupMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/lookup", { email });
      return await res.json() as LookupResult;
    },
    onSuccess: (data: LookupResult) => {
      setLookupResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Lookup Complete",
        description: "Analysis results are ready. Click Save to store them.",
      });
    },
    onError: (error: any) => {
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
        title: "Lookup Failed",
        description: error.message || "Failed to complete lookup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveLookupMutation = useMutation({
    mutationFn: async (data: LookupResult) => {
      const res = await apiRequest("POST", "/api/lookup/save", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setLookupResult(null);
      setQuickCheckEmail("");
      toast({
        title: "Results Saved",
        description: "Lookup results have been saved to your scan history.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save results.",
        variant: "destructive",
      });
    },
  });

  const handleQuickCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickCheckEmail.trim()) {
      lookupMutation.mutate(quickCheckEmail.trim());
    }
  };

  const handleSaveLookup = () => {
    if (lookupResult) {
      saveLookupMutation.mutate(lookupResult);
    }
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

  const latestScan = dashboardData?.scans[0];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ScanLine className="h-5 w-5" />
                Scan Your Data
              </h3>
              <p className="text-sm text-muted-foreground">
                Run a comprehensive OSINT scan on your registered email address
              </p>
            </div>
            <Button 
              onClick={() => selfScanMutation.mutate()}
              disabled={selfScanMutation.isPending}
              className="w-full"
              data-testid="button-scan-self"
            >
              <Shield className="h-4 w-4 mr-2" />
              {selfScanMutation.isPending ? "Scanning..." : "Scan My Data"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <form onSubmit={handleQuickCheck} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Quick Check
                </h3>
                {!dashboardData?.quota.manualLookupAvailable && (
                  <Badge variant="secondary" data-testid="badge-quota-used">
                    Used
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {dashboardData?.quota.manualLookupAvailable
                  ? "Check any email address (1 per 24 hours)"
                  : `Next lookup available: ${new Date(dashboardData?.quota.nextLookupAvailableAt || "").toLocaleString()}`
                }
              </p>
            </div>
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="email@example.com"
                value={quickCheckEmail}
                onChange={(e) => setQuickCheckEmail(e.target.value)}
                required
                disabled={lookupMutation.isPending || !dashboardData?.quota.manualLookupAvailable}
                data-testid="input-quick-check"
              />
              <Button 
                type="submit" 
                disabled={lookupMutation.isPending || !dashboardData?.quota.manualLookupAvailable || !quickCheckEmail.trim()}
                data-testid="button-quick-check"
              >
                {lookupMutation.isPending ? "Checking..." : "Check"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {lookupResult && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quick Check Results</CardTitle>
              <Button 
                onClick={handleSaveLookup}
                disabled={saveLookupMutation.isPending}
                variant="default"
                data-testid="button-save-lookup"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveLookupMutation.isPending ? "Saving..." : "Save Results"}
              </Button>
            </div>
            <CardDescription>
              Analysis for {lookupResult.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Breaches Found"
                value={lookupResult.breachCount}
                icon={AlertTriangle}
                variant={lookupResult.breachCount > 0 ? "danger" : "default"}
                testId="metric-lookup-breaches"
              />
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg p-2.5 bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <RiskBadge score={lookupResult.riskScore} testId="risk-lookup" />
                    <p className="text-sm text-muted-foreground">Risk Assessment</p>
                  </div>
                </div>
              </Card>
              <MetricCard
                title="Secured Data"
                value={`${lookupResult.securedDataPercentage}%`}
                icon={ShieldCheck}
                variant="success"
                testId="metric-lookup-secured"
              />
            </div>
            {lookupResult.aiSummary && (
              <div className="space-y-2">
                <h4 className="font-semibold">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">{lookupResult.aiSummary}</p>
              </div>
            )}
            {lookupResult.aiRecommendations && lookupResult.aiRecommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Recommendations</h4>
                <ul className="space-y-1 text-sm">
                  {lookupResult.aiRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {lookupResult.breaches && lookupResult.breaches.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Breaches ({lookupResult.breaches.length})</h4>
                <div className="space-y-2">
                  {lookupResult.breaches.slice(0, 3).map((breach, idx) => (
                    <div key={idx} className="text-sm p-3 bg-muted rounded-md">
                      <div className="font-medium">{breach.name}</div>
                      {breach.domain && <div className="text-muted-foreground">Domain: {breach.domain}</div>}
                      <Badge variant={breach.severity === "high" ? "destructive" : breach.severity === "medium" ? "default" : "secondary"} className="mt-2">
                        {breach.severity}
                      </Badge>
                    </div>
                  ))}
                  {lookupResult.breaches.length > 3 && (
                    <div className="text-sm text-muted-foreground text-center">
                      ...and {lookupResult.breaches.length - 3} more breaches
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {dashboardLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : dashboardData && latestScan ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Scans"
              value={dashboardData.overview.totalScans}
              icon={ScanLine}
              testId="metric-total-scans"
            />
            <MetricCard
              title="High Risk"
              value={dashboardData.overview.highRiskFindings}
              icon={AlertTriangle}
              variant="danger"
              testId="metric-high-risk"
            />
            <MetricCard
              title="Medium Risk"
              value={dashboardData.overview.mediumRiskFindings}
              icon={AlertTriangle}
              variant="warning"
              testId="metric-medium-risk"
            />
            <MetricCard
              title="Low Risk"
              value={dashboardData.overview.lowRiskFindings}
              icon={ShieldCheck}
              variant="success"
              testId="metric-low-risk"
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
                <h2 className="text-2xl font-semibold">Recent Breach Findings</h2>
                {latestScan.breaches && latestScan.breaches.length > 0 ? (
                  <div className="space-y-4">
                    {latestScan.breaches.map((breach) => (
                      <BreachCard key={breach.id} breach={breach} scanId={latestScan.id} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No breaches found. Your email appears to be secure!
                  </div>
                )}
              </div>

              {dashboardData.scans.length > 1 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Scan History</h2>
                  <div className="space-y-2">
                    {dashboardData.scans.slice(1, 6).map((scan) => (
                      <Card key={scan.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{scan.email}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(scan.createdAt!).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-4 items-center">
                            <RiskBadge score={scan.riskScore} showBars={false} />
                            <Badge variant="outline">
                              {scan.breachCount} breaches
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Overall Risk Assessment</p>
                  </div>
                  <div className="flex flex-col items-center justify-center py-8">
                    <RiskBadge score={latestScan.riskScore} testId="risk-latest-scan" />
                  </div>
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Risk Categories</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-muted-foreground">Safe (&lt;20)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                        <span className="text-muted-foreground">Low (&lt;40)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-muted-foreground">Medium (&lt;60)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-muted-foreground">High (&lt;80)</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-muted-foreground">Critical (≥80)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
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
