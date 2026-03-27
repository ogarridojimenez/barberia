import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { verifyAuthToken, verifyAdminRole, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { internalError } from "@/lib/api-errors";

const CreateBarberoSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  especialidad: z.string().optional(),
  telefono: z.string().optional(),
  foto_url: z.string().url().optional().or(z.literal("")),
});

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

    // Obtener barberos desde app_users (donde user_role = 'barbero')
    // La tabla 'barberos' es histórica, los datos principales están en app_users
    const { count } = await supabase
      .from("app_users")
      .select("*", { count: "exact", head: true })
      .eq("user_role", "barbero");

    // Obtener datos paginados - mapear campos para compatibilidad con el frontend
    // Ordenar por created_at para evitar problemas con valores null en nombre
    const { data: barberosData, error } = await supabase
      .from("app_users")
      .select("id, nombre, email, telefono, foto_url, especialidad, user_role, created_at")
      .eq("user_role", "barbero")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Mapear campos para compatibilidad con el frontend
    const barberos = (barberosData || []).map((b) => ({
      id: b.id,
      nombre: b.nombre,
      especialidad: b.especialidad,
      telefono: b.telefono,
      foto_url: b.foto_url,
      email: b.email,
      activo: true,
    }));

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", details: error.message },
        { status: 500 }
      );
    }

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      barberos: barberos || [],
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

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const parsed = CreateBarberoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    // Crear el barbero en app_users con rol 'barbero'
    const { data: barbero, error } = await supabase
      .from("app_users")
      .insert({
        nombre: parsed.data.nombre,
        email: parsed.data.email,
        password_hash: passwordHash,
        user_role: "barbero",
        especialidad: parsed.data.especialidad || null,
        telefono: parsed.data.telefono || null,
        foto_url: parsed.data.foto_url || null,
      })
      .select("id, nombre, email, telefono, foto_url, especialidad, user_role")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "EMAIL_ALREADY_EXISTS", message: "El email ya está registrado" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "DB_ERROR", details: error.message },
        { status: 500 }
      );
    }

    // Mapear para compatibilidad con frontend
    const responseBarbero = {
      ...barbero,
      activo: true,
    };

    return NextResponse.json({ barbero: responseBarbero }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
