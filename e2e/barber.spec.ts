import { test, expect } from "@playwright/test";

test.describe("Barber Dashboard Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as barber
    await page.goto("/login");
    await page.fill('input[type="email"]', "barbero@barberia.com");
    await page.fill('input[type="password"]', "barbero123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/barbero", { timeout: 10000 });
  });

  test("should display barber dashboard", async ({ page }) => {
    // Check dashboard title
    await expect(page.locator("text=Mis Citas")).toBeVisible();
  });

  test("should display appointments grouped by date", async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check for date headers or appointment cards
    const hasAppointments =
      (await page.locator("text=Hoy").isVisible()) ||
      (await page.locator("text=Citas programadas").isVisible()) ||
      (await page.locator("text=No tienes citas").isVisible());

    expect(hasAppointments).toBe(true);
  });

  test("should show logout button", async ({ page }) => {
    // Check for logout button
    await expect(page.locator("text=Cerrar sesión")).toBeVisible();
  });

  test("should logout successfully", async ({ page }) => {
    // Click logout button
    await page.click("text=Cerrar sesión");

    // Should redirect to login
    await expect(page).toHaveURL("/login", { timeout: 10000 });
  });
});
