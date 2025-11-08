import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupPhoneSchema, type SignupPhone } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { Phone, User, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";

export default function SignupPhone() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const form = useForm<SignupPhone>({
    resolver: zodResolver(signupPhoneSchema),
    defaultValues: {
      phoneNumber: "",
      firstName: "",
      lastName: "",
    },
  });

  async function onSubmit(values: SignupPhone) {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/signup-phone", values);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setPhoneNumber(values.phoneNumber);
      setSuccess(data.message || "OTP sent successfully!");
      
      setTimeout(() => {
        setLocation(`/verify-otp?phone=${encodeURIComponent(values.phoneNumber)}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to sign up. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0b0f14' }}>
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6 text-gray-400 hover:text-white"
          onClick={() => setLocation("/")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Button>

        <Card className="border" style={{ borderColor: '#1f2937', backgroundColor: '#111827' }}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Sign up with phone</CardTitle>
            <CardDescription className="text-gray-400">
              We'll send you a verification code via SMS
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">First Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              {...field}
                              placeholder="John"
                              className="pl-10 bg-gray-900 border-gray-700 text-white"
                              data-testid="input-firstname"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Last Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              {...field}
                              placeholder="Doe"
                              className="pl-10 bg-gray-900 border-gray-700 text-white"
                              data-testid="input-lastname"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            {...field}
                            type="tel"
                            placeholder="+1234567890"
                            className="pl-10 bg-gray-900 border-gray-700 text-white"
                            data-testid="input-phone"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500 mt-1">
                        Use E.164 format (e.g., +1234567890)
                      </p>
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
                  {isLoading ? "Sending code..." : "Send verification code"}
                </Button>
              </form>
            </Form>

            <div className="mt-4 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <a
                href="/login-email"
                className="font-medium hover:underline"
                style={{ color: '#00B5FF' }}
                data-testid="link-login"
              >
                Log in
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
