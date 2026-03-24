import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mocks
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyAuthToken: vi.fn(),
  getTokenFromRequest: vi.fn(),
}));

vi.mock("@/lib/api-errors", () => ({
  internalError: vi.fn(() => {
    return new Response(JSON.stringify({ error: "INTERNAL_ERROR" }), { status: 500 });
  }),
}));

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyAuthToken, getTokenFromRequest } from "@/lib/auth/jwt";

describe("API Route /api/citas", () => {
  const mockPayload = {
    sub: "user-123",
    email: "cliente@test.com",
    role: "cliente",
  };

  const mockCitas = [
    {
      id: "cita-1",
      fecha: "2026-03-25",
      hora_inicio: "10:00:00",
      hora_fin: "10:30:00",
      estado: "activa",
      notas: "Test nota",
      barbero: { nombre: "Carlos" },
      servicio: { nombre: "Corte", precio: 150 },
    },
  ];

  let mockSupabase: {
    from: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockCitas, error: null }),
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: mockCitas, error: null }),
                }),
              }),
            }),
          }),
        }),
      }),
    };

    (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);
    (getTokenFromRequest as ReturnType<typeof vi.fn>).mockReturnValue("valid-token");
    (verifyAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockPayload);
  });

  describe("GET /api/citas", () => {
    it("requiere token de autenticación", async () => {
      (getTokenFromRequest as ReturnType<typeof vi.fn>).mockReturnValue(null);

      const { GET } = await import("@/app/api/citas/route");
      const req = new NextRequest("http://localhost/api/citas");
      const res = await GET(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("MISSING_TOKEN");
    });

    it("rechaza token inválido", async () => {
      (verifyAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { GET } = await import("@/app/api/citas/route");
      const req = new NextRequest("http://localhost/api/citas");
      const res = await GET(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("INVALID_TOKEN");
    });

    it("retorna citas del usuario autenticado", async () => {
      const { GET } = await import("@/app/api/citas/route");
      const req = new NextRequest("http://localhost/api/citas");
      const res = await GET(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.citas).toBeDefined();
      expect(Array.isArray(data.citas)).toBe(true);
    });
  });

  describe("POST /api/citas", () => {
    const validCitaData = {
      barbero_id: "550e8400-e29b-41d4-a716-446655440000",
      servicio_id: "550e8400-e29b-41d4-a716-446655440001",
      fecha: "2026-03-25",
      hora_inicio: "10:00:00",
      hora_fin: "10:30:00",
      notas: "Test nota",
    };

    beforeEach(() => {
      mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "citas") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                      eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: null, error: null }),
                      }),
                    }),
                  }),
                }),
              }),
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: "new-cita-123", ...validCitaData, estado: "activa", usuario_id: mockPayload.sub },
                    error: null,
                  }),
                }),
              }),
            };
          }
          return { select: vi.fn() };
        }),
      };
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);
    });

    it("requiere autenticación", async () => {
      (getTokenFromRequest as ReturnType<typeof vi.fn>).mockReturnValue(null);

      const { POST } = await import("@/app/api/citas/route");
      const req = new NextRequest("http://localhost/api/citas", {
        method: "POST",
        body: JSON.stringify(validCitaData),
      });
      const res = await POST(req);

      expect(res.status).toBe(401);
    });

    it("rechaza datos inválidos", async () => {
      const { POST } = await import("@/app/api/citas/route");
      const req = new NextRequest("http://localhost/api/citas", {
        method: "POST",
        body: JSON.stringify({ invalid: "data" }),
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("INVALID_INPUT");
    });

    it("crea una cita con datos válidos", async () => {
      const { POST } = await import("@/app/api/citas/route");
      const req = new NextRequest("http://localhost/api/citas", {
        method: "POST",
        body: JSON.stringify(validCitaData),
      });
      const res = await POST(req);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.cita).toBeDefined();
      expect(data.cita.estado).toBe("activa");
    });
  });
});
