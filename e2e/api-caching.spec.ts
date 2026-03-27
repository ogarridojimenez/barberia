import { test, expect } from "@playwright/test";

test.describe("API Caching", () => {
  test("GET /api/servicios should have cache headers", async ({ request }) => {
    const response = await request.get("/api/servicios");
    
    expect(response.status()).toBe(200);
    const cacheControl = response.headers()["cache-control"];
    expect(cacheControl).toContain("public");
    expect(cacheControl).toContain("max-age=300");
    expect(cacheControl).toContain("stale-while-revalidate");
  });

  test("GET /api/barberos should have cache headers", async ({ request }) => {
    const response = await request.get("/api/barberos");
    
    expect(response.status()).toBe(200);
    const cacheControl = response.headers()["cache-control"];
    expect(cacheControl).toContain("public");
    expect(cacheControl).toContain("max-age=300");
  });

  test("GET /api/servicios should return valid data", async ({ request }) => {
    const response = await request.get("/api/servicios");
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.servicios).toBeDefined();
    expect(Array.isArray(body.servicios)).toBe(true);
  });

  test("GET /api/barberos should return valid data", async ({ request }) => {
    const response = await request.get("/api/barberos");
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.barberos).toBeDefined();
    expect(Array.isArray(body.barberos)).toBe(true);
  });

  test("GET /api/servicios should have required fields", async ({ request }) => {
    const response = await request.get("/api/servicios");
    const body = await response.json();

    if (body.servicios.length > 0) {
      const servicio = body.servicios[0];
      expect(servicio.id).toBeDefined();
      expect(servicio.nombre).toBeDefined();
      expect(servicio.precio).toBeDefined();
      expect(servicio.duracion_minutos).toBeDefined();
    }
  });

  test("GET /api/barberos should have required fields", async ({ request }) => {
    const response = await request.get("/api/barberos");
    const body = await response.json();

    if (body.barberos.length > 0) {
      const barbero = body.barberos[0];
      expect(barbero.id).toBeDefined();
      expect(barbero.nombre).toBeDefined();
    }
  });
});
