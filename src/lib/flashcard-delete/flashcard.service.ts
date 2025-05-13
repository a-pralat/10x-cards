import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Service for handling flashcard deletion operations
 */
export class FlashcardDeleteService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Deletes a flashcard if it belongs to the specified user
   * @throws {Error} if flashcard doesn't exist or doesn't belong to user
   */
  async deleteFlashcard(userId: string, flashcardId: number): Promise<void> {
    // First check if the flashcard exists and belongs to the user
    const { data: flashcard } = await this.supabase
      .from("flashcards")
      .select("id")
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .single();

    if (!flashcard) {
      throw new Error("Flashcard not found or access denied");
    }

    // Delete the flashcard
    const { error } = await this.supabase.from("flashcards").delete().eq("id", flashcardId).eq("user_id", userId);

    if (error) {
      throw error;
    }
  }
}
