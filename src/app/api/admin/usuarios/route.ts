import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthToken, verifyAdminRole, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

    const { data: usuarios, error } = await supabase
      .from("app_users")
      .select("id, email, user_role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ usuarios: usuarios || [] });
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
