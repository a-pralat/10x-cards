import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { UpdateFlashcardRequest, FlashcardResponse } from "../../types";

export class FlashcardService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  // ... existing code ...

  async updateFlashcard(id: number, data: UpdateFlashcardRequest, userId: string): Promise<FlashcardResponse | null> {
    // First, get the current flashcard to check its source
    const { data: current } = await this.supabase
      .from("flashcards")
      .select()
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!current) {
      return null;
    }

    // If the flashcard was AI-generated, update the source to ai-gen-edited
    const source = current.source === "ai-gen" ? "ai-gen-edited" : current.source;

    const { data: updated, error } = await this.supabase
      .from("flashcards")
      .update({
        front: data.front,
        back: data.back,
        source,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return updated;
  }
}
