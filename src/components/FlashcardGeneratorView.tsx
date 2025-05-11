import { useState } from "react";
import type { GenerateFlashcardsRequest, GenerationCreateResponse, FlashcardProposal } from "@/types";
import { SourceTextInput } from "./SourceTextInput";
import { GenerateFlashcardsButton } from "./GenerateFlashcardsButton";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorAlert } from "./ErrorAlert";
import { FlashcardProposalList } from "./FlashcardProposalList";
import { FlashcardBulkActions } from "./FlashcardBulkActions";

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface FlashcardProposalViewModel extends Omit<FlashcardProposal, "source"> {
  source: "ai-gen" | "ai-gen-edited";
  accepted: boolean;
  edited: boolean;
}

export function FlashcardGeneratorView() {
  const [textValue, setTextValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardProposalViewModel[]>([]);
  const [generationId, setGenerationId] = useState<number | null>(null);

  const handleTextChange = (value: string) => {
    setTextValue(value);
    setErrorMessage(null);
  };

  const handleApiError = async (response: Response) => {
    const data = (await response.json()) as ApiError;
    if (data.errors) {
      const errorMessages = Object.entries(data.errors)
        .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
        .join("\n");
      throw new Error(errorMessages);
    }
    throw new Error(data.message || "An unexpected error occurred");
  };

  const handleGenerateClick = async () => {
    if (textValue.length < 1000 || textValue.length > 10000) {
      setErrorMessage("Text must be between 1000 and 10000 characters");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_text: textValue } as GenerateFlashcardsRequest),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = (await response.json()) as GenerationCreateResponse;
      setGenerationId(data.generation_id);
      setFlashcards(
        data.flashcards_proposals.map((proposal) => ({
          ...proposal,
          accepted: false,
          edited: false,
          source: "ai-gen" as const,
        }))
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlashcardAccept = (index: number) => {
    setFlashcards((prev) => prev.map((card, i) => (i === index ? { ...card, accepted: true } : card)));
  };

  const handleFlashcardReject = (index: number) => {
    setFlashcards((prev) => prev.map((card, i) => (i === index ? { ...card, accepted: false } : card)));
  };

  const handleFlashcardEdit = (index: number, front: string, back: string) => {
    setFlashcards((prev) =>
      prev.map((card, i) =>
        i === index ? { ...card, front, back, edited: true, source: "ai-gen-edited" as const } : card
      )
    );
  };

  const handleSaveSuccess = () => {
    setFlashcards([]);
    setTextValue("");
    setGenerationId(null);
  };

  return (
    <div className="space-y-6">
      {errorMessage && <ErrorAlert message={errorMessage} />}

      <SourceTextInput value={textValue} onChange={handleTextChange} disabled={isLoading} />

      <GenerateFlashcardsButton
        onClick={handleGenerateClick}
        disabled={textValue.length < 1000 || textValue.length > 10000 || isLoading}
        isLoading={isLoading}
      />

      {isLoading && <LoadingSkeleton />}

      {flashcards.length > 0 && (
        <>
          {generationId !== null && (
            <FlashcardBulkActions
              flashcards={flashcards}
              generationId={generationId}
              disabled={isLoading}
              onSuccess={handleSaveSuccess}
            />
          )}
          <FlashcardProposalList
            flashcards={flashcards}
            onAccept={handleFlashcardAccept}
            onReject={handleFlashcardReject}
            onEdit={handleFlashcardEdit}
          />
        </>
      )}
    </div>
  );
}
