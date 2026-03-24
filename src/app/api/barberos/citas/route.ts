import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthToken, verifyBarberoRole, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

    if (!verifyBarberoRole(payload)) {
      return NextResponse.json({ error: "FORBIDDEN", message: "Se requiere rol de barbero" }, { status: 403 });
    }

    const supabase = createSupabaseAdminClient();

    const { data: barbero } = await supabase
      .from("barberos")
      .select("id")
      .eq("email", payload.email)
      .single();

    if (!barbero) {
      return NextResponse.json({ error: "BARBERO_NOT_FOUND" }, { status: 404 });
    }

    const { data: citas, error } = await supabase
      .from("citas")
      .select(`
        id,
        fecha,
        hora_inicio,
        hora_fin,
        estado,
        notas,
        usuario:usuarios!citas_usuario_id_fkey(email),
        servicio:servicios!citas_servicio_id_fkey(nombre, precio)
      `)
      .eq("barbero_id", barbero.id)
      .in("estado", ["activa"])
      .order("fecha", { ascending: true })
      .order("hora_inicio", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "DB_ERROR", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ citas: citas || [] });
  } catch (err) {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
