import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthToken, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { internalError } from "@/lib/api-errors";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json(
        { error: "MISSING_TOKEN" },
        { status: 401 }
      );
    }

    const payload = await verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "INVALID_TOKEN" },
        { status: 401 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data: user, error: userError } = await supabase
      .from("app_users")
      .select("id, email, nombre, apellidos, telefono, foto_url, created_at")
      .eq("id", payload.sub)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos,
        telefono: user.telefono,
        foto_url: user.foto_url,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    return internalError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json(
        { error: "MISSING_TOKEN" },
        { status: 401 }
      );
    }

    const payload = await verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "INVALID_TOKEN" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { nombre, apellidos, telefono, foto_url } = body;

    // Validaciones básicas
    if (nombre && typeof nombre !== "string") {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "Nombre debe ser texto" },
        { status: 400 }
      );
    }

    if (apellidos && typeof apellidos !== "string") {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "Apellidos debe ser texto" },
        { status: 400 }
      );
    }

    if (telefono && typeof telefono !== "string") {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "Teléfono debe ser texto" },
        { status: 400 }
      );
    }

    if (foto_url && typeof foto_url !== "string") {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "URL de foto inválida" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data: user, error: updateError } = await supabase
      .from("app_users")
      .update({
        nombre: nombre || null,
        apellidos: apellidos || null,
        telefono: telefono || null,
        foto_url: foto_url || null,
      })
      .eq("id", payload.sub)
      .select("id, email, nombre, apellidos, telefono, foto_url, created_at")
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "DB_ERROR", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos,
        telefono: user.telefono,
        foto_url: user.foto_url,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    return internalError(err);
  }
}
