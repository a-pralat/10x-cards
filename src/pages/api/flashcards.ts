import type { APIRoute } from "astro";
import { FlashcardService } from "../../lib/services/flashcard.service";
import { CreateFlashcardsSchema } from "../../lib/schemas/flashcard.schema";
import type { FlashcardResponse } from "@/types";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = CreateFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          issues: validationResult.error.issues,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create flashcards
    // const service = new FlashcardService(locals.supabase);
    // const flashcards = await service.createFlashcards();
    const flashcards: FlashcardResponse[] = [
      {
        id: 1,
        front: "What is the capital of France?",
        back: "Paris",
        source: "user",
        generation_id: null,
        created_at: "",
        updated_at: "",
      },
    ];
    return new Response(JSON.stringify({ flashcards }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error && error.message.includes("Generations not found")) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generic error handling
    console.error("Error creating flashcards:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
