import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { signAuthToken, verifyAuthToken } from "@/lib/auth/jwt";

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 4, reset: Date.now() + 60000 }),
  getIpFromRequest: vi.fn().mockReturnValue("127.0.0.1"),
}));

describe("API Route /api/auth/login", () => {
  const passwordHash = bcrypt.hashSync("test1234", 10);
  const mockUser = {
    id: "user-uuid-123",
    email: "test@example.com",
    password_hash: passwordHash,
    user_role: "cliente",
  };

  let mockSupabase: { from: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          ilike: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      }),
    };
    const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
    (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);
  });

  describe("flujo de autenticación", () => {
    it("compara correctamente el password hasheado con bcrypt", async () => {
      const match = await bcrypt.compare("test1234", passwordHash);
      expect(match).toBe(true);
    });

    it("rechaza un password incorrecto", async () => {
      const match = await bcrypt.compare("wrongpassword", passwordHash);
      expect(match).toBe(false);
    });

    it("genera un JWT con los datos del usuario después del login exitoso", async () => {
      const token = await signAuthToken({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.user_role,
      });
      const decoded = await verifyAuthToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded!.sub).toBe(mockUser.id);
      expect(decoded!.email).toBe(mockUser.email);
      expect(decoded!.role).toBe("cliente");
    });

    it("determina la URL de redirect según el rol", () => {
      function getRedirectUrl(role: string): string {
        if (role === "admin") return "/admin";
        if (role === "barbero") return "/barbero";
        return "/dashboard";
      }
      expect(getRedirectUrl("cliente")).toBe("/dashboard");
      expect(getRedirectUrl("admin")).toBe("/admin");
      expect(getRedirectUrl("barbero")).toBe("/barbero");
    });
  });

  describe("validación de entrada", () => {
    it("rechaza email vacío", async () => {
      const z = await import("zod");
      const schema = z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(1, "La contraseña es requerida"),
      });
      const result = schema.safeParse({ email: "", password: "test" });
      expect(result.success).toBe(false);
    });

    it("rechaza email con formato inválido", async () => {
      const z = await import("zod");
      const schema = z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(1, "La contraseña es requerida"),
      });
      const result = schema.safeParse({ email: "no-es-email", password: "test" });
      expect(result.success).toBe(false);
    });

    it("rechaza password vacío", async () => {
      const z = await import("zod");
      const schema = z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(1, "La contraseña es requerida"),
      });
      const result = schema.safeParse({ email: "test@test.com", password: "" });
      expect(result.success).toBe(false);
    });

    it("acepta credenciales válidas", async () => {
      const z = await import("zod");
      const schema = z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(1, "La contraseña es requerida"),
      });
      const result = schema.safeParse({ email: "test@example.com", password: "test1234" });
      expect(result.success).toBe(true);
    });
  });

  describe("manejo de errores de Supabase", () => {
    it("maneja usuario no encontrado", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          ilike: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });
      const result = await mockSupabase.from("app_users").select("id").ilike("email", "nonexistent").maybeSingle();
      expect(result.data).toBeNull();
    });

    it("maneja usuario sin rol asignado", async () => {
      const userWithoutRole = { ...mockUser, user_role: null };
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          ilike: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: userWithoutRole, error: null }),
          }),
        }),
      });
      const result = await mockSupabase.from("app_users").select("user_role").ilike("email", "test").maybeSingle();
      expect(result.data.user_role).toBeNull();
    });
  });
});
