import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyAuthToken, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { internalError } from "@/lib/api-errors";

const CreateCitaSchema = z.object({
  barbero_id: z.string().uuid(),
  servicio_id: z.string().uuid(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  hora_fin: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  notas: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: "MISSING_TOKEN" }, { status: 401 });
    }

    const payload = await verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get("fecha");

    let query = supabase
      .from("citas")
      .select(`
        id,
        fecha,
        hora_inicio,
        hora_fin,
        estado,
        notas,
        barbero:barbero_id (nombre),
        servicio:servicio_id (nombre, precio)
      `)
      .eq("usuario_id", payload.sub)
      .order("fecha", { ascending: false })
      .order("hora_inicio");

    if (fecha) {
      query = query.eq("fecha", fecha);
    }

    const { data: citas, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", message: "Error al obtener citas" },
        { status: 500 }
      );
    }

    return NextResponse.json({ citas: citas || [] });
  } catch (err) {
    return internalError(err);
  }
}

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

    const body = await req.json();
    const parsed = CreateCitaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { barbero_id, servicio_id, fecha, hora_inicio, hora_fin, notas } = parsed.data;
    const supabase = createSupabaseAdminClient();

    // Intentar insertar directamente. La constraint unique en DB previene race conditions.
    // Si hay conflicto, Supabase retornará error code 23505 (unique violation).
    const { data: cita, error: insertError } = await supabase
      .from("citas")
      .insert({
        usuario_id: payload.sub,
        barbero_id,
        servicio_id,
        fecha,
        hora_inicio,
        hora_fin,
        notas,
        estado: "activa",
      })
      .select()
      .single();

    if (insertError) {
      // Error 23505 = unique violation (race condition detectado por DB)
      if (insertError.code === "23505") {
        return NextResponse.json(
          {
            error: "HORARIO_NO_DISPONIBLE",
            message: "El horario seleccionado ya fue reservado por otro usuario",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "DB_ERROR", message: "Error al crear la cita" },
        { status: 500 }
      );
    }

    return NextResponse.json({ cita }, { status: 201 });
  } catch (err) {
    return internalError(err);
  }
}
