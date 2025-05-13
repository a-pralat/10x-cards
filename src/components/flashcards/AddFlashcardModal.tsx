import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateFlashcard } from "../../lib/hooks/useCreateFlashcard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import type { CreateFlashcardRequest } from "../../types";

interface AddFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddFlashcardModal({ isOpen, onClose, onSuccess }: AddFlashcardModalProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const { createFlashcard, loading, error } = useCreateFlashcard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const flashcardData: CreateFlashcardRequest = {
      front: front.trim(),
      back: back.trim(),
      source: "user",
      generation_id: null,
    };

    try {
      await createFlashcard(flashcardData);
      onSuccess();
      handleClose();
    } catch {
      // Error is handled by the hook
    }
  };

  const handleClose = () => {
    setFront("");
    setBack("");
    onClose();
  };

  const isValid =
    front.trim().length > 0 && front.trim().length <= 200 && back.trim().length > 0 && back.trim().length <= 500;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Flashcard</DialogTitle>
            <DialogDescription>Create a new flashcard by filling out the front and back content.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.message || "Failed to create flashcard"}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label
                htmlFor="front"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Front
              </label>
              <Input
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Enter front content"
                maxLength={200}
              />
              <p className="text-sm text-muted-foreground">{front.length}/200 characters</p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="back"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Back
              </label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Enter back content"
                maxLength={500}
              />
              <p className="text-sm text-muted-foreground">{back.length}/500 characters</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Flashcard
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
