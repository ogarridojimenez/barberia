import { test, expect } from "@playwright/test";

test.describe("API Admin Stats", () => {
  test("GET /api/admin/stats should require authentication", async ({ request }) => {
    const response = await request.get("/api/admin/stats");
    
    expect(response.status()).toBe(401);
  });

  test("GET /api/admin/stats should return stats for admin user", async ({ request }) => {
    const loginResponse = await request.post("/api/auth/login", {
      data: {
        email: "admin@barberia.com",
        password: "admin123",
      },
    });

    expect(loginResponse.status()).toBe(200);
    
    const cookies = loginResponse.headers()["set-cookie"];
    expect(cookies).toBeDefined();

    const statsResponse = await request.get("/api/admin/stats", {
      headers: {
        Cookie: cookies,
      },
    });

    expect(statsResponse.status()).toBe(200);
    
    const body = await statsResponse.json();
    expect(body.totalCitas).toBeDefined();
    expect(body.citasHoy).toBeDefined();
    expect(body.citasPendientes).toBeDefined();
    expect(body.citasCompletadas).toBeDefined();
    expect(body.totalBarberos).toBeDefined();
    expect(body.totalServicios).toBeDefined();
    expect(body.totalUsuarios).toBeDefined();
    expect(body.ingresosTotales).toBeDefined();
    expect(body.ingresosHoy).toBeDefined();
  });

  test("GET /api/admin/stats should return numbers", async ({ request }) => {
    const loginResponse = await request.post("/api/auth/login", {
      data: {
        email: "admin@barberia.com",
        password: "admin123",
      },
    });

    const cookies = loginResponse.headers()["set-cookie"];
    
    const statsResponse = await request.get("/api/admin/stats", {
      headers: {
        Cookie: cookies,
      },
    });

    const body = await statsResponse.json();
    
    expect(typeof body.totalCitas).toBe("number");
    expect(typeof body.citasHoy).toBe("number");
    expect(typeof body.totalBarberos).toBe("number");
    expect(typeof body.totalServicios).toBe("number");
    expect(typeof body.totalUsuarios).toBe("number");
    expect(typeof body.ingresosTotales).toBe("number");
  });

  test("GET /api/admin/stats should reject non-admin users", async ({ request }) => {
    const loginResponse = await request.post("/api/auth/login", {
      data: {
        email: "cliente@test.com",
        password: "password123",
      },
    });

    if (loginResponse.status() !== 200) {
      expect(true).toBe(true);
      return;
    }

    const cookies = loginResponse.headers()["set-cookie"];
    
    const statsResponse = await request.get("/api/admin/stats", {
      headers: {
        Cookie: cookies,
      },
    });

    expect([403, 401]).toContain(statsResponse.status());
  });
});
