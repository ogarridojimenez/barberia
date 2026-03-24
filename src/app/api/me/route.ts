import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    let token: string | null = null;

    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      token = req.cookies.get("session_token")?.value ?? null;
    }

    if (!token) {
      return NextResponse.json(
        { error: "MISSING_TOKEN", details: "Token de autenticación requerido" },
        { status: 401 }
      );
    }

    // Verificar token
    const payload = await verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "INVALID_TOKEN", details: "Token inválido o expirado" },
        { status: 401 }
      );
    }

    // Obtener datos del usuario desde la base de datos
    const supabase = createSupabaseAdminClient();
    const { data: user, error: userError } = await supabase
      .from("app_users")
      .select("id, email, created_at")
      .eq("id", payload.sub)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "USER_NOT_FOUND", details: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    });
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
