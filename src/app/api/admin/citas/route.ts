import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthToken, verifyAdminRole, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { internalError } from "@/lib/api-errors";

const DEFAULT_PAGE_SIZE = 20;

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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE))));
    const offset = (page - 1) * limit;

    // Obtener total de registros
    let countQuery = supabase
      .from("citas")
      .select("*", { count: "exact", head: true });

    if (fecha) countQuery = countQuery.eq("fecha", fecha);
    if (estado) countQuery = countQuery.eq("estado", estado);
    if (barbero_id) countQuery = countQuery.eq("barbero_id", barbero_id);

    const { count } = await countQuery;

    // Obtener datos paginados
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
      .order("hora_inicio")
      .range(offset, offset + limit - 1);

    if (fecha) query = query.eq("fecha", fecha);
    if (estado) query = query.eq("estado", estado);
    if (barbero_id) query = query.eq("barbero_id", barbero_id);

    const { data: citas, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", details: error.message },
        { status: 500 }
      );
    }

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      citas: citas || [],
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return internalError(err);
  }
}
