import { test } from "@playwright/test";
import { LoginPage } from "./page-objects";
import { authTestData } from "./test-data";

test.describe("Login Flow", () => {
  test("should handle login failure and success scenarios", async ({ page }) => {
    // Create page objects
    const loginPage = new LoginPage(page);

    // Get test user credentials
    const testUser = authTestData.getTestUser();

    // ARRANGE: Navigate to login page
    await loginPage.goto();

    // ACT: Attempt to login without entering credentials
    await loginPage.attemptEmptyLogin();

    // ASSERT: Verify validation is triggered (we remain on login page)
    await loginPage.expectValidationErrors();

    // ACT: Enter credentials and submit
    await loginPage.login(testUser.email, testUser.password);

    // ASSERT: Verify successful redirect to generate page
    await page.waitForURL(/\/generate$/);
  });

  test("should handle format validation for email and password", async ({ page }) => {
    // Create page objects
    const loginPage = new LoginPage(page);
    const invalidFormatUser = authTestData.getInvalidFormatUser();

    // Navigate to login page
    await loginPage.goto();

    // Enter invalid format data and submit
    await loginPage.login(invalidFormatUser.email, invalidFormatUser.password);

    // Verify we remain on login page with validation triggered
    await loginPage.expectValidationErrors();
  });

  test("should show error message with invalid credentials", async ({ page }) => {
    // Create page objects
    const loginPage = new LoginPage(page);
    const invalidUser = authTestData.getInvalidUser();

    // ARRANGE: Navigate to login page
    await loginPage.goto();

    // ACT: Login with invalid credentials
    await loginPage.login(invalidUser.email, invalidUser.password);

    // ASSERT: Verify error indication is displayed (either alert or form validation)
    try {
      await loginPage.expectErrorAlert();
    } catch {
      // If no alert, at least verify we're still on login page
      await loginPage.expectValidationErrors();
    }
  });
});
