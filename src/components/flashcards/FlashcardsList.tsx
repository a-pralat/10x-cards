import { FlashcardCard } from "./FlashcardCard";
import type { FlashcardResponse } from "../../types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FlashcardsListProps {
  items: FlashcardResponse[];
  loading: boolean;
  error: Error | null;
  onEdit: (flashcard: FlashcardResponse) => void;
  onDelete: (flashcard: FlashcardResponse) => void;
}

function FlashcardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-[200px] w-full rounded-lg border bg-card">
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
        <div className="px-6 py-4 bg-muted/10 flex justify-between items-center">
          <Skeleton className="h-4 w-[200px]" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlashcardsList({ items, loading, error, onEdit, onDelete }: FlashcardsListProps) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error.message || "An error occurred while loading flashcards"}</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <FlashcardSkeleton />
        <FlashcardSkeleton />
        <FlashcardSkeleton />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No flashcards found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new flashcard</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <FlashcardCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
