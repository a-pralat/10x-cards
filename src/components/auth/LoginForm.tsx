import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { AuthFormWrapper } from "./AuthFormWrapper";
import { ErrorAlert } from "../ErrorAlert";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === "validation_error") {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            form.setError(field as keyof LoginFormData, {
              message: (errors as string[])[0],
            });
          });
        } else {
          setError(result.message || "Failed to sign in");
        }
        return;
      }

      // Redirect to home page on successful login
      window.location.href = "/";
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get form state to expose validation info for testing
  const { formState } = form;
  const hasEmailError = !!formState.errors.email;
  const hasPasswordError = !!formState.errors.password;

  return (
    <AuthFormWrapper
      title="Welcome back"
      description="Enter your credentials to access your account"
      data-test-id="login-form-wrapper"
    >
      {error && <ErrorAlert message={error} data-test-id="login-error-alert" />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-test-id="login-form">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    disabled={isLoading}
                    data-test-id="login-email-input"
                    aria-invalid={hasEmailError}
                    {...field}
                  />
                </FormControl>
                <FormMessage data-test-id="email-error-message" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    disabled={isLoading}
                    data-test-id="login-password-input"
                    aria-invalid={hasPasswordError}
                    {...field}
                  />
                </FormControl>
                <FormMessage data-test-id="password-error-message" />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isLoading} className="w-full" data-test-id="login-submit-button">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="text-sm text-center space-y-2">
              <a
                href="/forgot-password"
                className="text-primary hover:underline block"
                data-test-id="forgot-password-link"
              >
                Forgot your password?
              </a>
              <div className="text-muted-foreground">
                Don&apos;t have an account?{" "}
                <a href="/register" className="text-primary hover:underline" data-test-id="register-link">
                  Sign up
                </a>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </AuthFormWrapper>
  );
}
