import { NextResponse } from "next/server";
import { getCachedBarberos } from "@/lib/cache";
import { internalError } from "@/lib/api-errors";

export async function GET() {
  try {
    const barberos = await getCachedBarberos(true);
    
    const response = NextResponse.json({ 
      barberos: barberos.map(b => ({
        id: b.id,
        nombre: b.nombre,
        especialidad: b.especialidad,
        foto_url: b.foto_url,
        telefono: b.telefono,
      }))
    });

    response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");

    return response;
  } catch (err) {
    return internalError(err);
  }
}
