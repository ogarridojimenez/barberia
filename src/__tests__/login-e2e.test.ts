import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3025";

test.describe("Login E2E", () => {
  test("login exitoso redirige al dashboard", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator("h1")).toContainText("Gentleman's Cut");

    await page.fill("#login-email", "prueba@test.com");
    await page.fill("#login-password", "test1234");
    await page.click("#login-btn");

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    expect(page.url()).toContain("/dashboard");
  });

  test("login con credenciales inválidas muestra error", async ({ page }) => {
    await page.goto(`${BASE}/login`);

    await page.fill("#login-email", "wrong@test.com");
    await page.fill("#login-password", "wrongpassword");
    await page.click("#login-btn");

    await page.waitForTimeout(3000);
    await expect(page.locator("text=INVALID_CREDENTIALS")).toBeVisible({ timeout: 10000 });
  });

  test("campos vacíos muestra error de validación", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.click("#login-btn");

    await page.waitForTimeout(1000);
    await expect(page.locator("text=requeridos")).toBeVisible({ timeout: 5000 });
  });
});
