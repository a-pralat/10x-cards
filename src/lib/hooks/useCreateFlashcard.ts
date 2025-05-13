import { useState } from "react";
import type { CreateFlashcardRequest, FlashcardResponse } from "../../types";

interface UseCreateFlashcardResult {
  createFlashcard: (data: CreateFlashcardRequest) => Promise<FlashcardResponse>;
  loading: boolean;
  error: Error | null;
}

export function useCreateFlashcard(): UseCreateFlashcardResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createFlashcard = async (data: CreateFlashcardRequest): Promise<FlashcardResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flashcards: [data] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create flashcard");
      }

      const result = await response.json();
      return result.flashcards[0];
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createFlashcard,
    loading,
    error,
  };
}
