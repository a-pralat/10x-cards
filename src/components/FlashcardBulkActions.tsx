import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { FlashcardProposalViewModel } from "./FlashcardGeneratorView";
import { toast } from "sonner";
import type { CreateFlashcardsRequest } from "@/types";
import { useState } from "react";

interface FlashcardBulkActionsProps {
  flashcards: FlashcardProposalViewModel[];
  generationId: number;
  disabled: boolean;
  onSuccess: () => void;
}

export function FlashcardBulkActions({ flashcards, generationId, disabled, onSuccess }: FlashcardBulkActionsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (onlyAccepted: boolean) => {
    try {
      setIsSaving(true);
      setError(null);

      const flashcardsToSave = flashcards
        .filter((card) => !onlyAccepted || card.accepted)
        .map((card) => ({
          front: card.front,
          back: card.back,
          source: card.source,
          generation_id: generationId,
        }));

      const command: CreateFlashcardsRequest = {
        flashcards: flashcardsToSave,
      };

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Failed to save flashcards. Please try again.");
      }

      toast.success("Success!", {
        description: `Successfully saved ${flashcardsToSave.length} flashcards.`,
      });

      onSuccess();
      window.location.href = "/flashcards";
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
      <div className="flex flex-col sm:flex-row gap-2 max-w-md">
        <Button
          onClick={() => handleSave(true)}
          disabled={disabled || isSaving || !flashcards.some((card) => card.accepted)}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Accepted"
          )}
        </Button>

        <Button onClick={() => handleSave(false)} disabled={disabled || isSaving} variant="outline" className="flex-1">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save All"
          )}
        </Button>
      </div>
    </>
  );
}
