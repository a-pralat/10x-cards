import type { APIRoute } from "astro";
import { FlashcardService } from "../../../lib/flashcard-put/flashcard.service";
import { updateFlashcardSchema } from "../../../lib/flashcard-put/flashcard-schema";

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
