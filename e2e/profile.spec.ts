import { test, expect } from "@playwright/test";

test.describe("User Profile Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[type="email"]', "cliente@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });

  test("should navigate to profile page", async ({ page }) => {
    await page.goto("/perfil");

    // Check page title
    await expect(page.locator("text=Mi Perfil")).toBeVisible();
  });

  test("should display user email", async ({ page }) => {
    await page.goto("/perfil");

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check that email is displayed
    await expect(page.locator("text=cliente@test.com")).toBeVisible();
  });

  test("should display change password form", async ({ page }) => {
    await page.goto("/perfil");

    // Check password form elements
    await expect(
      page.locator('input[name="currentPassword"]')
    ).toBeVisible();
    await expect(page.locator('input[name="newPassword"]')).toBeVisible();
    await expect(
      page.locator('input[name="confirmPassword"]')
    ).toBeVisible();
  });

  test("should show error when passwords don't match", async ({ page }) => {
    await page.goto("/perfil");

    // Fill password form
    await page.fill('input[name="currentPassword"]', "password123");
    await page.fill('input[name="newPassword"]', "newpassword123");
    await page.fill('input[name="confirmPassword"]', "differentpassword");

    // Submit form
    await page.click('button:has-text("Cambiar contraseña")');

    // Should show error
    await expect(page.locator("text=Las contraseñas no coinciden")).toBeVisible(
      { timeout: 5000 }
    );
  });

  test("should show error for wrong current password", async ({ page }) => {
    await page.goto("/perfil");

    // Fill password form with wrong current password
    await page.fill('input[name="currentPassword"]', "wrongpassword");
    await page.fill('input[name="newPassword"]', "newpassword123");
    await page.fill('input[name="confirmPassword"]', "newpassword123");

    // Submit form
    await page.click('button:has-text("Cambiar contraseña")');

    // Should show error
    await expect(
      page.locator("text=Contraseña actual incorrecta")
    ).toBeVisible({ timeout: 5000 });
  });

  test("should change password successfully", async ({ page }) => {
    await page.goto("/perfil");

    // Fill password form
    await page.fill('input[name="currentPassword"]', "password123");
    await page.fill('input[name="newPassword"]', "newpassword123");
    await page.fill('input[name="confirmPassword"]', "newpassword123");

    // Submit form
    await page.click('button:has-text("Cambiar contraseña")');

    // Should show success message
    await expect(page.locator("text=Contraseña actualizada")).toBeVisible({
      timeout: 5000,
    });

    // Change password back to original for other tests
    await page.fill('input[name="currentPassword"]', "newpassword123");
    await page.fill('input[name="newPassword"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");
    await page.click('button:has-text("Cambiar contraseña")');
  });
});
