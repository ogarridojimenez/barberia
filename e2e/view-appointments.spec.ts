import { test, expect } from "@playwright/test";

test.describe("View Appointments Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[type="email"]', "cliente@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });

  test("should navigate to citas page", async ({ page }) => {
    await page.goto("/citas");

    // Check page title
    await expect(page.locator("text=Mis Citas")).toBeVisible();
  });

  test("should display active appointments section", async ({ page }) => {
    await page.goto("/citas");

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check for active appointments section
    await expect(page.locator("text=Citas Activas")).toBeVisible();
  });

  test("should display cancelled appointments section", async ({ page }) => {
    await page.goto("/citas");

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check for cancelled appointments section
    await expect(page.locator("text=Citas Canceladas")).toBeVisible();
  });

  test("should show Nueva Cita button", async ({ page }) => {
    await page.goto("/citas");

    // Check for new appointment button
    await expect(page.locator("text=Nueva Cita")).toBeVisible();
  });

  test("should navigate to new appointment from citas page", async ({
    page,
  }) => {
    await page.goto("/citas");

    // Click Nueva Cita button
    await page.click("text=Nueva Cita");

    // Should navigate to new appointment page
    await expect(page).toHaveURL("/citas/nueva");
  });
});
