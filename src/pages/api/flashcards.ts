import type { APIRoute } from "astro";
import { DatabaseError, FlashcardService } from "../../lib/flashcard/flashcard.service";
import { CreateFlashcardsSchema } from "../../lib/flashcard/flashcard.schema";
import type { CreateFlashcardsRequest } from "@/types";
import { FlashcardsGetService } from "@/lib/flashcard-get/flashcard.service";
import { GetFlashcardsQuerySchema } from "@/lib/flashcard-get/flashcard.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to create flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request body
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

    const command = validationResult.data as CreateFlashcardsRequest;
    const flashcardService = new FlashcardService(locals.supabase);

    // Extract and filter non-null generation IDs
    const generationIds = command.flashcards.map((f) => f.generation_id).filter((id): id is number => id !== null);

    // Validate generation IDs (if any)
    try {
      if (generationIds.length > 0) {
        await flashcardService.validateGenerationIds(generationIds);
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        return new Response(
          JSON.stringify({
            error: error.message,
            details: error.details,
            code: error.code,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      throw error;
    }

    // Create flashcards
    const createdFlashcards = await flashcardService.createBatch(locals.user.id, command.flashcards);

    return new Response(JSON.stringify({ flashcards: createdFlashcards }), {
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

    // Log the error for debugging
    console.error("Error creating flashcards:", error);

    // Generic error response
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    // Ensure user is authenticated
    if (!locals.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate query parameters
    const result = GetFlashcardsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: result.error.issues,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get flashcards
    const service = new FlashcardsGetService(locals.supabase);
    const response = await service.execute(locals.user.id, result.data);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
