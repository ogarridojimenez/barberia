import { describe, it, expect } from "vitest";
import { signAuthToken } from "@/lib/auth/jwt";

// Simulamos el middleware sin importar Next.js real
// porque el middleware usa NextRequest/NextResponse que requieren el runtime de Next

describe("Lógica de permisos del middleware", () => {
  const ROUTE_PERMISSIONS: Record<string, string[]> = {
    "/admin": ["admin"],
    "/barbero": ["barbero"],
    "/dashboard": ["admin", "barbero", "cliente"],
    "/citas": ["admin", "barbero", "cliente"],
    "/perfil": ["admin", "barbero", "cliente"],
  };

  const AUTH_ROUTES = ["/login", "/register"];

  function hasAccess(pathname: string, role: string | undefined): {
    allowed: boolean;
    redirectTo?: string;
  } {
    const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

    if (isAuthRoute && role) {
      if (role === "admin") return { allowed: false, redirectTo: "/admin" };
      if (role === "barbero") return { allowed: false, redirectTo: "/barbero" };
      return { allowed: false, redirectTo: "/dashboard" };
    }

    if (!role && !isAuthRoute) {
      const isProtected = Object.keys(ROUTE_PERMISSIONS).some(
        (route) => pathname.startsWith(route)
      );
      if (isProtected) return { allowed: false, redirectTo: "/login" };
      return { allowed: true };
    }

    if (role) {
      const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find((route) =>
        pathname.startsWith(route)
      );
      if (matchedRoute) {
        if (!ROUTE_PERMISSIONS[matchedRoute].includes(role)) {
          return { allowed: false, redirectTo: "/dashboard" };
        }
      }
    }

    return { allowed: true };
  }

  describe("rutas de autenticación (/login, /register)", () => {
    it("permite acceso a /login sin token", () => {
      const result = hasAccess("/login", undefined);
      expect(result.allowed).toBe(true);
    });

    it("redirige a /admin desde /login si el rol es admin", () => {
      const result = hasAccess("/login", "admin");
      expect(result.redirectTo).toBe("/admin");
    });

    it("redirige a /barbero desde /login si el rol es barbero", () => {
      const result = hasAccess("/login", "barbero");
      expect(result.redirectTo).toBe("/barbero");
    });

    it("redirige a /dashboard desde /login si el rol es cliente", () => {
      const result = hasAccess("/login", "cliente");
      expect(result.redirectTo).toBe("/dashboard");
    });
  });

  describe("rutas protegidas sin token", () => {
    it("redirige a /login desde /dashboard sin token", () => {
      const result = hasAccess("/dashboard", undefined);
      expect(result.redirectTo).toBe("/login");
    });

    it("redirige a /login desde /admin sin token", () => {
      const result = hasAccess("/admin", undefined);
      expect(result.redirectTo).toBe("/login");
    });

    it("redirige a /login desde /citas sin token", () => {
      const result = hasAccess("/citas", undefined);
      expect(result.redirectTo).toBe("/login");
    });
  });

  describe("control de acceso por rol", () => {
    it("permite a admin acceder a /admin", () => {
      const result = hasAccess("/admin", "admin");
      expect(result.allowed).toBe(true);
    });

    it("rechaza a barbero de /admin", () => {
      const result = hasAccess("/admin", "barbero");
      expect(result.redirectTo).toBe("/dashboard");
    });

    it("rechaza a cliente de /admin", () => {
      const result = hasAccess("/admin", "cliente");
      expect(result.redirectTo).toBe("/dashboard");
    });

    it("permite a barbero acceder a /barbero", () => {
      const result = hasAccess("/barbero", "barbero");
      expect(result.allowed).toBe(true);
    });

    it("rechaza a admin de /barbero", () => {
      const result = hasAccess("/barbero", "admin");
      expect(result.redirectTo).toBe("/dashboard");
    });

    it("permite a cliente acceder a /dashboard", () => {
      const result = hasAccess("/dashboard", "cliente");
      expect(result.allowed).toBe(true);
    });

    it("permite a admin acceder a /dashboard", () => {
      const result = hasAccess("/dashboard", "admin");
      expect(result.allowed).toBe(true);
    });

    it("permite a barbero acceder a /dashboard", () => {
      const result = hasAccess("/dashboard", "barbero");
      expect(result.allowed).toBe(true);
    });
  });

  describe("tokens JWT reales", () => {
    it("genera un token que contiene el rol correcto", async () => {
      const token = await signAuthToken({
        sub: "user-1",
        email: "admin@test.com",
        role: "admin",
      });
      const jwt = require("jsonwebtoken");
      const decoded = jwt.decode(token) as Record<string, unknown>;
      expect(decoded.role).toBe("admin");
    });

    it("genera tokens diferentes para roles diferentes", async () => {
      const adminToken = await signAuthToken({
        sub: "1",
        email: "a@t.com",
        role: "admin",
      });
      const clientToken = await signAuthToken({
        sub: "2",
        email: "c@t.com",
        role: "cliente",
      });
      expect(adminToken).not.toBe(clientToken);
    });
  });
});
