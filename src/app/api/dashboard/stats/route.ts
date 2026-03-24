import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { withAuth } from "@/lib/auth/middleware";

export const GET = withAuth(async (req: NextRequest, _ctx, payload) => {
  const supabase = createSupabaseAdminClient();
  const today = new Date().toISOString().split("T")[0];

  // Obtener stats del usuario actual en paralelo
  const [
    { count: citasProximas },
    { count: citasCompletadas },
    { count: totalCitas },
  ] = await Promise.all([
    // Citas activas con fecha >= hoy (próximas)
    supabase
      .from("citas")
      .select("*", { count: "exact", head: true })
      .eq("usuario_id", payload.sub)
      .eq("estado", "activa")
      .gte("fecha", today),

    // Citas completadas
    supabase
      .from("citas")
      .select("*", { count: "exact", head: true })
      .eq("usuario_id", payload.sub)
      .eq("estado", "completada"),

    // Total de citas del usuario
    supabase
      .from("citas")
      .select("*", { count: "exact", head: true })
      .eq("usuario_id", payload.sub),
  ]);

  return NextResponse.json({
    citasProximas: citasProximas || 0,
    citasCompletadas: citasCompletadas || 0,
    totalCitas: totalCitas || 0,
  });
});
