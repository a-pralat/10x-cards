import { useState, type ChangeEvent } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Edit2, Save } from "lucide-react";
import type { FlashcardProposalViewModel } from "./FlashcardGeneratorView";
import { Badge } from "@/components/ui/badge";

interface FlashcardProposalItemProps {
  flashcard: FlashcardProposalViewModel;
  onAccept: () => void;
  onReject: () => void;
  onEdit: (front: string, back: string) => void;
}

export function FlashcardProposalItem({ flashcard, onAccept, onReject, onEdit }: FlashcardProposalItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFront, setEditedFront] = useState(flashcard.front);
  const [editedBack, setEditedBack] = useState(flashcard.back);

  const handleSave = () => {
    if (editedFront.length > 200 || editedBack.length > 500) {
      return;
    }
    onEdit(editedFront, editedBack);
    setIsEditing(false);
  };

  const frontCharCount = editedFront.length;
  const backCharCount = editedBack.length;
  const isFrontValid = frontCharCount <= 200;
  const isBackValid = backCharCount <= 500;

  return (
    <Card className={`${flashcard.accepted ? "border-green-500" : ""} h-full flex flex-col`}>
      <CardContent className="pt-2 space-y-4 flex-grow">
        {isEditing ? (
          <>
            <div>
              <Textarea
                value={editedFront}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditedFront(e.target.value)}
                className="resize-none"
                maxLength={200}
              />
              <div className={`text-sm mt-1 ${isFrontValid ? "text-gray-500" : "text-red-500"}`}>
                {frontCharCount}/200 characters
              </div>
            </div>
            <div>
              <Textarea
                value={editedBack}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditedBack(e.target.value)}
                className="resize-none"
                maxLength={500}
              />
              <div className={`text-sm mt-1 ${isBackValid ? "text-gray-500" : "text-red-500"}`}>
                {backCharCount}/500 characters
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="font-medium">{flashcard.front}</div>
              {flashcard.edited && (
                <Badge variant="secondary" className="text-xs">
                  Edited
                </Badge>
              )}
            </div>
            <div className="text-gray-600">{flashcard.back}</div>
          </>
        )}
      </CardContent>
      <CardFooter className="gap-2 pb-2">
        {isEditing ? (
          <Button onClick={handleSave} disabled={!isFrontValid || !isBackValid} className="w-full" variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        ) : (
          <>
            <Button onClick={onAccept} variant="outline" className="flex-1" disabled={flashcard.accepted}>
              <Check className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button onClick={onReject} variant="outline" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button onClick={() => setIsEditing(true)} variant="outline" className="flex-1">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
