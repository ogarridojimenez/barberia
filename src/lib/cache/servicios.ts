import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  duracion_minutos: number;
  precio: number;
  activo: boolean;
}

async function fetchServiciosFromDB(onlyActive: boolean = true): Promise<Servicio[]> {
  const supabase = createSupabaseAdminClient();
  
  let query = supabase.from("servicios").select("*").order("nombre");
  
  if (onlyActive) {
    query = query.eq("activo", true);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data || [];
}

export const getCachedServicios = unstable_cache(
  async (onlyActive: boolean = true) => {
    return fetchServiciosFromDB(onlyActive);
  },
  ["servicios"],
  {
    revalidate: 300,
    tags: ["servicios"],
  }
);

export const getCachedAllServicios = unstable_cache(
  async () => {
    return fetchServiciosFromDB(false);
  },
  ["servicios-all"],
  {
    revalidate: 300,
    tags: ["servicios"],
  }
);
