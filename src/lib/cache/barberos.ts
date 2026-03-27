import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface Barbero {
  id: string;
  nombre: string;
  especialidad: string;
  telefono: string;
  foto_url: string;
  activo: boolean;
}

async function fetchBarberosFromDB(onlyActive: boolean = true): Promise<Barbero[]> {
  const supabase = createSupabaseAdminClient();
  
  let query = supabase.from("barberos").select("*").order("nombre");
  
  if (onlyActive) {
    query = query.eq("activo", true);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data || [];
}

export const getCachedBarberos = unstable_cache(
  async (onlyActive: boolean = true) => {
    return fetchBarberosFromDB(onlyActive);
  },
  ["barberos"],
  {
    revalidate: 300,
    tags: ["barberos"],
  }
);

export const getCachedAllBarberos = unstable_cache(
  async () => {
    return fetchBarberosFromDB(false);
  },
  ["barberos-all"],
  {
    revalidate: 300,
    tags: ["barberos"],
  }
);
