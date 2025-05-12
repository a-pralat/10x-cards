import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthFormWrapperProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  "data-test-id"?: string;
}

export function AuthFormWrapper({ children, title, description, "data-test-id": dataTestId }: AuthFormWrapperProps) {
  return (
    <Card className="w-full max-w-md mx-auto" data-test-id={dataTestId || "auth-form-card"}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center" data-test-id="auth-form-title">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-center" data-test-id="auth-form-description">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent data-test-id="auth-form-content">{children}</CardContent>
    </Card>
  );
}
