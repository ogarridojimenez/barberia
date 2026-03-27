import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  const checks: Record<string, { status: string; time?: number; error?: string }> = {};

  try {
    const supabase = createSupabaseAdminClient();
    
    const dbStart = Date.now();
    const { error: dbError } = await supabase.from("app_users").select("id").limit(1);
    checks.database = {
      status: dbError ? "error" : "ok",
      time: Date.now() - dbStart,
      error: dbError?.message,
    };
  } catch (err) {
    checks.database = {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }

  checks.uptime = {
    status: "ok",
  };

  const totalTime = Date.now() - start;
  checks.responseTime = {
    status: "ok",
    time: totalTime,
  };

  const allHealthy = Object.values(checks).every((c) => c.status === "ok");

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    {
      status: allHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
