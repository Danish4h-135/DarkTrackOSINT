import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { attachEmailSchema, type AttachEmail } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";

export default function AttachEmail() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AttachEmail>({
    resolver: zodResolver(attachEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: AttachEmail) {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/attach-email", values);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to attach email");
      }

      setSuccess(data.message || "Email attached successfully!");
      
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to attach email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function skipForNow() {
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0b0f14' }}>
      <div className="w-full max-w-md">
        <Card className="border" style={{ borderColor: '#1f2937', backgroundColor: '#111827' }}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Add your email</CardTitle>
            <CardDescription className="text-gray-400">
              This helps us secure your account and send you important updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-500 text-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10 bg-gray-900 border-gray-700 text-white"
                            data-testid="input-email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  style={{ backgroundColor: '#00B5FF', color: '#0b0f14' }}
                  data-testid="button-submit"
                >
                  {isLoading ? "Adding email..." : "Add email"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                  onClick={skipForNow}
                  data-testid="button-skip"
                >
                  Skip for now
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
