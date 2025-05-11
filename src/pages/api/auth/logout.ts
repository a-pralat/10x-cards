import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  try {
    const { error } = await locals.supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          code: "server_error",
          message: error.message,
        }),
        { status: 500 }
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(
      JSON.stringify({
        code: "server_error",
        message: "An unexpected error occurred",
      }),
      { status: 500 }
    );
  }
};
