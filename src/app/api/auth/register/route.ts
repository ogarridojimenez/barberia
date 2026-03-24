import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIpFromRequest } from "@/lib/rate-limit";

const RegisterSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña es demasiado larga"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Rate limiting por IP (más estricto para registros: 3 por hora)
    const ip = getIpFromRequest(req);
    const { allowed, remaining, reset } = await checkRateLimit(ip, 3, 3600);

    if (!allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          message: `Demasiados registros. Intenta en ${Math.ceil((reset - Date.now()) / 1000)} segundos`,
          remaining,
        },
        { status: 429 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data: existing } = await supabase
      .from("app_users")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "EMAIL_ALREADY_EXISTS" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from("app_users")
      .insert({ email, password_hash: passwordHash, user_role: "cliente" })
      .select("id, email")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "EMAIL_ALREADY_EXISTS" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "DB_ERROR", details: error.message },
        { status: 500 }
      );
    }

    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, role: "cliente" } },
      { status: 201 }
    );

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
