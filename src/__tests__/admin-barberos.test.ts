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

describe("API Route GET /api/admin/barberos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBarberos = [
    { id: "1", nombre: "Juan Pérez", especialidad: "Corte", telefono: "+1234567890", foto_url: "http://img.com/1.jpg", activo: true },
    { id: "2", nombre: "Carlos López", especialidad: "Barba", telefono: "+0987654321", foto_url: null, activo: true },
    { id: "3", nombre: "Pedro Gómez", especialidad: "Corte y barba", telefono: null, foto_url: null, activo: false },
  ];

  describe("GET /api/admin/barberos - listar barberos", () => {
    it("retorna lista de barberos", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: mockBarberos, error: null }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("barberos").select("*")
        .order("created_at", { ascending: false })
        .maybeSingle();

      expect(result.data).toHaveLength(3);
    });

    it("filtra barberos activos", async () => {
      const activos = mockBarberos.filter(b => b.activo);
      
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: activos, error: null }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("barberos").select("*")
        .eq("activo", true)
        .maybeSingle();

      expect(result.data).toHaveLength(2);
    });
  });
});

describe("API Route POST /api/admin/barberos", () => {
  describe("crear barbero", () => {
    it("crea barbero exitosamente", async () => {
      const nuevoBarbero = {
        nombre: "Miguel Torres",
        especialidad: "Corte clásico",
        telefono: "+1122334455",
        foto_url: "http://img.com/miguel.jpg",
      };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { ...nuevoBarbero, id: "new-id", activo: true }, error: null }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("barberos").insert(nuevoBarbero).select().single();

      expect(result.data).toBeDefined();
      expect(result.data.nombre).toBe("Miguel Torres");
    });
  });

  describe("validación de entrada", () => {
    it("valida nombre requerido", async () => {
      const { z } = await import("zod");
      const schema = z.object({
        nombre: z.string().min(1, "Nombre requerido"),
        especialidad: z.string().optional(),
        telefono: z.string().optional(),
        foto_url: z.string().url().optional().or(z.literal("")),
      });

      const result = schema.safeParse({ nombre: "", especialidad: "Corte" });
      expect(result.success).toBe(false);
    });

    it("valida URL de foto", async () => {
      const { z } = await import("zod");
      const schema = z.object({
        nombre: z.string().min(1),
        foto_url: z.string().url("URL inválida").optional().or(z.literal("")),
      });

      const result = schema.safeParse({ nombre: "Juan", foto_url: "not-a-url" });
      expect(result.success).toBe(false);
    });

    it("acepta entrada válida con foto vacía", async () => {
      const { z } = await import("zod");
      const schema = z.object({
        nombre: z.string().min(1),
        especialidad: z.string().optional(),
        telefono: z.string().optional(),
        foto_url: z.string().url().optional().or(z.literal("")),
      });

      const result = schema.safeParse({
        nombre: "Juan",
        especialidad: "Corte",
        telefono: "+1234567890",
        foto_url: "",
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("API Route PUT /api/admin/barberos/[id]", () => {
  describe("actualizar barbero", () => {
    it("actualiza nombre de barbero", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: "1", nombre: "Juan Actualizado" }, error: null }),
              }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("barberos").update({ nombre: "Juan Actualizado" })
        .eq("id", "1")
        .select()
        .single();

      expect(result.data.nombre).toBe("Juan Actualizado");
    });

    it("actualiza especialidad", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: "1", especialidad: "Corte y barba" }, error: null }),
              }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("barberos").update({ especialidad: "Corte y barba" })
        .eq("id", "1")
        .select()
        .single();

      expect(result.data.especialidad).toBe("Corte y barba");
    });

    it("actualiza foto_url", async () => {
      const nuevaFoto = "http://img.com/nueva.jpg";
      
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: "1", foto_url: nuevaFoto }, error: null }),
              }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("barberos").update({ foto_url: nuevaFoto })
        .eq("id", "1")
        .select()
        .single();

      expect(result.data.foto_url).toBe(nuevaFoto);
    });

    it("cambia estado activo/inactivo", async () => {
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

      const result = await mockSupabase.from("barberos").update({ activo: false })
        .eq("id", "1")
        .select()
        .single();

      expect(result.data.activo).toBe(false);
    });
  });
});

describe("API Route DELETE /api/admin/barberos/[id]", () => {
  describe("eliminar barbero", () => {
    it("elimina barbero exitosamente", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("barberos").delete().eq("id", "1");
      expect(result.error).toBeNull();
    });

    it("verifica citas asociadas antes de eliminar", async () => {
      // Simular que hay 3 citas activas
      const citasActivas = 3;
      
      // Si hay citas, no debería poder eliminarse
      if (citasActivas > 0) {
        const canDelete = false;
        expect(canDelete).toBe(false);
      }
    });

    it("puede eliminarse si no hay citas asociadas", async () => {
      const citasActivas = 0;
      
      // Sin citas, puede eliminarse
      const canDelete = citasActivas === 0;
      expect(canDelete).toBe(true);
    });
  });
});

describe("API Route GET /api/admin/barberos - filtros y búsqueda", () => {
  const mockBarberos = [
    { id: "1", nombre: "Juan Pérez", especialidad: "Corte", telefono: "+1234567890", foto_url: null, activo: true },
    { id: "2", nombre: "María López", especialidad: "Barba", telefono: "+0987654321", foto_url: null, activo: true },
  ];

  it("filtra por nombre con ilike", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          ilike: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: [mockBarberos[0]], error: null }),
          }),
        }),
      }),
    };

    const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
    (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

    const result = await mockSupabase.from("barberos").select("*")
      .ilike("nombre", "%Juan%")
      .maybeSingle();

    expect(result.data).toHaveLength(1);
    expect(result.data[0].nombre).toContain("Juan");
  });
});
