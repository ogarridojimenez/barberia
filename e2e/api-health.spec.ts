import { test, expect } from "@playwright/test";

test.describe("API Health Check", () => {
  test("GET /api/health should return healthy status", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.status).toBe("healthy");
    expect(body.checks.database.status).toBe("ok");
    expect(body.checks.uptime.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
  });

  test("GET /api/health should not be cached", async ({ request }) => {
    const response = await request.get("/api/health");
    
    expect(response.headers()["cache-control"]).toContain("no-store");
  });

  test("GET /api/health should include response time", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();

    expect(body.checks.responseTime.time).toBeDefined();
    expect(typeof body.checks.responseTime.time).toBe("number");
  });
});
