import { useEffect } from "react";
import { Settings as SettingsIcon, User, Bell, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
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

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  if (authLoading) {
    return (
      <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <User className="h-5 w-5 text-primary mt-1" />
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Profile Information</h3>
                <p className="text-sm text-muted-foreground">
                  Your account details from authentication provider
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : "User"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <Bell className="h-5 w-5 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Notification preferences coming soon
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="h-5 w-5 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Privacy & Security</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your data is protected and never shared
              </p>
              <div className="text-xs text-muted-foreground space-y-2 pt-4 border-t">
                <p>
                  • DarkTrack uses only public OSINT data sources
                </p>
                <p>
                  • We do not access or store your private information
                </p>
                <p>
                  • All scans are encrypted and stored securely
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
