import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { signAuthToken } from "@/lib/auth/jwt";
import { checkRateLimit, getIpFromRequest } from "@/lib/rate-limit";
import { internalError } from "@/lib/api-errors";

const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, unknown>;

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    }

    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Rate limiting por IP
    const ip = getIpFromRequest(req);
    const { allowed, remaining, reset } = await checkRateLimit(ip, 5, 60);

    if (!allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          message: `Demasiados intentos. Intenta en ${Math.ceil((reset - Date.now()) / 1000)} segundos`,
          remaining,
        },
        { status: 429 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data: user, error } = await supabase
      .from("app_users")
      .select("id, email, password_hash, user_role")
      .ilike("email", email)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", details: error.message },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return NextResponse.json(
        { error: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    // Validación estricta de rol - rechazar si no tiene rol explícito
    const role = user.user_role;
    if (!role) {
      return NextResponse.json(
        { error: "INVALID_ROLE", message: "Usuario sin rol asignado" },
        { status: 403 }
      );
    }

    const token = await signAuthToken({
      sub: user.id,
      email: user.email,
      role,
    });

    let redirectUrl = "/dashboard";
    if (role === "admin") {
      redirectUrl = "/admin";
    } else if (role === "barbero") {
      redirectUrl = "/barbero";
    }

    // Retornar JSON con cookie y redirect URL (el frontend navega manualmente)
    const response = NextResponse.json({ success: true, redirectUrl });
    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && !process.env.ALLOW_HTTP,
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 día (antes 7 días)
      path: "/",
    });

    return response;
  } catch (err) {
    return internalError(err);
  }
}
