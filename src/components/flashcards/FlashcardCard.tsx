import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { FlashcardResponse } from "../../types";

interface FlashcardCardProps {
  item: FlashcardResponse;
  onEdit: (flashcard: FlashcardResponse) => void;
  onDelete: (flashcard: FlashcardResponse) => void;
}

export function FlashcardCard({ item, onEdit, onDelete }: FlashcardCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6 px-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Front</h3>
            <p className="text-lg">{item.front}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Back</h3>
            <p className="text-lg">{item.back}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-muted/10 px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Created: {formatDate(item.created_at)}</span>
          {item.source !== "user" && (
            <>
              <span>•</span>
              <span>Generation: #{item.generation_id}</span>
            </>
          )}
          <span>•</span>
          <span>Source: {item.source}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(item)} aria-label="Edit flashcard">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(item)} aria-label="Delete flashcard">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
