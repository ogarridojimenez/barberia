import { NextResponse } from "next/server";
import { getCachedServicios } from "@/lib/cache";
import { internalError } from "@/lib/api-errors";

export async function GET() {
  try {
    const servicios = await getCachedServicios(true);
    
    const response = NextResponse.json({ 
      servicios: servicios.map(s => ({
        id: s.id,
        nombre: s.nombre,
        descripcion: s.descripcion,
        duracion_minutos: s.duracion_minutos,
        precio: s.precio,
      }))
    });

    response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");

    return response;
  } catch (err) {
    return internalError(err);
  }
}
