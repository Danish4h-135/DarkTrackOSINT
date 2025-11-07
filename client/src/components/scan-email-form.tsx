import { useState } from "react";
import { Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface ScanEmailFormProps {
  onScan: (email: string) => void;
  isScanning: boolean;
}

export function ScanEmailForm({ onScan, isScanning }: ScanEmailFormProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onScan(email.trim());
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-medium">
            Scan Email Address
          </Label>
          <p className="text-sm text-muted-foreground">
            Enter an email address to scan for data breaches and online exposure
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
              disabled={isScanning}
              data-testid="input-scan-email"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isScanning || !email.trim()}
            data-testid="button-run-scan"
          >
            <Search className="h-4 w-4 mr-2" />
            {isScanning ? "Scanning..." : "Run Scan"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
