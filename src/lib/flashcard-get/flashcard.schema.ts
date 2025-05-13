import { z } from "zod";

// Enum for sort fields
const sortFields = ["front", "back", "source", "generation_id", "created_at", "updated_at"] as const;

// Enum for sort order
const sortOrder = ["asc", "desc"] as const;

// Schema for query parameters
export const GetFlashcardsQuerySchema = z.object({
  // Required parameters with defaults
  page: z.coerce.number().int().min(1).default(1).describe("Page number (starts from 1)"),
  limit: z.coerce.number().int().min(1).max(100).default(10).describe("Number of items per page"),
  sort: z.enum(sortFields).default("created_at").describe("Field to sort by"),
  order: z.enum(sortOrder).default("asc").describe("Sort order"),

  // Optional parameters
  source: z
    .enum(["user", "ai-gen", "ai-gen-edited"] as const)
    .optional()
    .describe("Filter by flashcard source"),
  generation_id: z.coerce.number().int().positive().optional().describe("Filter by generation ID"),
});

// Type for validated query parameters
export type GetFlashcardsQuery = z.infer<typeof GetFlashcardsQuerySchema>;
