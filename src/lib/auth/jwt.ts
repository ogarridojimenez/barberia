import "server-only";

import { SignJWT, jwtVerify } from "jose";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role?: string;
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Falta variable de entorno requerida: JWT_SECRET");
  }
  return new TextEncoder().encode(secret);
}

export async function signAuthToken(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function verifyAdminRole(payload: AuthTokenPayload): boolean {
  return payload.role === "admin";
}

export function verifyBarberoRole(payload: AuthTokenPayload): boolean {
  return payload.role === "barbero";
}

export function getTokenFromRequest(req: Request): string | null {
  // Primero intentar obtener del header Authorization
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Si no, intentar obtener de la cookie
  const cookies = req.headers.get("cookie");
  if (cookies) {
    const match = cookies.match(/session_token=([^;]+)/);
    if (match) {
      return match[1];
    }
  }

  return null;
}
