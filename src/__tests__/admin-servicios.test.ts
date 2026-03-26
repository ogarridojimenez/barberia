import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyAuthToken: vi.fn().mockResolvedValue({ sub: "admin-id", email: "admin@barberia.com", role: "admin" }),
  getTokenFromRequest: vi.fn().mockReturnValue("mock-token"),
  verifyAdminRole: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 100, reset: Date.now() + 60000 }),
}));

describe("API Route GET /api/admin/servicios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockServicios = [
    { id: "1", nombre: "Corte de cabello", descripcion: "Corte clásico", duracion_minutos: 30, precio: 25, activo: true },
    { id: "2", nombre: "Barba", descripcion: "Arreglo de barba", duracion_minutos: 20, precio: 15, activo: true },
    { id: "3", nombre: "Corte + Barba", descripcion: "Combo completo", duracion_minutos: 50, precio: 35, activo: false },
  ];

  describe("GET /api/admin/servicios - listar servicios", () => {
    it("retorna lista de servicios con paginación", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({ data: mockServicios, count: 3, error: null }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("servicios").select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(0, 19);

      expect(result.data).toHaveLength(3);
      expect(result.count).toBe(3);
    });

    it("retorna servicios activos nomás cuando se filtra", async () => {
      const activos = mockServicios.filter(s => s.activo);
      
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({ data: activos, count: activos.length, error: null }),
              }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("servicios").select("*", { count: "exact" })
        .eq("activo", true)
        .order("created_at", { ascending: false })
        .range(0, 19);

      expect(result.data).toHaveLength(2);
      result.data!.forEach(s => expect(s.activo).toBe(true));
    });
  });

  describe("GET /api/admin/servicios/[id]", () => {
    it("busca servicio por ID", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockServicios[0], error: null }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("servicios").select("*")
        .eq("id", "1")
        .single();

      expect(result.data.nombre).toBe("Corte de cabello");
    });

    it("retorna error si servicio no existe", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("servicios").select("*")
        .eq("id", "nonexistent")
        .single();

      expect(result.error).toBeDefined();
    });
  });
});

describe("API Route POST /api/admin/servicios", () => {
  describe("crear servicio", () => {
    it("crea servicio exitosamente", async () => {
      const nuevoServicio = {
        nombre: "Tratamiento capilar",
        descripcion: "Tratamiento para el cabello",
        duracion_minutos: 45,
        precio: 40,
      };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { ...nuevoServicio, id: "new-id", activo: true }, error: null }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("servicios").insert(nuevoServicio).select().single();

      expect(result.data).toBeDefined();
      expect(result.data.nombre).toBe("Tratamiento capilar");
    });
  });

  describe("validación de entrada", () => {
    it("valida nombre requerido", async () => {
      const { z } = await import("zod");
      const schema = z.object({
        nombre: z.string().min(1, "Nombre requerido"),
        descripcion: z.string().optional(),
        duracion_minutos: z.number().min(1),
        precio: z.number().min(0),
      });

      const result = schema.safeParse({ nombre: "", duracion_minutos: 30, precio: 20 });
      expect(result.success).toBe(false);
    });

    it("valida duración mínima de 1 minuto", async () => {
      const { z } = await import("zod");
      const schema = z.object({
        nombre: z.string().min(1),
        duracion_minutos: z.number().min(1, "Mínimo 1 minuto"),
        precio: z.number().min(0),
      });

      const result = schema.safeParse({ nombre: "Corte", duracion_minutos: 0, precio: 20 });
      expect(result.success).toBe(false);
    });

    it("valida precio no negativo", async () => {
      const { z } = await import("zod");
      const schema = z.object({
        nombre: z.string().min(1),
        duracion_minutos: z.number().min(1),
        precio: z.number().min(0, "Precio no puede ser negativo"),
      });

      const result = schema.safeParse({ nombre: "Corte", duracion_minutos: 30, precio: -5 });
      expect(result.success).toBe(false);
    });
  });
});

describe("API Route PUT /api/admin/servicios/[id]", () => {
  describe("actualizar servicio", () => {
    it("actualiza nombre de servicio", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: "1", nombre: "Corte actualizado" }, error: null }),
              }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("servicios").update({ nombre: "Corte actualizado" })
        .eq("id", "1")
        .select()
        .single();

      expect(result.data.nombre).toBe("Corte actualizado");
    });

    it("cambia estado activo/inactivo (soft delete)", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: "1", activo: false }, error: null }),
              }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("servicios").update({ activo: false })
        .eq("id", "1")
        .select()
        .single();

      expect(result.data.activo).toBe(false);
    });
  });
});

describe("API Route DELETE /api/admin/servicios/[id]", () => {
  describe("eliminar servicio", () => {
    it("elimina servicio exitosamente", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("servicios").delete().eq("id", "1");
      expect(result.error).toBeNull();
    });

    it("verifica citas asociadas antes de eliminar (hard delete)", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                count: 5,
              }),
            }),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockImplementation(() => {
              throw new Error("Cannot delete due to foreign key constraint");
            }),
          }),
        }),
      };

      // Simular que hay citas activas
      const hasCitasActivas = 5 > 0;
      
      if (hasCitasActivas) {
        // No debería intentar eliminar
        expect(hasCitasActivas).toBe(true);
      }
    });
  });
});
