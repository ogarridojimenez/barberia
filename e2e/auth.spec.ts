import { test, expect } from "@playwright/test";

test.describe("Route Protection", () => {
  test("should redirect unauthenticated users to login", async ({ page }) => {
    // Try to access protected route
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL("/login", { timeout: 10000 });
  });

  test("should redirect unauthenticated users from citas", async ({ page }) => {
    await page.goto("/citas");

    // Should redirect to login
    await expect(page).toHaveURL("/login", { timeout: 10000 });
  });

  test("should redirect unauthenticated users from perfil", async ({
    page,
  }) => {
    await page.goto("/perfil");

    // Should redirect to login
    await expect(page).toHaveURL("/login", { timeout: 10000 });
  });

  test("should redirect unauthenticated users from admin", async ({
    page,
  }) => {
    await page.goto("/admin");

    // Should redirect to login
    await expect(page).toHaveURL("/login", { timeout: 10000 });
  });

  test("should redirect unauthenticated users from barbero", async ({
    page,
  }) => {
    await page.goto("/barbero");

    // Should redirect to login
    await expect(page).toHaveURL("/login", { timeout: 10000 });
  });

  test("should redirect non-admin users from admin panel", async ({
    page,
  }) => {
    // Login as client
    await page.goto("/login");
    await page.fill('input[type="email"]', "cliente@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });

    // Try to access admin panel
    await page.goto("/admin");

    // Should redirect to dashboard (not admin)
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });

  test("should redirect non-barber users from barber panel", async ({
    page,
  }) => {
    // Login as client
    await page.goto("/login");
    await page.fill('input[type="email"]', "cliente@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });

    // Try to access barber panel
    await page.goto("/barbero");

    // Should redirect to dashboard (not barber)
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });

  test("should redirect authenticated users away from login", async ({
    page,
  }) => {
    // Login as client
    await page.goto("/login");
    await page.fill('input[type="email"]', "cliente@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });

    // Try to access login page
    await page.goto("/login");

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });

  test("should redirect authenticated users away from register", async ({
    page,
  }) => {
    // Login as client
    await page.goto("/login");
    await page.fill('input[type="email"]', "cliente@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });

    // Try to access register page
    await page.goto("/register");

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });
});
