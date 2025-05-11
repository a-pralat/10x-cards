import type { SupabaseClient } from "@supabase/supabase-js";
import type { GenerationCreateResponse, FlashcardProposal } from "../../types";
import { createHash } from "crypto";
import { OpenRouterService } from "../openrouter/openrouter.service";
import { OpenRouterError } from "../openrouter/openrouter.types";
import type { Database } from "../../db/database.types";

export class GenerationService {
  private readonly openRouter: OpenRouterService;
  private readonly model = "openai/gpt-4o-mini";
  private readonly logger = console;
  private readonly userId: string;

  constructor(
    private readonly supabase: SupabaseClient<Database>,
    private readonly config: { apiKey: string; userId: string }
  ) {
    if (!config.apiKey) {
      throw new Error("OpenRouter API key is required");
    }

    if (!config.userId) {
      throw new Error("User ID is required");
    }

    this.userId = config.userId;
    this.openRouter = this.initializeOpenRouter(config.apiKey);
  }

  /**
   * Generates flashcards from the provided source text
   */
  async generateFlashcards(sourceText: string): Promise<GenerationCreateResponse> {
    if (!sourceText || sourceText.trim().length === 0) {
      throw new Error("Source text is required");
    }

    const startTime = Date.now();
    const sourceTextHash = this.calculateSourceTextHash(sourceText);

    try {
      // Generate flashcard proposals using AI
      const proposals = await this.callOpenRouter(sourceText);

      // Track generation metadata
      const generationId = await this.saveGenerationMetadata({
        sourceText,
        sourceTextHash,
        generatedCount: proposals.length,
        durationMs: Date.now() - startTime,
      });

      return {
        generation_id: generationId,
        flashcards_proposals: proposals,
        generated_count: proposals.length,
      };
    } catch (error) {
      // Log error and save to error logs
      await this.logError(error, {
        sourceTextHash,
        sourceTextLength: sourceText.length,
      });

      // Rethrow the error
      if (error instanceof OpenRouterError) {
        throw new Error(`AI Service error: ${error.message} (${error.code})`);
      }
      throw error;
    }
  }

  /**
   * Initializes and configures the OpenRouter service
   */
  private initializeOpenRouter(apiKey: string): OpenRouterService {
    const openRouter = new OpenRouterService({
      apiKey,
      timeout: 60000, // 60 seconds timeout for longer generations
    });

    // Configure OpenRouter model and parameters
    openRouter.setModel(this.model, {
      temperature: 0.7,
      top_p: 1,
    });

    // Set system prompt
    openRouter.setSystemMessage(`You are an AI assistant specialized in creating high-quality flashcards from provided text.
Generate concise, clear, and effective flashcards that capture key concepts and knowledge.
Each flashcard should have a front (question/prompt) and back (answer/explanation).
Focus on important facts, definitions, concepts, and relationships.`);

    // Configure response format
    openRouter.setResponseFormat({
      name: "flashcards",
      schema: {
        type: "object",
        properties: {
          flashcards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                front: { type: "string" },
                back: { type: "string" },
              },
              required: ["front", "back"],
            },
          },
        },
        required: ["flashcards"],
      },
    });

    return openRouter;
  }

  /**
   * Creates a hash of the source text for tracking
   */
  private calculateSourceTextHash(sourceText: string): string {
    return createHash("md5").update(sourceText).digest("hex");
  }

  /**
   * Calls OpenRouter API to generate flashcards
   */
  private async callOpenRouter(text: string): Promise<FlashcardProposal[]> {
    try {
      // Set the user message with the source text
      this.openRouter.setUserMessage(`Generate flashcards from the following text:\n\n${text}`);

      // Get response from OpenRouter
      const response = await this.openRouter.sendChatMessage();

      // Validate response
      const data = this.parseAndValidateResponse(response);

      // Convert to FlashcardProposal format
      return data.flashcards.map((card: { front: string; back: string }) => ({
        front: card.front,
        back: card.back,
        source: "ai-gen",
      }));
    } catch (error) {
      this.logger.error("Error calling OpenRouter:", error);
      throw error;
    }
  }

  /**
   * Parses and validates the OpenRouter response
   */
  private parseAndValidateResponse(response: string): { flashcards: { front: string; back: string }[] } {
    try {
      const data = JSON.parse(response);

      if (!data.flashcards || !Array.isArray(data.flashcards)) {
        throw new Error("Invalid response format: missing flashcards array");
      }

      return data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse response: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Saves generation metadata to the database
   */
  private async saveGenerationMetadata(data: {
    sourceText: string;
    sourceTextHash: string;
    generatedCount: number;
    durationMs: number;
  }): Promise<number> {
    const { data: generation, error } = await this.supabase
      .from("generations")
      .insert({
        user_id: this.userId,
        source_text_hash: data.sourceTextHash,
        source_text_length: data.sourceText.length,
        generated_count: data.generatedCount,
        generation_duration: data.durationMs,
        model: this.model,
      })
      .select("id")
      .single();

    if (error) {
      this.logger.error("Error saving generation metadata:", error);
      throw error;
    }

    return generation.id;
  }

  /**
   * Logs errors to the database
   */
  private async logError(
    error: unknown,
    data: {
      sourceTextHash: string;
      sourceTextLength: number;
    }
  ): Promise<void> {
    try {
      await this.supabase.from("error_logs").insert({
        user_id: this.userId,
        error_code: error instanceof Error ? error.name : "UNKNOWN",
        error_message: error instanceof Error ? error.message : String(error),
        model: this.model,
        source_text_hash: data.sourceTextHash,
        source_text_length: data.sourceTextLength,
      });
    } catch (logError) {
      // Just log to console if we can't save to DB
      this.logger.error("Failed to log error to database:", logError);
    }
  }
}
