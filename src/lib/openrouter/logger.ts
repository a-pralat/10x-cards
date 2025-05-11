/**
 * Logger utility for consistent error logging across the application
 */
export class Logger {
  private readonly sensitiveKeys = ["apiKey", "token", "password", "secret", "authorization", "key"];

  constructor(private readonly context: string) {}

  /**
   * Logs an error with context and optional metadata
   * Ensures sensitive data is never logged
   */
  error(error: Error, metadata?: Record<string, unknown>): void {
    const sanitizedMetadata = this.sanitizeMetadata(metadata);

    console.error({
      level: "error",
      context: this.context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      metadata: sanitizedMetadata,
      timestamp: this.getTimestamp(),
    });
  }

  /**
   * Logs a warning message with context and optional metadata
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    const sanitizedMetadata = this.sanitizeMetadata(metadata);

    console.warn({
      level: "warn",
      context: this.context,
      message,
      metadata: sanitizedMetadata,
      timestamp: this.getTimestamp(),
    });
  }

  /**
   * Logs an informational message with context and optional metadata
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    const sanitizedMetadata = this.sanitizeMetadata(metadata);

    console.info({
      level: "info",
      context: this.context,
      message,
      metadata: sanitizedMetadata,
      timestamp: this.getTimestamp(),
    });
  }

  /**
   * Removes sensitive data from metadata before logging
   */
  private sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!metadata || Object.keys(metadata).length === 0) {
      return undefined;
    }

    const sanitized = { ...metadata };

    // Check all keys for sensitive information
    for (const key of Object.keys(sanitized)) {
      // If the key contains any sensitive words, redact it
      if (this.isSensitiveKey(key)) {
        sanitized[key] = "[REDACTED]";
        continue;
      }

      // Recursively sanitize nested objects
      if (this.isObject(sanitized[key])) {
        sanitized[key] = this.sanitizeMetadata(sanitized[key] as Record<string, unknown>);
      }
    }

    return sanitized;
  }

  /**
   * Checks if a key might contain sensitive information
   */
  private isSensitiveKey(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return this.sensitiveKeys.some((sensitiveKey) => lowerKey.includes(sensitiveKey));
  }

  /**
   * Returns the current timestamp in ISO format
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Checks if a value is an object and not null or an array
   */
  private isObject(value: unknown): boolean {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
