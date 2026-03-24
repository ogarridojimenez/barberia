import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyAuthToken, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const CreateCitaSchema = z.object({
  barbero_id: z.string().uuid(),
  servicio_id: z.string().uuid(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  hora_fin: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  notas: z.string().optional(),
});

export async function GET(req: NextRequest) {
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
        { error: "DB_ERROR", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ citas: citas || [] });
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

export async function POST(req: NextRequest) {
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
    const parsed = CreateCitaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { barbero_id, servicio_id, fecha, hora_inicio, hora_fin, notas } = parsed.data;
    const supabase = createSupabaseAdminClient();

    // Verificar que no haya una cita activa en ese horario
    const { data: citaExistente, error: citaError } = await supabase
      .from("citas")
      .select("id")
      .eq("barbero_id", barbero_id)
      .eq("fecha", fecha)
      .eq("hora_inicio", hora_inicio)
      .eq("estado", "activa")
      .single();

    if (citaExistente) {
      return NextResponse.json(
        { error: "HORARIO_NO_DISPONIBLE", details: "El horario seleccionado ya está ocupado" },
        { status: 400 }
      );
    }

    // Crear la cita
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
      return NextResponse.json(
        { error: "DB_ERROR", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ cita }, { status: 201 });
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
