import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyAuthToken, verifyAdminRole, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const UpdateServicioSchema = z.object({
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  duracion_minutos: z.number().min(5).optional(),
  precio: z.number().min(0).optional(),
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
    const parsed = UpdateServicioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const updateData: Record<string, unknown> = {};
    if (parsed.data.nombre !== undefined) updateData.nombre = parsed.data.nombre;
    if (parsed.data.descripcion !== undefined) updateData.descripcion = parsed.data.descripcion;
    if (parsed.data.duracion_minutos !== undefined) updateData.duracion_minutos = parsed.data.duracion_minutos;
    if (parsed.data.precio !== undefined) updateData.precio = parsed.data.precio;
    if (parsed.data.activo !== undefined) updateData.activo = parsed.data.activo;

    const { error } = await supabase
      .from("servicios")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Servicio actualizado" });
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

    const { error } = await supabase
      .from("servicios")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Servicio eliminado" });
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
