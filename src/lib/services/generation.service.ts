import type { SupabaseClient } from "../../db/supabase.client";
import type { GenerationCreateResponse } from "../../types";
import { createHash } from "crypto";

export class GenerationService {
  constructor(private readonly supabase: SupabaseClient) {}

  async generateFlashcards(sourceText: string): Promise<GenerationCreateResponse> {
    const startTime = Date.now();
    const sourceTextHash = this.calculateSourceTextHash(sourceText);

    return {
      generation_id: 1,
      flashcards_proposals: [],
      generated_count: 0,
    };
  }

  private calculateSourceTextHash(sourceText: string): string {
    return createHash("md5").update(sourceText).digest("hex");
  }
}
