import { z } from "zod";

export const updateFlashcardSchema = z
  .object({
    front: z.string().max(200).optional(),
    back: z.string().max(500).optional(),
  })
  .refine((data) => data.front !== undefined || data.back !== undefined, {
    message: "At least one of 'front' or 'back' must be provided",
  });
