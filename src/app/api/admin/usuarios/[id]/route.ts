import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyAuthToken, verifyAdminRole, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { internalError } from "@/lib/api-errors";

const UpdateRoleSchema = z.object({
  user_role: z.enum(["cliente", "barbero", "admin"]),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const parsed = UpdateRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "Rol inválido. Debe ser: cliente, barbero o admin" },
        { status: 400 }
      );
    }

    const { user_role } = parsed.data;
    const supabase = createSupabaseAdminClient();

    // Verificar que el usuario existe
    const { data: user, error: userError } = await supabase
      .from("app_users")
      .select("id, user_role")
      .eq("id", id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "USER_NOT_FOUND", message: "Usuario no encontrado" }, { status: 404 });
    }

    // Validación: no cambiar el rol del propio admin
    if (id === payload.sub) {
      return NextResponse.json(
        { error: "CANNOT_CHANGE_OWN_ROLE", message: "No puedes cambiar tu propio rol" },
        { status: 400 }
      );
    }

    // Si se está cambiando de admin a otro rol, verificar que quede al menos un admin
    if (user.user_role === "admin" && user_role !== "admin") {
      const { count: adminCount } = await supabase
        .from("app_users")
        .select("*", { count: "exact", head: true })
        .eq("user_role", "admin");

      if ((adminCount || 0) <= 1) {
        return NextResponse.json(
          { error: "LAST_ADMIN", message: "No puedes cambiar el rol del último administrador" },
          { status: 400 }
        );
      }
    }

    const { error } = await supabase
      .from("app_users")
      .update({ user_role })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", message: "Error al actualizar el rol" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Rol actualizado correctamente" });
  } catch (err) {
    return internalError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const supabase = createSupabaseAdminClient();

    // Verificar que el usuario existe
    const { data: user, error: userError } = await supabase
      .from("app_users")
      .select("id, user_role")
      .eq("id", id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "USER_NOT_FOUND", message: "Usuario no encontrado" }, { status: 404 });
    }

    // No permitir eliminarse a sí mismo
    if (id === payload.sub) {
      return NextResponse.json(
        { error: "CANNOT_DELETE_SELF", message: "No puedes eliminar tu propia cuenta" },
        { status: 400 }
      );
    }

    // Si es admin, verificar que quede al menos un admin
    if (user.user_role === "admin") {
      const { count: adminCount } = await supabase
        .from("app_users")
        .select("*", { count: "exact", head: true })
        .eq("user_role", "admin");

      if ((adminCount || 0) <= 1) {
        return NextResponse.json(
          { error: "LAST_ADMIN", message: "No puedes eliminar al último administrador" },
          { status: 400 }
        );
      }
    }

    // Eliminar usuario
    const { error } = await supabase
      .from("app_users")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", message: "Error al eliminar el usuario" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    return internalError(err);
  }
}
