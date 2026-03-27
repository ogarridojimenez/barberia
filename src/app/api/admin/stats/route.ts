import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { internalError } from "@/lib/api-errors";
import { getCachedAdminStats } from "@/lib/cache";

export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      const stats = await getCachedAdminStats();
      return NextResponse.json(stats);
    } catch (err) {
      return internalError(err);
    }
  },
  { requireAdmin: true }
);
