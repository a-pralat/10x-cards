// src/types.ts
import type { Database } from "./db/database.types";

// ------------------------------------------------------------------------------------------------
// Database Types
// Base type aliases extracted from the Database model definitions
// ------------------------------------------------------------------------------------------------
export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
export type FlashcardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];
export type Generation = Database["public"]["Tables"]["generations"]["Row"];
export type ErrorLog = Database["public"]["Tables"]["error_logs"]["Row"];

// ------------------------------------------------------------------------------------------------
// Shared Types
// Common types used across multiple DTOs and models
// ------------------------------------------------------------------------------------------------
export type Source = "user" | "ai-gen" | "ai-gen-edited";

// ------------------------------------------------------------------------------------------------
// Flashcard DTOs
// Types for flashcard-related data transfer objects
// ------------------------------------------------------------------------------------------------

/**
 * Represents a flashcard as returned by API endpoints
 * Used in: GET /flashcards, GET /flashcards/{id}
 */
export type FlashcardResponse = Pick<
  Flashcard,
  "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at"
>;

/**
 * DTO for creating a new flashcard
 * Validation:
 * - front: maximum length 200 characters
 * - back: maximum length 500 characters
 * - source: must be one of "user", "ai-gen", or "ai-gen-edited"
 * - generation_id: required for "ai-gen" and "ai-gen-edited", must be null for "user"
 */
export interface CreateFlashcardRequest {
  front: string;
  back: string;
  source: Source;
  generation_id: number | null;
}

/**
 * Command to create multiple flashcards at once
 * Used in: POST /flashcards
 */
export interface CreateFlashcardsRequest {
  flashcards: CreateFlashcardRequest[];
}

/**
 * DTO for updating an existing flashcard
 * Used in: PUT /flashcards/{id}
 * Supports partial updates of flashcard fields
 */
export type UpdateFlashcardRequest = Partial<{
  front: string;
  back: string;
  source: Source;
  generation_id: number | null;
}>;

/**
 * Represents a flashcard proposal generated by AI
 * Always has source "ai-gen"
 */
export interface FlashcardProposal {
  front: string;
  back: string;
  source: "ai-gen";
}

// ------------------------------------------------------------------------------------------------
// Pagination Types
// Types for pagination-related data structures
// ------------------------------------------------------------------------------------------------

/**
 * Contains pagination details used in list responses
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

/**
 * Combines an array of flashcards with pagination metadata
 * Used in: GET /flashcards
 */
export interface FlashcardsListResponse {
  data: FlashcardResponse[];
  pagination: PaginationMeta;
}

// ------------------------------------------------------------------------------------------------
// Generation Types
// Types for AI generation-related operations
// ------------------------------------------------------------------------------------------------

/**
 * Command to initiate AI flashcard generation
 * Used in: POST /generations
 * The "source_text" must be between 1000 and 10000 characters
 */
export interface GenerateFlashcardsRequest {
  source_text: string;
}

/**
 * Response from the flashcard generation endpoint
 * Used in: POST /generations
 */
export interface GenerationCreateResponse {
  generation_id: number;
  flashcards_proposals: FlashcardProposal[];
  generated_count: number;
}

/**
 * Detailed information for a generation request
 * Used in: GET /generations/{id}
 * Includes metadata and optionally associated flashcards
 */
export type GenerationDetailResponse = Generation & {
  flashcards?: FlashcardResponse[];
};

// ------------------------------------------------------------------------------------------------
// Error Types
// Types for error logging and handling
// ------------------------------------------------------------------------------------------------

/**
 * Represents an error log entry for the AI flashcard generation process
 * Used in: GET /error-logs
 */
export type ErrorLogResponse = Pick<
  ErrorLog,
  "id" | "error_code" | "error_message" | "model" | "source_text_hash" | "source_text_length" | "created_at" | "user_id"
>;
