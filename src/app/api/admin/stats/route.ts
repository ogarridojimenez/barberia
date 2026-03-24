import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { withAuth } from "@/lib/auth/middleware";

export const GET = withAuth(async (req: NextRequest) => {
  const supabase = createSupabaseAdminClient();
  const today = new Date().toISOString().split("T")[0];

    // Obtener estadísticas en paralelo
    const [
      { count: totalCitas },
      { count: citasHoy },
      { count: citasActivas },
      { count: citasCanceladas },
      { count: citasCompletadas },
      { count: totalBarberos },
      { count: totalServicios },
      { count: totalUsuarios },
    ] = await Promise.all([
      supabase.from("citas").select("*", { count: "exact", head: true }),
      supabase.from("citas").select("*", { count: "exact", head: true }).eq("fecha", today),
      supabase.from("citas").select("*", { count: "exact", head: true }).eq("estado", "activa"),
      supabase.from("citas").select("*", { count: "exact", head: true }).eq("estado", "cancelada"),
      supabase.from("citas").select("*", { count: "exact", head: true }).eq("estado", "completada"),
      supabase.from("barberos").select("*", { count: "exact", head: true }).eq("activo", true),
      supabase.from("servicios").select("*", { count: "exact", head: true }).eq("activo", true),
      supabase.from("app_users").select("*", { count: "exact", head: true }),
    ]);

    // Calcular ingresos (basado en citas COMPLETADAS solamente)
    // NOTA: Para producción, considerar usar una función SQL agregada en Supabase
    // en lugar de cargar datos en memoria
    const { data: citasCompletadasData } = await supabase
      .from("citas")
      .select("servicio_id, fecha")
      .eq("estado", "completada")
      .limit(1000); // Límite para prevenir OOM

    const { data: servicios } = await supabase
      .from("servicios")
      .select("id, precio");

    const preciosMap = new Map(servicios?.map(s => [s.id, Number(s.precio)]) || []);

    let ingresosTotales = 0;
    let ingresosHoy = 0;

    citasCompletadasData?.forEach(cita => {
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
      citasCompletadas: citasCompletadas || 0,
      totalBarberos: totalBarberos || 0,
      totalServicios: totalServicios || 0,
      totalUsuarios: totalUsuarios || 0,
      ingresosTotales,
      ingresosHoy,
    });
  },
  { requireAdmin: true }
);
