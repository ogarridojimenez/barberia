import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { withAuth } from "@/lib/auth/middleware";
import { internalError } from "@/lib/api-errors";

export const GET = withAuth(
  async (req: NextRequest) => {
    try {
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
        revenueResult,
      ] = await Promise.all([
        supabase.from("citas").select("*", { count: "exact", head: true }),
        supabase.from("citas").select("*", { count: "exact", head: true }).eq("fecha", today),
        supabase.from("citas").select("*", { count: "exact", head: true }).eq("estado", "activa"),
        supabase.from("citas").select("*", { count: "exact", head: true }).eq("estado", "cancelada"),
        supabase.from("citas").select("*", { count: "exact", head: true }).eq("estado", "completada"),
        supabase.from("barberos").select("*", { count: "exact", head: true }).eq("activo", true),
        supabase.from("servicios").select("*", { count: "exact", head: true }).eq("activo", true),
        supabase.from("app_users").select("*", { count: "exact", head: true }),
        // Usar función SQL para calcular revenue (evita OOM)
        supabase.rpc("get_revenue_stats"),
      ]);

      // Extraer revenue de la función SQL
      const revenueData = revenueResult.data?.[0] || { total_revenue: 0, today_revenue: 0 };
      const ingresosTotales = Number(revenueData.total_revenue) || 0;
      const ingresosHoy = Number(revenueData.today_revenue) || 0;

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
    } catch (err) {
      return internalError(err);
    }
  },
  { requireAdmin: true }
);
