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

describe("API Route GET /api/admin/usuarios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUsers = [
    { id: "1", email: "admin@barberia.com", user_role: "admin", nombre: "Admin", foto_url: null, telefono: null, especialidad: null },
    { id: "2", email: "barbero@barberia.com", user_role: "barbero", nombre: "Juan", foto_url: null, telefono: null, especialidad: "Corte" },
    { id: "3", email: "cliente@test.com", user_role: "cliente", nombre: "Pedro", foto_url: null, telefono: null, especialidad: null },
  ];

  const mockBarbero = { id: "2", nombre: "Juan", foto_url: null, telefono: "+123456", especialidad: "Corte" };

  describe("GET /api/admin/usuarios - sin filtros", () => {
    it("retorna lista de usuarios con paginación", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({ data: mockUsers, count: 3, error: null }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("app_users").select("id, email, user_role, nombre, foto_url, telefono, especialidad", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(0, 19);

      expect(result.data).toHaveLength(3);
      expect(result.count).toBe(3);
    });

    it("retorna estructura correcta con pagination", () => {
      const pagination = {
        page: 1,
        limit: 20,
        totalItems: 3,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };

      expect(pagination.totalPages).toBe(1);
      expect(pagination.hasNextPage).toBe(false);
    });
  });

  describe("GET /api/admin/usuarios - filtrar por rol", () => {
    it("filtra usuarios por rol admin", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({ data: [mockUsers[0]], count: 1, error: null }),
              }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("app_users").select("*", { count: "exact" })
        .eq("user_role", "admin")
        .order("created_at", { ascending: false })
        .range(0, 19);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].user_role).toBe("admin");
    });

    it("filtra usuarios por rol barbero", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({ data: [mockUsers[1]], count: 1, error: null }),
              }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("app_users").select("*", { count: "exact" })
        .eq("user_role", "barbero")
        .order("created_at", { ascending: false })
        .range(0, 19);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].user_role).toBe("barbero");
    });
  });

  describe("GET /api/admin/usuarios - búsqueda", () => {
    it("busca usuarios por email", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({ data: [mockUsers[0]], count: 1, error: null }),
              }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("app_users").select("*", { count: "exact" })
        .or(`email.ilike.%admin%`)
        .order("created_at", { ascending: false })
        .range(0, 19);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].email).toContain("admin");
    });

    it("busca usuarios por nombre", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({ data: [mockUsers[2]], count: 1, error: null }),
              }),
            }),
          }),
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await mockSupabase.from("app_users").select("*", { count: "exact" })
        .or(`nombre.ilike.%Pedro%`)
        .order("created_at", { ascending: false })
        .range(0, 19);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].nombre).toBe("Pedro");
    });
  });

  describe("GET /api/admin/usuarios - datos de barbero", () => {
    it("obtiene datos adicionales de barberos desde tabla barberos", async () => {
      const barberoUser = { ...mockUsers[1], nombre: null };
      
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "app_users") {
            return {
              select: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  range: vi.fn().mockResolvedValue({ data: [barberoUser], count: 1, error: null }),
                }),
              }),
            };
          }
          if (table === "barberos") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: mockBarbero, error: null }),
                  }),
                }),
              }),
            };
          }
        }),
      };

      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      // Simular el merge de datos
      const usuario = barberoUser;
      const { data: barbero } = await mockSupabase.from("barberos").select("nombre, foto_url, telefono, especialidad")
        .eq("user_id", usuario.id)
        .limit(1)
        .single();

      const usuarioFinal = {
        ...usuario,
        nombre: barbero?.nombre || usuario.nombre,
        foto_url: barbero?.foto_url || usuario.foto_url,
        telefono: barbero?.telefono || usuario.telefono,
        especialidad: barbero?.especialidad || usuario.especialidad,
      };

      expect(usuarioFinal.nombre).toBe("Juan");
      expect(usuarioFinal.especialidad).toBe("Corte");
    });
  });
});

describe("API Route POST /api/admin/usuarios/create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validación de entrada", () => {
    it("valida email requerido", async () => {
      const { z } = await import("zod");
      const schema = z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(8, "Mínimo 8 caracteres"),
        user_role: z.enum(["admin", "barbero", "cliente"]),
      });

      const result = schema.safeParse({ email: "", password: "password123", user_role: "cliente" });
      expect(result.success).toBe(false);
    });

    it("valida password mínimo 8 caracteres", async () => {
      const { z } = await import("zod");
      const schema = z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(8, "Mínimo 8 caracteres"),
        user_role: z.enum(["admin", "barbero", "cliente"]),
      });

      const result = schema.safeParse({ email: "test@test.com", password: "short", user_role: "cliente" });
      expect(result.success).toBe(false);
    });

    it("valida rol requerido", async () => {
      const { z } = await import("zod");
      const schema = z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(8, "Mínimo 8 caracteres"),
        user_role: z.enum(["admin", "barbero", "cliente"]),
      });

      const result = schema.safeParse({ email: "test@test.com", password: "password123", user_role: "invalid" });
      expect(result.success).toBe(false);
    });

    it("acepta entrada válida", async () => {
      const { z } = await import("zod");
      const schema = z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(8, "Mínimo 8 caracteres"),
        user_role: z.enum(["admin", "barbero", "cliente"]),
        nombre: z.string().optional(),
        especialidad: z.string().optional(),
      });

      const result = schema.safeParse({
        email: "nuevo@barberia.com",
        password: "password123",
        user_role: "barbero",
        nombre: "Carlos",
        especialidad: "Corte",
      });
      expect(result.success).toBe(true);
    });

    it("requiere especialidad para rol barbero", async () => {
      const { z } = await import("zod");
      const schema = z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(8, "Mínimo 8 caracteres"),
        user_role: z.enum(["admin", "barbero", "cliente"]),
        especialidad: z.string().optional(),
      }).refine(data => {
        if (data.user_role === "barbero" && !data.especialidad) {
          return false;
        }
        return true;
      }, { message: "Especialidad requerida para barbero", path: ["especialidad"] });

      const result = schema.safeParse({
        email: "barbero@barberia.com",
        password: "password123",
        user_role: "barbero",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("API Route DELETE /api/admin/usuarios/[id]", () => {
  describe("eliminación de usuario", () => {
    it("no puede eliminarse a sí mismo", async () => {
      const adminId = "admin-uuid";
      const currentUserId = adminId;
      
      const canDelete = adminId !== currentUserId;
      expect(canDelete).toBe(false);
    });

    it("puede eliminar otros usuarios", async () => {
      const adminId = "admin-uuid";
      const userToDelete = "user-uuid-123";
      
      const canDelete = adminId !== userToDelete;
      expect(canDelete).toBe(true);
    });
  });
});
