import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthToken, verifyAdminRole, getTokenFromRequest } from "@/lib/auth/jwt";
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

    if (!verifyAdminRole(payload)) {
      return NextResponse.json({ error: "FORBIDDEN", message: "Se requiere rol de administrador" }, { status: 403 });
    }

    const supabase = createSupabaseAdminClient();
    const today = new Date().toISOString().split("T")[0];

    // Obtener estadísticas en paralelo
    const [
      { count: totalCitas },
      { count: citasHoy },
      { count: citasActivas },
      { count: citasCanceladas },
      { count: totalBarberos },
      { count: totalServicios },
      { count: totalUsuarios },
    ] = await Promise.all([
      supabase.from("citas").select("*", { count: "exact", head: true }),
      supabase.from("citas").select("*", { count: "exact", head: true }).eq("fecha", today),
      supabase.from("citas").select("*", { count: "exact", head: true }).eq("estado", "activa"),
      supabase.from("citas").select("*", { count: "exact", head: true }).eq("estado", "cancelada"),
      supabase.from("barberos").select("*", { count: "exact", head: true }).eq("activo", true),
      supabase.from("servicios").select("*", { count: "exact", head: true }).eq("activo", true),
      supabase.from("app_users").select("*", { count: "exact", head: true }),
    ]);

    // Calcular ingresos (basado en citas activas)
    const { data: citasActivasData } = await supabase
      .from("citas")
      .select("servicio_id, fecha")
      .eq("estado", "activa");

    const { data: servicios } = await supabase
      .from("servicios")
      .select("id, precio");

    const preciosMap = new Map(servicios?.map(s => [s.id, Number(s.precio)]) || []);

    let ingresosTotales = 0;
    let ingresosHoy = 0;

    citasActivasData?.forEach(cita => {
      const precio = preciosMap.get(cita.servicio_id) || 0;
      ingresosTotales += precio;
      if (cita.fecha === today) {
        ingresosHoy += precio;
      }
    });

    return NextResponse.json({
      totalCitas: totalCitas || 0,
      citasHoy: citasHoy || 0,
      citasActivas: citasActivas || 0,
      citasCanceladas: citasCanceladas || 0,
      totalBarberos: totalBarberos || 0,
      totalServicios: totalServicios || 0,
      totalUsuarios: totalUsuarios || 0,
      ingresosTotales,
      ingresosHoy,
    });
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
