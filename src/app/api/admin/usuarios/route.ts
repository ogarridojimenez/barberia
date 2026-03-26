import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthToken, verifyAdminRole, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { internalError } from "@/lib/api-errors";

const DEFAULT_PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: "MISSING_TOKEN" }, { status: 401 });
    }

    const payload = await verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 });
    }

    if (!verifyAdminRole(payload)) {
      return NextResponse.json({ error: "FORBIDDEN", message: "Se requiere rol de administrador" }, { status: 403 });
    }

    const supabase = createSupabaseAdminClient();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE))));
    const offset = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    // Construir query base - incluye todos los campos
    let query = supabase
      .from("app_users")
      .select("id, email, user_role, created_at, nombre, foto_url, telefono, especialidad", { count: "exact" });

    // Aplicar filtro de búsqueda (email o nombre)
    if (search) {
      query = query.or(`email.ilike.%${search}%,nombre.ilike.%${search}%`);
    }

    // Aplicar filtro de rol
    if (role) {
      query = query.eq("user_role", role);
    }

    // Obtener usuarios con filtros aplicados
    const { data: usuarios, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", message: "Error al obtener usuarios" },
        { status: 500 }
      );
    }

    // Para barberos, obtener datos adicionales de la tabla barberos
    const usuariosConDatos = await Promise.all(
      (usuarios || []).map(async (usuario) => {
        if (usuario.user_role === "barbero") {
          const { data: barbero } = await supabase
            .from("barberos")
            .select("nombre, foto_url, telefono, especialidad")
            .eq("user_id", usuario.id)
            .limit(1)
            .single();
          
          if (barbero) {
            return {
              ...usuario,
              nombre: barbero.nombre || usuario.nombre,
              foto_url: barbero.foto_url || usuario.foto_url,
              telefono: barbero.telefono || usuario.telefono,
              especialidad: barbero.especialidad || usuario.especialidad,
            };
          }
        }
        return usuario;
      })
    );

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      usuarios: usuariosConDatos,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return internalError(err);
  }
}
