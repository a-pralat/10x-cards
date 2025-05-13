import type { SupabaseClient } from "@supabase/supabase-js";
import type { GetFlashcardsQuery } from "./flashcard.schema";
import type { FlashcardResponse, FlashcardsListResponse } from "../../types";

export class FlashcardsGetService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Get paginated list of flashcards for a user with optional filtering and sorting
   */
  async execute(userId: string, filters: GetFlashcardsQuery): Promise<FlashcardsListResponse> {
    const { page, limit, sort, order, source, generation_id } = filters;
    const offset = (page - 1) * limit;

    // Build query
    let query = this.supabase
      .from("flashcards")
      .select("id, front, back, source, generation_id, created_at, updated_at", {
        count: "exact",
      })
      .eq("user_id", userId)
      .order(sort, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    // Apply optional filters
    if (source) {
      query = query.eq("source", source);
    }
    if (generation_id) {
      query = query.eq("generation_id", generation_id);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch flashcards: ${error.message}`);
    }

    return {
      data: (data as FlashcardResponse[]) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    };
  }
}
