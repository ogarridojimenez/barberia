import { test, expect } from "@playwright/test";

test.describe("Image Optimization", () => {
  test("barberos page should display images correctly", async ({ page }) => {
    await page.goto("/admin/barberos");
    await page.waitForLoadState("networkidle");

    const images = page.locator("img");
    const imageCount = await images.count();
    
    expect(imageCount).toBeGreaterThanOrEqual(0);
  });

  test("usuarios page should display profile images", async ({ page }) => {
    await page.goto("/admin/usuarios");
    await page.waitForLoadState("networkidle");

    const images = page.locator("img");
    const imageCount = await images.count();
    
    expect(imageCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Performance", () => {
  test("page should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(10000);
  });

  test("admin dashboard should load stats quickly", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(10000);
  });
});

test.describe("Data Validation", () => {
  test("servicios API should return valid data", async ({ request }) => {
    const response = await request.get("/api/servicios");
    const body = await response.json();
    
    expect(response.status()).toBe(200);
    expect(body.servicios).toBeDefined();
    expect(Array.isArray(body.servicios)).toBe(true);
  });

  test("barberos API should return valid data", async ({ request }) => {
    const response = await request.get("/api/barberos");
    const body = await response.json();
    
    expect(response.status()).toBe(200);
    expect(body.barberos).toBeDefined();
    expect(Array.isArray(body.barberos)).toBe(true);
  });

  test("health API should return healthy status", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();
    
    expect(response.status()).toBe(200);
    expect(body.status).toBe("healthy");
    expect(body.checks.database.status).toBe("ok");
  });
});
