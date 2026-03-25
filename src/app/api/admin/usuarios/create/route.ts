import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { verifyAuthToken, verifyAdminRole, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { internalError } from "@/lib/api-errors";

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);

const CreateUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña es demasiado larga"),
  nombre: z.string().min(1, "El nombre es requerido").max(100).optional(),
  apellidos: z.string().max(100).optional(),
  telefono: z.string().max(20).optional(),
  user_role: z.enum(["cliente", "barbero", "admin"]),
});

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: "MISSING_TOKEN" }, { status: 401 });
    }

    const payload = await verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 });
    }

    if (!verifyAdminRole(payload)) {
      return NextResponse.json({ error: "FORBIDDEN", message: "Se requiere rol de administrador" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, nombre, apellidos, telefono, user_role } = parsed.data;
    const supabase = createSupabaseAdminClient();

    // Verificar que el email no exista
    const { data: existing } = await supabase
      .from("app_users")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "EMAIL_ALREADY_EXISTS", message: "Este email ya está registrado" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const { data: user, error } = await supabase
      .from("app_users")
      .insert({
        email,
        password_hash: passwordHash,
        user_role,
        nombre: nombre || null,
        apellidos: apellidos || null,
        telefono: telefono || null,
      })
      .select("id, email, nombre, apellidos, user_role")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "EMAIL_ALREADY_EXISTS", message: "Este email ya está registrado" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "DB_ERROR", message: "Error al crear el usuario" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    return internalError(err);
  }
}
