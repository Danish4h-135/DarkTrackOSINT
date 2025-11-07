import { HelpCircle, Shield, Search, Brain, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Help() {
  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Help & FAQ</h1>
        <p className="text-muted-foreground">
          Learn how DarkTrack protects your digital footprint
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">What is DarkTrack?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                DarkTrack is an ethical OSINT (Open Source Intelligence) dashboard that analyzes 
                your digital footprint across the internet. It scans public data sources to identify 
                potential security risks, data breaches, and exposed information associated with your 
                email address.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">How does scanning work?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When you run a scan, DarkTrack queries public breach databases like HaveIBeenPwned 
                to check if your email has been compromised in known data breaches. We also perform 
                basic domain lookups to assess your online presence. All data comes from legitimate, 
                publicly available sources.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">What is AI Analysis?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our AI-powered analysis uses advanced algorithms to interpret your scan results 
                and provide personalized security recommendations. It calculates your risk score, 
                identifies patterns in breached data, and suggests specific actions you can take 
                to improve your digital security.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">How often should I scan?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We recommend running a scan monthly to stay updated on new breaches and changes 
                to your digital footprint. If you receive notifications about a new major breach, 
                run an immediate scan to check if you're affected.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-primary bg-primary/5">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Privacy & Ethics</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                • <strong>Public Data Only:</strong> We only access publicly available information
              </p>
              <p>
                • <strong>No Private Access:</strong> We never access private databases or accounts
              </p>
              <p>
                • <strong>Secure Storage:</strong> Your scan results are encrypted and private
              </p>
              <p>
                • <strong>No Sharing:</strong> Your data is never sold or shared with third parties
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
