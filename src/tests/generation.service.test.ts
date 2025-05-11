import { describe, it, expect, vi, beforeEach } from "vitest";
import { GenerationService } from "../lib/generation/generation.service";
import { OpenRouterService } from "../lib/openrouter/openrouter.service";
import { OpenRouterError } from "../lib/openrouter/openrouter.types";
import type { MockSupabaseClient } from "./setup";
import { createMockSupabaseClient } from "./setup";
import type { SupabaseClient } from "@supabase/supabase-js";

interface GenerationConfig {
  apiKey: string;
  userId: string;
}

interface MockedOpenRouterService {
  setModel: ReturnType<typeof vi.fn>;
  setSystemMessage: ReturnType<typeof vi.fn>;
  setResponseFormat: ReturnType<typeof vi.fn>;
  setUserMessage: ReturnType<typeof vi.fn>;
  sendChatMessage: ReturnType<typeof vi.fn>;
}

// Mock OpenRouterService
vi.mock("../lib/openrouter/openrouter.service", () => ({
  OpenRouterService: vi.fn().mockImplementation(() => ({
    setModel: vi.fn(),
    setSystemMessage: vi.fn(),
    setResponseFormat: vi.fn(),
    setUserMessage: vi.fn(),
    sendChatMessage: vi.fn(),
  })),
}));

describe("GenerationService", () => {
  let mockSupabase: MockSupabaseClient;
  let mockConfig: GenerationConfig;
  let generationService: GenerationService;
  let openRouterInstance: MockedOpenRouterService;

  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    mockSupabase = createMockSupabaseClient();
    mockConfig = {
      apiKey: "test-api-key",
      userId: "test-user-id",
    };
    generationService = new GenerationService(mockSupabase as unknown as SupabaseClient, mockConfig);
    openRouterInstance = vi.mocked(OpenRouterService).mock.results[0].value;
  });

  describe("constructor", () => {
    it("should throw error when apiKey is missing", () => {
      // Arrange
      const invalidConfig = { ...mockConfig, apiKey: "" };

      // Act & Assert
      expect(() => new GenerationService(mockSupabase as unknown as SupabaseClient, invalidConfig)).toThrow(
        "OpenRouter API key is required"
      );
    });

    it("should throw error when userId is missing", () => {
      // Arrange
      const invalidConfig = { ...mockConfig, userId: "" };

      // Act & Assert
      expect(() => new GenerationService(mockSupabase as unknown as SupabaseClient, invalidConfig)).toThrow(
        "User ID is required"
      );
    });

    it("should initialize successfully with valid config", () => {
      // Act & Assert
      expect(() => new GenerationService(mockSupabase as unknown as SupabaseClient, mockConfig)).not.toThrow();
    });
  });

  describe("generateFlashcards", () => {
    const mockSourceText = "Test source text";
    const mockFlashcardsResponse = {
      flashcards: [
        { front: "Question 1", back: "Answer 1" },
        { front: "Question 2", back: "Answer 2" },
      ],
    };

    beforeEach(() => {
      // Arrange
      openRouterInstance.sendChatMessage.mockResolvedValue(JSON.stringify(mockFlashcardsResponse));
      const mockTable = mockSupabase.from("generations");
      vi.mocked(mockTable.single).mockResolvedValue({
        data: { id: 1 },
        error: null,
      });
    });

    it("should throw error for empty source text", async () => {
      // Act & Assert
      await expect(generationService.generateFlashcards("")).rejects.toThrow("Source text is required");
    });

    it("should throw error for whitespace-only source text", async () => {
      // Act & Assert
      await expect(generationService.generateFlashcards("   ")).rejects.toThrow("Source text is required");
    });

    it("should successfully generate flashcards", async () => {
      // Act
      const result = await generationService.generateFlashcards(mockSourceText);

      // Assert
      expect(result).toEqual({
        generation_id: 1,
        flashcards_proposals: [
          { front: "Question 1", back: "Answer 1", source: "ai-gen" },
          { front: "Question 2", back: "Answer 2", source: "ai-gen" },
        ],
        generated_count: 2,
      });

      // Verify database interactions
      expect(mockSupabase.from).toHaveBeenCalledWith("generations");
      const mockTable = mockSupabase.from("generations");
      expect(mockTable.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockConfig.userId,
          source_text_length: mockSourceText.length,
          generated_count: 2,
          model: "openai/gpt-4o-mini",
        })
      );
    });

    it("should handle OpenRouter API errors gracefully", async () => {
      // Arrange
      const errorCode = "ERROR_CODE";
      const errorMessage = "API Error";
      openRouterInstance.sendChatMessage.mockRejectedValue(new OpenRouterError(errorMessage, errorCode));

      // Act & Assert
      await expect(generationService.generateFlashcards(mockSourceText)).rejects.toThrow(
        `AI Service error: ${errorMessage} (${errorCode})`
      );
    });

    it("should handle network errors", async () => {
      // Arrange
      openRouterInstance.sendChatMessage.mockRejectedValue(new Error("Network error"));

      // Act & Assert
      await expect(generationService.generateFlashcards(mockSourceText)).rejects.toThrow("Network error");
    });

    it("should log errors to database on failure", async () => {
      // Arrange
      const testError = new Error("Test error");
      openRouterInstance.sendChatMessage.mockRejectedValue(testError);

      const errorLogInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
        if (table === "error_logs") {
          return {
            insert: errorLogInsert,
            select: vi.fn(),
            single: vi.fn(),
          };
        }
        return mockSupabase.from(table);
      });

      // Act
      await expect(generationService.generateFlashcards(mockSourceText)).rejects.toThrow();

      // Assert
      expect(errorLogInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockConfig.userId,
          error_code: "Error",
          error_message: "Test error",
          model: "openai/gpt-4o-mini",
        })
      );
    });

    it("should handle database errors during generation saving", async () => {
      // Arrange
      const mockTable = mockSupabase.from("generations");
      vi.mocked(mockTable.single).mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      // Act & Assert
      await expect(generationService.generateFlashcards(mockSourceText)).rejects.toThrow("Database error");
    });
  });

  describe("parseAndValidateResponse", () => {
    it("should parse valid JSON response", () => {
      // Arrange
      const validResponse = JSON.stringify({
        flashcards: [{ front: "Q1", back: "A1" }],
      });

      // Act
      const result = generationService["parseAndValidateResponse"](validResponse);

      // Assert
      expect(result).toEqual({ flashcards: [{ front: "Q1", back: "A1" }] });
    });

    it("should throw error for invalid JSON", () => {
      // Arrange
      const invalidJson = "invalid json";

      // Act & Assert
      expect(() => generationService["parseAndValidateResponse"](invalidJson)).toThrow("Failed to parse response");
    });

    it("should throw error for missing flashcards array", () => {
      // Arrange
      const invalidResponse = JSON.stringify({ something: "else" });

      // Act & Assert
      expect(() => generationService["parseAndValidateResponse"](invalidResponse)).toThrow(
        "Invalid response format: missing flashcards array"
      );
    });
  });
});
