import { z } from "zod";

/**
 * Schema for validating flashcard deletion path parameters
 * Ensures the ID is a valid positive integer
 */
export const DeleteFlashcardParamsSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().describe("Flashcard ID must be a positive integer")),
});

export type DeleteFlashcardParams = z.infer<typeof DeleteFlashcardParamsSchema>;

/**
 * Response schema for successful flashcard deletion
 */
export const DeleteFlashcardResponseSchema = z.object({
  message: z.literal("Flashcard deleted successfully."),
});

export type DeleteFlashcardResponse = z.infer<typeof DeleteFlashcardResponseSchema>;
