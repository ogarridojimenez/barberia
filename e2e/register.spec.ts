import { test, expect } from "@playwright/test";

test.describe("Register Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("should display register form", async ({ page }) => {
    // Check form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should show error when passwords don't match", async ({ page }) => {
    await page.fill('input[type="email"]', "newuser@test.com");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "differentpassword");
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator("text=Las contraseñas no coinciden")).toBeVisible(
      { timeout: 5000 }
    );
  });

  test("should show error for password too short", async ({ page }) => {
    await page.fill('input[type="email"]', "newuser@test.com");
    await page.fill('input[name="password"]', "short");
    await page.fill('input[name="confirmPassword"]', "short");
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(
      page.locator("text=La contraseña debe tener al menos 8 caracteres")
    ).toBeVisible({ timeout: 5000 });
  });

  test("should show error for duplicate email", async ({ page }) => {
    await page.fill('input[type="email"]', "cliente@test.com");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(
      page.locator("text=El email ya está registrado")
    ).toBeVisible({ timeout: 5000 });
  });

  test("should register successfully with valid data", async ({ page }) => {
    const uniqueEmail = `testuser${Date.now()}@test.com`;

    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    // Should redirect to login
    await expect(page).toHaveURL("/login", { timeout: 10000 });
  });
});
