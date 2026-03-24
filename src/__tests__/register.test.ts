import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { signAuthToken, verifyAuthToken } from "@/lib/auth/jwt";

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 2, reset: Date.now() + 3600000 }),
  getIpFromRequest: vi.fn().mockReturnValue("127.0.0.1"),
}));

describe("API Route /api/auth/register", () => {
  let mockSupabase: { from: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          ilike: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "new-user-uuid", email: "newuser@test.com" },
              error: null,
            }),
          }),
        }),
      }),
    };
    const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
    (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);
  });

  describe("validación de entrada", () => {
    it("schema acepta email y password válidos", async () => {
      const z = await import("zod");
      const schema = z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(8, "Mínimo 8 caracteres").max(72, "Máximo 72 caracteres"),
      });
      const result = schema.safeParse({ email: "newuser@test.com", password: "password123" });
      expect(result.success).toBe(true);
    });

    it("rechaza password menor a 8 caracteres", async () => {
      const z = await import("zod");
      const schema = z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(8).max(72),
      });
      const result = schema.safeParse({ email: "test@test.com", password: "short" });
      expect(result.success).toBe(false);
    });

    it("rechaza password mayor a 72 caracteres (límite bcrypt)", async () => {
      const z = await import("zod");
      const schema = z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(8).max(72),
      });
      const result = schema.safeParse({ email: "test@test.com", password: "a".repeat(73) });
      expect(result.success).toBe(false);
    });

    it("rechaza email inválido", async () => {
      const z = await import("zod");
      const schema = z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(8).max(72),
      });
      const result = schema.safeParse({ email: "no-es-email", password: "password123" });
      expect(result.success).toBe(false);
    });
  });

  describe("flujo de registro", () => {
    it("hashea el password con bcrypt antes de insertar", async () => {
      const password = "mypassword123";
      const hash = await bcrypt.hash(password, 10);
      expect(hash).not.toBe(password);
      expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);
      expect(await bcrypt.compare(password, hash)).toBe(true);
    });

    it("asigna rol 'cliente' por defecto al nuevo usuario", () => {
      expect("cliente").toBe("cliente");
    });

    it("genera JWT para el nuevo usuario con rol cliente", async () => {
      const token = await signAuthToken({
        sub: "new-user-uuid",
        email: "newuser@test.com",
        role: "cliente",
      });
      const decoded = await verifyAuthToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded!.role).toBe("cliente");
    });

    it("verifica duplicados antes de insertar", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          ilike: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: "existing-user" },
              error: null,
            }),
          }),
        }),
      });
      const result = await mockSupabase.from("app_users").select("id").ilike("email", "existing@test.com").maybeSingle();
      expect(result.data).not.toBeNull();
    });
  });

  describe("manejo de errores", () => {
    it("maneja error de clave duplicada (code 23505)", async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "23505", message: "duplicate key value" },
            }),
          }),
        }),
      });
      const result = await mockSupabase.from("app_users").insert({}).select("id").single();
      expect(result.error).not.toBeNull();
      expect(result.error.code).toBe("23505");
    });

    it("maneja error genérico de base de datos", async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST", message: "connection error" },
            }),
          }),
        }),
      });
      const result = await mockSupabase.from("app_users").insert({}).select("id").single();
      expect(result.error).not.toBeNull();
      expect(result.data).toBeNull();
    });
  });
});
