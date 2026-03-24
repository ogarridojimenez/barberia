import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyAuthToken, verifyAdminRole, getTokenFromRequest } from "@/lib/auth/jwt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const UpdateRoleSchema = z.object({
  user_role: z.enum(["cliente", "barbero", "admin"]),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const parsed = UpdateRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { user_role } = parsed.data;
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from("app_users")
      .update({ user_role })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Rol actualizado correctamente" });
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
