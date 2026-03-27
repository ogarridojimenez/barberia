import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("admin usuarios page should load correctly after login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@barberia.com");
    await page.getByLabel("Contraseña").fill("admin123");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL("**/admin", { timeout: 10000 });
    
    await page.goto("/admin/usuarios");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Gestión de Usuarios")).toBeVisible({ timeout: 10000 });
  });

  test("admin servicios page should load correctly after login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@barberia.com");
    await page.getByLabel("Contraseña").fill("admin123");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL("**/admin", { timeout: 10000 });
    
    await page.goto("/admin/servicios");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Gestión de Servicios")).toBeVisible({ timeout: 10000 });
  });

  test("admin barberos page should load correctly after login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@barberia.com");
    await page.getByLabel("Contraseña").fill("admin123");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL("**/admin", { timeout: 10000 });
    
    await page.goto("/admin/barberos");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Gestión de Barberos")).toBeVisible({ timeout: 10000 });
  });

  test("login page should have proper labels", async ({ page }) => {
    await page.goto("/login");
    
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
  });

  test("login form should be submittable", async ({ page }) => {
    await page.goto("/login");
    
    await page.getByLabel("Email").fill("admin@barberia.com");
    await page.getByLabel("Contraseña").fill("admin123");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    
    await page.waitForURL("**/admin", { timeout: 10000 });
  });
});
