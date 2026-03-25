import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIpFromRequest } from "@/lib/rate-limit";
import { internalError } from "@/lib/api-errors";

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);

const RegisterSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña es demasiado larga"),
  nombre: z.string().min(1, "El nombre es requerido").max(100).optional(),
  apellidos: z.string().min(1, "Los apellidos son requeridos").max(100).optional(),
  foto_url: z.string().url("URL de foto inválida").optional().or(z.literal("")),
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

    const { email, password, nombre, apellidos, foto_url } = parsed.data;

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

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const { data: user, error } = await supabase
      .from("app_users")
      .insert({
        email,
        password_hash: passwordHash,
        user_role: "cliente",
        nombre: nombre || null,
        apellidos: apellidos || null,
        foto_url: foto_url || null,
      })
      .select("id, email, nombre, apellidos, foto_url")
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
      {
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellidos: user.apellidos,
          foto_url: user.foto_url,
          role: "cliente",
        },
      },
      { status: 201 }
    );

    return response;
  } catch (err) {
    return internalError(err);
  }
}
