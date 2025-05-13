import type { APIRoute } from "astro";
import { FlashcardService } from "../../../lib/flashcard-put/flashcard.service";
import { updateFlashcardSchema } from "../../../lib/flashcard-put/flashcard-schema";
import { FlashcardDeleteService } from "../../../lib/flashcard-delete/flashcard.service";
import { DeleteFlashcardParamsSchema } from "../../../lib/flashcard-delete/flashcard.schema";

export const prerender = false;

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    // Check authentication
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Validate id parameter
    const id = Number(params.id);
    if (!id || isNaN(id) || id <= 0) {
      return new Response(JSON.stringify({ error: "Invalid flashcard ID" }), { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const result = updateFlashcardSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error.message }), { status: 400 });
    }

    // Update flashcard
    const service = new FlashcardService(locals.supabase);
    const updated = await service.updateFlashcard(id, result.data, locals.user.id);

    if (!updated) {
      return new Response(JSON.stringify({ error: "Flashcard not found or access denied" }), { status: 404 });
    }

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to delete flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate path parameter
    const validationResult = DeleteFlashcardParamsSchema.safeParse(params);

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

    // Delete flashcard
    const service = new FlashcardDeleteService(locals.supabase);
    await service.deleteFlashcard(locals.user.id, validationResult.data.id);

    return new Response(
      JSON.stringify({
        message: "Flashcard deleted successfully.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    // Log the error for debugging
    console.error("Error deleting flashcard:", error);

    // Return appropriate error response
    const status = error instanceof Error && error.message.includes("not found") ? 404 : 500;
    const message = error instanceof Error ? error.message : "Unknown error occurred";

    return new Response(
      JSON.stringify({
        error: status === 404 ? "Not Found" : "Internal server error",
        message,
      }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
