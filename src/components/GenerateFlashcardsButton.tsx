import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GenerateFlashcardsButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export function GenerateFlashcardsButton({ onClick, disabled, isLoading }: GenerateFlashcardsButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled} className="w-full sm:w-auto">
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? "Generating..." : "Generate Flashcards"}
    </Button>
  );
}
