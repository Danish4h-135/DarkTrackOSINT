import { Shield, Lock, Eye, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Shield className="h-12 w-12 text-primary" />
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl font-bold tracking-tight">DarkTrack</h1>
              <p className="text-xl text-muted-foreground mt-2">
                Secure Your Digital Footprint
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground">
              AI-powered OSINT analysis that reveals your digital exposure across the internet. 
              Get actionable insights to protect your online presence.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              asChild 
              className="w-full h-12 text-base"
              data-testid="button-login"
            >
              <a href="/api/login">
                <Lock className="h-4 w-4 mr-2" />
                Sign In to Continue
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                Breach Detection
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                AI Analysis
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                OSINT Scanning
              </p>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-4 border-t">
            DarkTrack uses only public data sources and does not access private information.
          </p>
        </Card>
      </div>
    </div>
  );
}
