import type { SupabaseClient } from "../../db/supabase.client";
import type { GenerationCreateResponse, FlashcardProposal } from "../../types";
import { createHash } from "crypto";

export class GenerationService {
  constructor(private readonly supabase: SupabaseClient) {}

  async generateFlashcards(sourceText: string): Promise<GenerationCreateResponse> {
    // For now, return some example flashcard proposals
    const exampleProposals: FlashcardProposal[] = [
      {
        front: "What is the capital of France?",
        back: "Paris is the capital of France. It is known as the City of Light (Ville Lumière) and is one of the most visited cities in the world.",
        source: "ai-gen",
      },
      {
        front: "Who wrote 'Romeo and Juliet'?",
        back: "William Shakespeare wrote 'Romeo and Juliet', a tragedy believed to have been written between 1591 and 1595.",
        source: "ai-gen",
      },
      {
        front: "What is the speed of light?",
        back: "The speed of light in a vacuum is approximately 299,792,458 meters per second (about 186,282 miles per second).",
        source: "ai-gen",
      },
    ];

    return {
      generation_id: 1,
      flashcards_proposals: exampleProposals,
      generated_count: exampleProposals.length,
    };
  }

  private calculateSourceTextHash(sourceText: string): string {
    return createHash("md5").update(sourceText).digest("hex");
  }
}
