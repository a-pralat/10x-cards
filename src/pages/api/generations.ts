import type { APIRoute } from "astro";
import { GenerationService } from "../../lib/generation/generation.service";
import { GenerateFlashcardsSchema } from "../../lib/generation/generation.schema";
import { OpenRouterError } from "../../lib/openrouter/openrouter.types";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // Validate OpenRouter API key availability
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "Server configuration error: Missing API key",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Parse request body
    const body = await request.json();

    // Validate request body
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

    // Initialize service and generate flashcards
    const generationService = new GenerationService(locals.supabase, { apiKey });
    const response = await generationService.generateFlashcards(body.source_text);

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle specific error types
    if (error instanceof OpenRouterError) {
      return new Response(
        JSON.stringify({
          error: `AI service error: ${error.message}`,
          code: error.code,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Log the error for debugging
    console.error("Error in generations endpoint:", error);

    // Generic error response
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
