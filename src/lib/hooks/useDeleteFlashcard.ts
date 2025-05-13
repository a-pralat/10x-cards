import { useState } from "react";

interface UseDeleteFlashcardResult {
  deleteFlashcard: (id: number) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export function useDeleteFlashcard(): UseDeleteFlashcardResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteFlashcard = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteFlashcard,
    loading,
    error,
  };
}
