import { z } from "zod";

const sourceEnum = z.enum(["user", "ai-gen", "ai-gen-edited"] as const);

export const CreateFlashcardSchema = z
  .object({
    front: z.string().max(200, "Front content cannot exceed 200 characters"),
    back: z.string().max(500, "Back content cannot exceed 500 characters"),
    source: sourceEnum,
    generation_id: z.number().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // For AI-generated cards, generation_id is required
    if (["ai-gen", "ai-gen-edited"].includes(data.source) && !data.generation_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "generation_id is required for AI-generated flashcards",
        path: ["generation_id"],
      });
    }

    // For user-created cards, generation_id must be null/undefined
    if (data.source === "user" && data.generation_id !== null && data.generation_id !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "generation_id must not be provided for user-created flashcards",
        path: ["generation_id"],
      });
    }
  });

export const CreateFlashcardsSchema = z.object({
  flashcards: z
    .array(CreateFlashcardSchema)
    .min(1, "At least one flashcard is required")
    .max(50, "Maximum 50 flashcards allowed per request"),
});
