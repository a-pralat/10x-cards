import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteFlashcard } from "../../lib/hooks/useDeleteFlashcard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import type { FlashcardResponse } from "../../types";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  flashcard: FlashcardResponse | null;
}

export function DeleteConfirmationDialog({ isOpen, onClose, onSuccess, flashcard }: DeleteConfirmationDialogProps) {
  const { deleteFlashcard, loading, error } = useDeleteFlashcard();

  const handleConfirm = async () => {
    if (!flashcard) return;

    try {
      await deleteFlashcard(flashcard.id);
      onSuccess();
      onClose();
    } catch {
      // Error is handled by the hook
    }
  };

  if (!flashcard) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Flashcard</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this flashcard? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message || "Failed to delete flashcard"}</AlertDescription>
          </Alert>
        )}

        <div className="mt-4 space-y-2">
          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Front</p>
            <p className="text-sm">{flashcard.front}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Back</p>
            <p className="text-sm">{flashcard.back}</p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
