/**
 * Test data for authentication tests
 */
export const authTestData = {
  /**
   * Get test user credentials from environment variables or return default test values
   */
  getTestUser() {
    return {
      email: process.env.E2E_USERNAME || "test@example.com",
      password: process.env.E2E_PASSWORD || "TestPassword123!",
    };
  },

  /**
   * Get invalid user credentials for negative testing
   */
  getInvalidUser() {
    return {
      email: "invalid@example.com",
      password: "wrongpassword",
    };
  },

  /**
   * Get user with invalid format for validation testing
   */
  getInvalidFormatUser() {
    return {
      email: "notanemail",
      password: "short",
    };
  },
};
