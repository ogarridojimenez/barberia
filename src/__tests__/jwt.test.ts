import { describe, it, expect } from "vitest";
import { signAuthToken, verifyAuthToken } from "@/lib/auth/jwt";

describe("JWT Utils", () => {
  const payload = {
    sub: "user-123",
    email: "test@example.com",
    role: "cliente",
  };

  it("firma un token válido", async () => {
    const token = await signAuthToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("verifica un token válido y retorna el payload", async () => {
    const token = await signAuthToken(payload);
    const decoded = await verifyAuthToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.sub).toBe(payload.sub);
    expect(decoded!.email).toBe(payload.email);
    expect(decoded!.role).toBe(payload.role);
  });

  it("retorna null para un token inválido", async () => {
    const result = await verifyAuthToken("token.invalid.falso");
    expect(result).toBeNull();
  });

  it("retorna null para un token vacío", async () => {
    const result = await verifyAuthToken("");
    expect(result).toBeNull();
  });

  it("retorna null para un token de otro secreto", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(payload, "otro-secreto-diferente", { expiresIn: "7d" });
    const result = await verifyAuthToken(token);
    expect(result).toBeNull();
  });

  it("incluye role en el payload cuando se proporciona", async () => {
    const adminPayload = { ...payload, role: "admin" };
    const token = await signAuthToken(adminPayload);
    const decoded = await verifyAuthToken(token);
    expect(decoded!.role).toBe("admin");
  });

  it("el token tiene expiración de 7 días", async () => {
    const token = await signAuthToken(payload);
    const jwt = require("jsonwebtoken");
    const decoded = jwt.decode(token) as Record<string, unknown>;
    expect(decoded).not.toBeNull();
    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
    const expMs = (decoded.exp as number) * 1000;
    const iatMs = (decoded.iat as number) * 1000;
    const diffDays = (expMs - iatMs) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeCloseTo(7, 0);
  });
});
