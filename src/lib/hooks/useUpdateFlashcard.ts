import { useState } from "react";
import type { UpdateFlashcardRequest, FlashcardResponse } from "../../types";

interface UseUpdateFlashcardResult {
  updateFlashcard: (id: number, data: UpdateFlashcardRequest) => Promise<FlashcardResponse>;
  loading: boolean;
  error: Error | null;
}

export function useUpdateFlashcard(): UseUpdateFlashcardResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateFlashcard = async (id: number, data: UpdateFlashcardRequest): Promise<FlashcardResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update flashcard");
      }

      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateFlashcard,
    loading,
    error,
  };
}
