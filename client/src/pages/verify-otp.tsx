import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyOtpSchema, type VerifyOtp } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { Shield, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";

export default function VerifyOTP() {
  const [location, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const phone = params.get("phone");
    if (phone) {
      setPhoneNumber(decodeURIComponent(phone));
    } else {
      setLocation("/signup-phone");
    }
  }, [setLocation]);

  const form = useForm<VerifyOtp>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      phoneNumber: "",
      otpCode: "",
    },
  });

  useEffect(() => {
    if (phoneNumber) {
      form.setValue("phoneNumber", phoneNumber);
    }
  }, [phoneNumber, form]);

  async function onSubmit(values: VerifyOtp) {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/verify-otp", values);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setSuccess(data.message || "Verification successful!");

      if (data.requiresEmailAttachment) {
        setTimeout(() => {
          setLocation("/attach-email");
        }, 1500);
      } else {
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function resendOTP() {
    setError(null);
    setSuccess(null);
    setIsResending(true);

    try {
      const response = await apiRequest("POST", "/api/auth/resend-otp", { phoneNumber });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      setSuccess(data.message || "OTP resent successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0b0f14' }}>
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6 text-gray-400 hover:text-white"
          onClick={() => setLocation("/signup-phone")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="border" style={{ borderColor: '#1f2937', backgroundColor: '#111827' }}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Verify your phone</CardTitle>
            <CardDescription className="text-gray-400">
              Enter the 6-digit code sent to {phoneNumber}
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
                  name="otpCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Verification Code</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            {...field}
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            className="pl-10 bg-gray-900 border-gray-700 text-white text-center text-2xl tracking-widest"
                            data-testid="input-otp"
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
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                  onClick={resendOTP}
                  disabled={isResending}
                  data-testid="button-resend"
                >
                  {isResending ? "Resending..." : "Resend code"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
