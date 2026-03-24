import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyAuthToken, verifyAdminRole, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const CreateServicioSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  duracion_minutos: z.number().min(5),
  precio: z.number().min(0),
});

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

    const { data: servicios, error } = await supabase
      .from("servicios")
      .select("*")
      .order("nombre");

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ servicios: servicios || [] });
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
    const parsed = CreateServicioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data: servicio, error } = await supabase
      .from("servicios")
      .insert({
        nombre: parsed.data.nombre,
        descripcion: parsed.data.descripcion || null,
        duracion_minutos: parsed.data.duracion_minutos,
        precio: parsed.data.precio,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ servicio }, { status: 201 });
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
