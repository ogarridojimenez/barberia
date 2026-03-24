import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyAuthToken, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const UpdateCitaSchema = z.object({
  estado: z.enum(["activa", "cancelada"]),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const parsed = UpdateCitaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { estado } = parsed.data;
    const supabase = createSupabaseAdminClient();

    // Verificar que la cita pertenezca al usuario (o sea admin)
    const { data: cita, error: citaError } = await supabase
      .from("citas")
      .select("id, usuario_id, estado")
      .eq("id", id)
      .single();

    if (citaError || !cita) {
      return NextResponse.json(
        { error: "CITA_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Verificar permisos (solo el dueño o admin)
    if (cita.usuario_id !== payload.sub && payload.role !== "admin") {
      return NextResponse.json(
        { error: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // Actualizar la cita
    const { data: updatedCita, error: updateError } = await supabase
      .from("citas")
      .update({ estado })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "DB_ERROR", details: updateError.message },
        { status: 500 }
      );
    }

    // Si se cancela, liberar el horario
    if (estado === "cancelada") {
      await supabase
        .from("horarios_disponibles")
        .update({ disponible: true, cita_id: null })
        .eq("cita_id", id);
    }

    return NextResponse.json({ cita: updatedCita });
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
