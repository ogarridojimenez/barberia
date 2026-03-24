import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthToken, verifyAdminRole, verifyBarberoRole, getTokenFromRequest, type AuthTokenPayload } from "@/lib/auth/jwt";
import { internalError } from "@/lib/api-errors";

type RouteContext = {
  params: Promise<{ [key: string]: string }>;
};

type RouteHandler<T extends RouteContext = RouteContext> = (
  req: NextRequest,
  context: T,
  payload: AuthTokenPayload
) => Promise<NextResponse>;

type AuthOptions = {
  requireAdmin?: boolean;
  requireBarbero?: boolean;
  roles?: string[];
};

/**
 * Wrapper que maneja autenticación y autorización para API routes.
 *
 * Uso:
 * export const GET = withAuth(async (req, ctx, payload) => {
 *   // payload ya está verificado
 *   return NextResponse.json({ data: "ok" });
 * });
 *
 * Con rol específico:
 * export const GET = withAuth(async (req, ctx, payload) => {
 *   return NextResponse.json({ data: "ok" });
 * }, { requireAdmin: true });
 */
export function withAuth<T extends RouteContext = RouteContext>(handler: RouteHandler<T>, options: AuthOptions = {}) {
  return async (
    req: NextRequest,
    context: T
  ): Promise<NextResponse> => {
    try {
      // Verificar token
      const token = getTokenFromRequest(req);
      if (!token) {
        return NextResponse.json({ error: "MISSING_TOKEN" }, { status: 401 });
      }

      const payload = await verifyAuthToken(token);
      if (!payload) {
        return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 });
      }

      // Verificar rol de admin si se requiere
      if (options.requireAdmin && !verifyAdminRole(payload)) {
        return NextResponse.json(
          { error: "FORBIDDEN", message: "Se requiere rol de administrador" },
          { status: 403 }
        );
      }

      // Verificar rol de barbero si se requiere
      if (options.requireBarbero && !verifyBarberoRole(payload)) {
        return NextResponse.json(
          { error: "FORBIDDEN", message: "Se requiere rol de barbero" },
          { status: 403 }
        );
      }

      // Verificar roles específicos si se proporcionan
      if (options.roles && !options.roles.includes(payload.role || "")) {
        return NextResponse.json(
          { error: "FORBIDDEN", message: `Se requiere uno de estos roles: ${options.roles.join(", ")}` },
          { status: 403 }
        );
      }

      // Ejecutar el handler con el payload verificado
      return await handler(req, context, payload);
    } catch (err) {
      return internalError(err);
    }
  };
}

/**
 * Wrapper simplificado para endpoints que solo requieren autenticación.
 */
export function withAuthSimple(handler: (req: NextRequest, payload: AuthTokenPayload) => Promise<NextResponse>) {
  return withAuth<RouteContext>(async (req, _ctx, payload) => handler(req, payload));
}
