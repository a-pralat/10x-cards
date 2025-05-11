import type { FlashcardProposalViewModel } from "./FlashcardGeneratorView";
import { FlashcardProposalItem } from "./FlashcardProposalItem";

interface FlashcardProposalListProps {
  flashcards: FlashcardProposalViewModel[];
  onAccept: (index: number) => void;
  onReject: (index: number) => void;
  onEdit: (index: number, front: string, back: string) => void;
}

export function FlashcardProposalList({ flashcards, onAccept, onReject, onEdit }: FlashcardProposalListProps) {
  return (
    <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flashcards.map((flashcard, index) => (
        <FlashcardProposalItem
          key={index}
          flashcard={flashcard}
          onAccept={() => onAccept(index)}
          onReject={() => onReject(index)}
          onEdit={(front: string, back: string) => onEdit(index, front, back)}
        />
      ))}
    </div>
  );
}
