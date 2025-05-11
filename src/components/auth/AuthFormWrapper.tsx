import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthFormWrapperProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AuthFormWrapper({ children, title, description }: AuthFormWrapperProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
        {description && <CardDescription className="text-center">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
