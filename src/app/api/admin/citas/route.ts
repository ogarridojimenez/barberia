import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthToken, verifyAdminRole, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

    if (!verifyAdminRole(payload)) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "Se requiere rol de administrador" },
        { status: 403 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get("fecha");
    const estado = searchParams.get("estado");
    const barbero_id = searchParams.get("barbero_id");

    let query = supabase
      .from("citas")
      .select(`
        id,
        fecha,
        hora_inicio,
        hora_fin,
        estado,
        notas,
        created_at,
        usuario:usuario_id (email),
        barbero:barbero_id (id, nombre),
        servicio:servicio_id (nombre, precio)
      `)
      .order("fecha", { ascending: false })
      .order("hora_inicio");

    if (fecha) {
      query = query.eq("fecha", fecha);
    }

    if (estado) {
      query = query.eq("estado", estado);
    }

    if (barbero_id) {
      query = query.eq("barbero_id", barbero_id);
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
