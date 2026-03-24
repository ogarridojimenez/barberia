import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display login form", async ({ page }) => {
    // Check form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should show error with invalid credentials", async ({ page }) => {
    await page.fill('input[type="email"]', "invalid@test.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator("text=Credenciales inválidas")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should login successfully with client credentials", async ({
    page,
  }) => {
    await page.fill('input[type="email"]', "cliente@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });

  test("should login successfully with admin credentials", async ({
    page,
  }) => {
    await page.fill('input[type="email"]', "admin@barberia.com");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');

    // Should redirect to admin dashboard
    await expect(page).toHaveURL("/admin", { timeout: 10000 });
  });

  test("should login successfully with barber credentials", async ({
    page,
  }) => {
    await page.fill('input[type="email"]', "barbero@barberia.com");
    await page.fill('input[type="password"]', "barbero123");
    await page.click('button[type="submit"]');

    // Should redirect to barber page
    await expect(page).toHaveURL("/barbero", { timeout: 10000 });
  });

  test("should show validation error for empty fields", async ({ page }) => {
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator("text=Email es requerido")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should show validation error for invalid email format", async ({
    page,
  }) => {
    await page.fill('input[type="email"]', "notanemail");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator("text=Email inválido")).toBeVisible({
      timeout: 5000,
    });
  });
});
