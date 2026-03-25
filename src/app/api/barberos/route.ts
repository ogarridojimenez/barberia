import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { internalError } from "@/lib/api-errors";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    const { data: barberos, error } = await supabase
      .from("barberos")
      .select("id, nombre, especialidad, foto_url, telefono, horario_atencion")
      .eq("activo", true)
      .order("nombre");

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", message: "Error al obtener barberos" },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ barberos: barberos || [] });

    // Cache por 5 minutos (barberos cambian poco)
    response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");

    return response;
  } catch (err) {
    return internalError(err);
  }
}
