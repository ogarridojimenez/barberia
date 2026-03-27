import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyAuthToken, verifyAdminRole, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { internalError } from "@/lib/api-errors";

const UpdateBarberoSchema = z.object({
  nombre: z.string().min(1).optional(),
  especialidad: z.string().optional(),
  telefono: z.string().optional(),
  foto_url: z.string().optional(),
  activo: z.boolean().optional(),
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
    const parsed = UpdateBarberoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // Actualizar en app_users (los barberos están almacenados ahí con user_role = 'barbero')
    const updateData: Record<string, unknown> = {};
    if (parsed.data.nombre !== undefined) updateData.nombre = parsed.data.nombre;
    if (parsed.data.especialidad !== undefined) updateData.especialidad = parsed.data.especialidad || null;
    if (parsed.data.telefono !== undefined) updateData.telefono = parsed.data.telefono || null;
    if (parsed.data.foto_url !== undefined) updateData.foto_url = parsed.data.foto_url || null;

    const { error } = await supabase
      .from("app_users")
      .update(updateData)
      .eq("id", id)
      .eq("user_role", "barbero");

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: "DB_ERROR", message: "Error al actualizar el barbero" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Barbero actualizado" });
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

    // Verificar si el barbero tiene citas asociadas
    const { count: citasCount, error: countError } = await supabase
      .from("citas")
      .select("*", { count: "exact", head: true })
      .eq("barbero_id", id);

    if (countError) {
      console.error("Error checking citas:", countError);
    }

    if (citasCount && citasCount > 0) {
      return NextResponse.json(
        { error: "HAS_CITAS", message: "No se puede eliminar el barbero porque tiene citas asociadas. Desactívalo en su lugar." },
        { status: 400 }
      );
    }

    // Hard delete: eliminar completamente el registro de app_users
    const { error } = await supabase
      .from("app_users")
      .delete()
      .eq("id", id)
      .eq("user_role", "barbero");

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        { error: "DB_ERROR", message: "Error al eliminar el barbero" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Barbero eliminado correctamente" });
  } catch (err) {
    return internalError(err);
  }
}
