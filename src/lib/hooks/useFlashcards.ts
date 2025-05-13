import { useState, useEffect } from "react";
import type { FlashcardsListResponse, FlashcardResponse, Source } from "../../types";

interface UseFlashcardsParams {
  page: number;
  limit: number;
  source?: Source;
  generationId?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

interface UseFlashcardsResult {
  data: FlashcardResponse[];
  pagination: FlashcardsListResponse["pagination"];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFlashcards(params: UseFlashcardsParams): UseFlashcardsResult {
  const [data, setData] = useState<FlashcardResponse[]>([]);
  const [pagination, setPagination] = useState<FlashcardsListResponse["pagination"]>({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        ...(params.source && { source: params.source }),
        ...(params.generationId && { generation_id: params.generationId.toString() }),
        ...(params.sortField && { sort: params.sortField }),
        ...(params.sortOrder && { order: params.sortOrder }),
      });

      const response = await fetch(`/api/flashcards?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }

      const result: FlashcardsListResponse = await response.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [params.page, params.limit, params.source, params.generationId, params.sortField, params.sortOrder]);

  return {
    data,
    pagination,
    loading,
    error,
    refetch: fetchFlashcards,
  };
}
