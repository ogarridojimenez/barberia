import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface AdminStats {
  totalCitas: number;
  citasHoy: number;
  citasPendientes: number;
  citasCompletadas: number;
  totalBarberos: number;
  totalServicios: number;
  totalUsuarios: number;
  ingresosTotales: number;
  ingresosHoy: number;
}

async function fetchStatsFromDB(): Promise<AdminStats> {
  const supabase = createSupabaseAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const [
    { count: totalCitas },
    { count: citasHoy },
    { count: citasActivas },
    { count: citasCompletadas },
    { count: totalBarberos },
    { count: totalServicios },
    { count: totalUsuarios },
    revenueResult,
  ] = await Promise.all([
    supabase.from("citas").select("*", { count: "exact", head: true }),
    supabase.from("citas").select("*", { count: "exact", head: true }).eq("fecha", today),
    supabase.from("citas").select("*", { count: "exact", head: true }).eq("estado", "activa"),
    supabase.from("citas").select("*", { count: "exact", head: true }).eq("estado", "completada"),
    supabase.from("barberos").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase.from("servicios").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase.from("app_users").select("*", { count: "exact", head: true }),
    supabase.rpc("get_revenue_stats"),
  ]);

  const revenueData = revenueResult.data?.[0] || { total_revenue: 0, today_revenue: 0 };
  const ingresosTotales = Number(revenueData.total_revenue) || 0;
  const ingresosHoy = Number(revenueData.today_revenue) || 0;

  return {
    totalCitas: totalCitas || 0,
    citasHoy: citasHoy || 0,
    citasPendientes: citasActivas || 0,
    citasCompletadas: citasCompletadas || 0,
    totalBarberos: totalBarberos || 0,
    totalServicios: totalServicios || 0,
    totalUsuarios: totalUsuarios || 0,
    ingresosTotales,
    ingresosHoy,
  };
}

export const getCachedAdminStats = unstable_cache(
  async () => {
    return fetchStatsFromDB();
  },
  ["admin-stats"],
  {
    revalidate: 60,
    tags: ["admin-stats"],
  }
);
