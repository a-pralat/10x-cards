import type { APIRoute } from "astro";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          code: "unauthorized",
          message: error.message,
        }),
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({
        user: data.user,
      }),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          code: "validation_error",
          fieldErrors: error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        code: "server_error",
        message: "An unexpected error occurred",
      }),
      { status: 500 }
    );
  }
};
