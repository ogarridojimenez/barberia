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
      .select("id, email, nombre, telefono, created_at")
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
        telefono: user.telefono,
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
    const { nombre, telefono } = body;

    // Validaciones básicas
    if (nombre && typeof nombre !== "string") {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "Nombre debe ser texto" },
        { status: 400 }
      );
    }

    if (telefono && typeof telefono !== "string") {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "Teléfono debe ser texto" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data: user, error: updateError } = await supabase
      .from("app_users")
      .update({
        nombre: nombre || null,
        telefono: telefono || null,
      })
      .eq("id", payload.sub)
      .select("id, email, nombre, telefono, created_at")
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
        telefono: user.telefono,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    return internalError(err);
  }
}
