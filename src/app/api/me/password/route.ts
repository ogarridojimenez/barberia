import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { verifyAuthToken, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña es demasiado larga"),
});

export async function PUT(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json(
        { error: "MISSING_TOKEN" },
        { status: 401 }
      );
    }

    const payload = await verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "INVALID_TOKEN" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = ChangePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;
    const supabase = createSupabaseAdminClient();

    // Obtener usuario actual
    const { data: user, error: userError } = await supabase
      .from("app_users")
      .select("id, password_hash")
      .eq("id", payload.sub)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Verificar contraseña actual
    const passwordMatches = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordMatches) {
      return NextResponse.json(
        { error: "INVALID_CURRENT_PASSWORD" },
        { status: 400 }
      );
    }

    // Hash nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    const { error: updateError } = await supabase
      .from("app_users")
      .update({ password_hash: newPasswordHash })
      .eq("id", payload.sub);

    if (updateError) {
      return NextResponse.json(
        { error: "DB_ERROR", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
