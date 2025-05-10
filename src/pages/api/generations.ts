import type { APIRoute } from "astro";
import { GenerationService } from "../../lib/services/generation.service";
import { GenerateFlashcardsSchema } from "../../lib/schemas/generation.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = GenerateFlashcardsSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          issues: result.error.issues,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate flashcards
    const generationService = new GenerationService(locals.supabase);
    const response = await generationService.generateFlashcards(body.source_text);

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generations endpoint:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
