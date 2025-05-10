import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateFlashcardRequest, FlashcardResponse } from "../../types";
import type { Database } from "../../db/database.types";

export class FlashcardService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async createFlashcards(flashcards: CreateFlashcardRequest[], userId: string): Promise<FlashcardResponse[]> {
    // If any flashcard has a generation_id, verify ownership
    const generationIds = flashcards.map((f) => f.generation_id).filter((id): id is number => id != null);

    if (generationIds.length > 0) {
      const { data: generations, error: genError } = await this.supabase
        .from("generations")
        .select("id")
        .in("id", generationIds)
        .eq("user_id", userId);

      if (genError) {
        throw new Error("Failed to verify generation ownership");
      }

      const foundIds = new Set(generations?.map((g) => g.id) ?? []);
      const missingIds = generationIds.filter((id) => !foundIds.has(id));

      if (missingIds.length > 0) {
        throw new Error(`Generations not found or not owned by user: ${missingIds.join(", ")}`);
      }
    }

    // Insert flashcards
    const { data, error } = await this.supabase
      .from("flashcards")
      .insert(
        flashcards.map((card) => ({
          ...card,
          user_id: userId,
        }))
      )
      .select();

    if (error) {
      throw new Error("Failed to create flashcards");
    }

    return data;
  }
}
