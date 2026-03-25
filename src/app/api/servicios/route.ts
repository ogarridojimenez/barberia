import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { internalError } from "@/lib/api-errors";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    const { data: servicios, error } = await supabase
      .from("servicios")
      .select("id, nombre, descripcion, duracion_minutos, precio")
      .eq("activo", true)
      .order("nombre");

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", message: "Error al obtener servicios" },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ servicios: servicios || [] });

    // Cache por 5 minutos (servicios cambian poco)
    response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");

    return response;
  } catch (err) {
    return internalError(err);
  }
}
