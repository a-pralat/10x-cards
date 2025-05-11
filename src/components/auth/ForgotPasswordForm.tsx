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

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    // Form submission will be implemented later
    console.log("Forgot password data:", data);
    setIsSuccess(true);

    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <AuthFormWrapper
        title="Check your email"
        description="We've sent you a link to reset your password. The link will expire in 1 hour."
      >
        <div className="text-center">
          <a href="/login" className="text-primary hover:underline">
            Return to login
          </a>
        </div>
      </AuthFormWrapper>
    );
  }

  return (
    <AuthFormWrapper
      title="Reset your password"
      description="Enter your email address and we'll send you a link to reset your password"
    >
      {error && <ErrorAlert message={error} />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>

            <div className="text-sm text-center">
              <a href="/login" className="text-primary hover:underline">
                Back to login
              </a>
            </div>
          </div>
        </form>
      </Form>
    </AuthFormWrapper>
  );
}
