import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@barberia.com");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/admin", { timeout: 10000 });
  });

  test("should display admin dashboard", async ({ page }) => {
    // Check dashboard title
    await expect(page.locator("text=Panel de Administración")).toBeVisible();
  });

  test("should display statistics cards", async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check for stat cards
    await expect(page.locator("text=Citas hoy")).toBeVisible();
    await expect(page.locator("text=Barberos")).toBeVisible();
    await expect(page.locator("text=Servicios")).toBeVisible();
    await expect(page.locator("text=Usuarios")).toBeVisible();
  });

  test("should navigate to citas management", async ({ page }) => {
    // Click on Citas link in sidebar
    await page.click("text=Citas");

    // Should navigate to admin citas page
    await expect(page).toHaveURL("/admin/citas");
  });

  test("should navigate to barberos management", async ({ page }) => {
    // Click on Barberos link in sidebar
    await page.click("text=Barberos");

    // Should navigate to admin barberos page
    await expect(page).toHaveURL("/admin/barberos");
  });

  test("should navigate to servicios management", async ({ page }) => {
    // Click on Servicios link in sidebar
    await page.click("text=Servicios");

    // Should navigate to admin servicios page
    await expect(page).toHaveURL("/admin/servicios");
  });

  test("should navigate to usuarios management", async ({ page }) => {
    // Click on Usuarios link in sidebar
    await page.click("text=Usuarios");

    // Should navigate to admin usuarios page
    await expect(page).toHaveURL("/admin/usuarios");
  });
});

test.describe("Admin Barber Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@barberia.com");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/admin", { timeout: 10000 });

    // Navigate to barberos
    await page.click("text=Barberos");
    await expect(page).toHaveURL("/admin/barberos");
  });

  test("should display barbers list", async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check for barbers table
    await expect(page.locator("text=Gestión de Barberos")).toBeVisible();
  });

  test("should show new barber button", async ({ page }) => {
    // Check for new barber button
    await expect(page.locator("text=Nuevo Barbero")).toBeVisible();
  });

  test("should open new barber modal", async ({ page }) => {
    // Click new barber button
    await page.click("text=Nuevo Barbero");

    // Check modal is open
    await expect(page.locator("text=Crear Barbero")).toBeVisible();
  });
});

test.describe("Admin Service Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@barberia.com");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/admin", { timeout: 10000 });

    // Navigate to servicios
    await page.click("text=Servicios");
    await expect(page).toHaveURL("/admin/servicios");
  });

  test("should display services list", async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check for services table
    await expect(page.locator("text=Gestión de Servicios")).toBeVisible();
  });

  test("should show new service button", async ({ page }) => {
    // Check for new service button
    await expect(page.locator("text=Nuevo Servicio")).toBeVisible();
  });

  test("should open new service modal", async ({ page }) => {
    // Click new service button
    await page.click("text=Nuevo Servicio");

    // Check modal is open
    await expect(page.locator("text=Crear Servicio")).toBeVisible();
  });
});

test.describe("Admin User Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@barberia.com");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/admin", { timeout: 10000 });

    // Navigate to usuarios
    await page.click("text=Usuarios");
    await expect(page).toHaveURL("/admin/usuarios");
  });

  test("should display users list", async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check for users table
    await expect(page.locator("text=Gestión de Usuarios")).toBeVisible();
  });

  test("should display user roles", async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check for role badges
    await expect(page.locator("text=Cliente")).toBeVisible();
  });
});
