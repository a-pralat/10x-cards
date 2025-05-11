import { z } from "zod";
import type { ModelParameters, RequestPayload, ApiResponse, ResponseFormat, Message } from "./openrouter.types";
import { OpenRouterError, requestPayloadSchema, apiResponseSchema } from "./openrouter.types";
import { Logger } from "./logger";
import { configSchema } from "./openrouter.schema";

export class OpenRouterService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly defaultTimeout: number;
  private readonly maxRetries: number;
  private readonly logger: Logger;

  private currentSystemMessage = "";
  private currentUserMessage = "";
  private currentResponseFormat?: ResponseFormat["json_schema"];
  private currentModelName = "openai/gpt-4o-mini";
  private currentModelParameters: ModelParameters = {
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  constructor(config: { apiKey: string; apiUrl?: string; timeout?: number; maxRetries?: number }) {
    this.logger = new Logger("OpenRouterService");

    try {
      // Validate configuration using Zod
      const validatedConfig = configSchema.parse(config);

      this.apiKey = validatedConfig.apiKey;
      this.apiUrl = validatedConfig.apiUrl || "https://openrouter.ai/api/v1";
      this.defaultTimeout = validatedConfig.timeout || 30000;
      this.maxRetries = validatedConfig.maxRetries || 3;
    } catch (error) {
      this.logger.error(error as Error, {
        config: {
          ...config,
          apiKey: "[REDACTED]",
        },
      });
      throw error;
    }
  }

  /**
   * Sets the system message that provides context for the model
   */
  public setSystemMessage(message: string): void {
    if (!message.trim()) {
      this.logger.error(new Error("System message cannot be empty"), { messageLength: message.length });
      throw new OpenRouterError("System message cannot be empty", "INVALID_SYSTEM_MESSAGE");
    }

    this.currentSystemMessage = message;
  }

  /**
   * Sets the user message to be processed by the model
   */
  public setUserMessage(message: string): void {
    if (!message.trim()) {
      this.logger.error(new Error("User message cannot be empty"), { messageLength: message.length });
      throw new OpenRouterError("User message cannot be empty", "INVALID_USER_MESSAGE");
    }

    this.currentUserMessage = message;
  }

  /**
   * Sets the JSON schema for structured responses
   */
  public setResponseFormat(schema: Record<string, unknown>): void {
    if (!schema || typeof schema !== "object") {
      this.logger.error(new Error("Invalid JSON schema provided"), { schema });
      throw new OpenRouterError("Invalid JSON schema provided", "INVALID_RESPONSE_FORMAT");
    }

    this.currentResponseFormat = schema;
  }

  /**
   * Sets the model and its parameters
   */
  public setModel(name: string, parameters?: ModelParameters): void {
    if (!name.trim()) {
      this.logger.error(new Error("Model name cannot be empty"), { modelName: name, parameters });
      throw new OpenRouterError("Model name cannot be empty", "INVALID_MODEL_NAME");
    }

    this.currentModelName = name;

    if (parameters) {
      this.currentModelParameters = {
        ...this.currentModelParameters,
        ...parameters,
      };
    }
  }

  /**
   * Sends a chat message to the OpenRouter API and returns the response
   * @throws {OpenRouterError} If the request fails or validation fails
   */
  public async sendChatMessage(): Promise<string> {
    if (!this.currentUserMessage) {
      throw new OpenRouterError("User message is required", "MISSING_USER_MESSAGE");
    }

    try {
      // Build and validate the request payload
      const payload = this.buildRequestPayload();
      this.validatePayload(payload);

      // Execute the request with retry logic
      const response = await this.executeRequest(payload);
      this.validateResponse(response);

      // Check if we have any choices in the response
      if (!response.choices.length) {
        throw new OpenRouterError("No response received from the model", "EMPTY_RESPONSE");
      }

      // Return the first choice's content
      return response.choices[0].message.content;
    } catch (error) {
      this.handleSendChatError(error);
    }
  }

  /**
   * Validates the request payload using Zod schema
   */
  private validatePayload(payload: RequestPayload): void {
    try {
      requestPayloadSchema.parse(payload);
    } catch (validationError) {
      const error = validationError as Error;
      this.logger.error(error, {
        validationDetails: validationError instanceof z.ZodError ? validationError.errors : undefined,
        payload: {
          ...payload,
          messages: payload.messages.map((m) => ({
            role: m.role,
            contentLength: m.content.length,
          })),
        },
      });
      throw validationError;
    }
  }

  /**
   * Validates the API response using Zod schema
   */
  private validateResponse(response: ApiResponse): void {
    try {
      apiResponseSchema.parse(response);
    } catch (validationError) {
      const error = validationError as Error;
      this.logger.error(error, {
        validationDetails: validationError instanceof z.ZodError ? validationError.errors : undefined,
        response: {
          choicesCount: response.choices?.length,
          firstChoice: response.choices?.[0]
            ? {
                hasMessage: Boolean(response.choices[0].message),
                messageKeys: response.choices[0].message ? Object.keys(response.choices[0].message) : [],
              }
            : null,
        },
      });
      throw validationError;
    }
  }

  /**
   * Handles errors from the sendChatMessage method
   * @throws {OpenRouterError} Rethrows appropriate error
   */
  private handleSendChatError(error: unknown): never {
    // Log the error with relevant metadata
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.logger.error(errorObj, {
      errorDetails:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              code: error instanceof OpenRouterError ? error.code : undefined,
              validationErrors: error instanceof z.ZodError ? error.errors : undefined,
            }
          : undefined,
      context: {
        modelName: this.currentModelName,
        hasSystemMessage: Boolean(this.currentSystemMessage),
        userMessageLength: this.currentUserMessage.length,
        hasResponseFormat: Boolean(this.currentResponseFormat),
      },
    });

    // Handle validation errors
    if (error instanceof z.ZodError) {
      throw new OpenRouterError(`Validation error: ${error.errors[0].message}`, "VALIDATION_ERROR");
    }

    // Re-throw OpenRouterError instances
    if (error instanceof OpenRouterError) {
      throw error;
    }

    // Handle unexpected errors
    throw new OpenRouterError("An unexpected error occurred", "UNEXPECTED_ERROR");
  }

  /**
   * Builds the request payload for the OpenRouter API
   */
  private buildRequestPayload(): RequestPayload {
    const messages: Message[] = [];

    if (this.currentSystemMessage) {
      messages.push({
        role: "system",
        content: this.currentSystemMessage,
      });
    }

    if (!this.currentUserMessage) {
      throw new OpenRouterError("User message is required", "MISSING_USER_MESSAGE");
    }

    messages.push({
      role: "user",
      content: this.currentUserMessage,
    });

    const payload: RequestPayload = {
      messages,
      model: this.currentModelName,
      ...this.currentModelParameters,
    };

    if (this.currentResponseFormat) {
      payload.response_format = {
        type: "json_schema",
        json_schema: this.currentResponseFormat,
      };
    }

    return payload;
  }

  /**
   * Executes the API request with retry logic
   * @param requestPayload - The validated payload to send
   * @returns ApiResponse from OpenRouter
   */
  private async executeRequest(requestPayload: RequestPayload): Promise<ApiResponse> {
    let lastError: Error | null = null;

    for (let attemptCount = 0; attemptCount < this.maxRetries; attemptCount++) {
      try {
        // Add exponential backoff delay if this is a retry
        if (attemptCount > 0) {
          const delayMs = Math.min(1000 * Math.pow(2, attemptCount - 1), 8000);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

        try {
          const response = await fetch(`${this.apiUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
              "HTTP-Referer": "https://openrouter.ai/",
            },
            body: JSON.stringify(requestPayload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Handle HTTP errors
          if (!response.ok) {
            const errorText = await response.text();
            throw new OpenRouterError(
              `API error: ${response.status} ${response.statusText}: ${errorText}`,
              "API_ERROR",
              response.status
            );
          }

          // Parse response
          const data = await response.json();
          return data as ApiResponse;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on abort errors (timeouts)
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new OpenRouterError("Request timed out", "TIMEOUT_ERROR", 408);
        }

        // Log retry attempt
        if (attemptCount < this.maxRetries - 1) {
          this.logger.warn(`Request failed (attempt ${attemptCount + 1}/${this.maxRetries}). Retrying...`, {
            error: error instanceof Error ? error.message : String(error),
            nextRetryIn: Math.min(1000 * Math.pow(2, attemptCount), 8000),
          });
        }
      }
    }

    // If we've exhausted all retries
    if (lastError instanceof OpenRouterError) {
      throw lastError;
    }

    throw new OpenRouterError(
      `Failed after ${this.maxRetries} attempts: ${lastError?.message || "Unknown error"}`,
      "MAX_RETRIES_EXCEEDED"
    );
  }
}
