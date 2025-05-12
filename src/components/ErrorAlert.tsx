import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  "data-test-id"?: string;
}

export function ErrorAlert({ message, "data-test-id": dataTestId }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" data-test-id={dataTestId || "error-alert"}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription data-test-id="error-message">{message}</AlertDescription>
    </Alert>
  );
}
