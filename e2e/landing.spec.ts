import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should display the landing page correctly", async ({ page }) => {
    await page.goto("/");

    // Check main heading
    await expect(page.locator("h1")).toContainText("Donde el estilo");
    await expect(page.locator("h1")).toContainText("encuentra la tradición");

    // Check brand name
    await expect(page.locator("text=Gentleman's Cut")).toBeVisible();

    // Check navigation buttons
    await expect(page.locator("text=Iniciar sesión")).toBeVisible();
    await expect(page.locator("text=Registrarse")).toBeVisible();

    // Check CTA buttons
    await expect(page.locator("text=Reservar Cita")).toBeVisible();
    await expect(page.locator("text=Crear Cuenta")).toBeVisible();

    // Check feature highlights
    await expect(page.locator("text=Cortes de Precision")).toBeVisible();
    await expect(page.locator("text=Afeitado Tradicional")).toBeVisible();
    await expect(page.locator("text=Barba Estilizada")).toBeVisible();
    await expect(page.locator("text=Productos Premium")).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.goto("/");

    await page.click("text=Iniciar sesión");
    await expect(page).toHaveURL("/login");
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/");

    await page.click("text=Registrarse");
    await expect(page).toHaveURL("/register");
  });
});
