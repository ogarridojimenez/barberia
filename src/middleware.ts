import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthToken } from "@/lib/auth/jwt";

const AUTH_ROUTES = ["/login", "/register"];

const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/admin": ["admin"],
  "/barbero": ["barbero"],
  "/dashboard": ["admin", "barbero", "cliente"],
  "/citas": ["admin", "barbero", "cliente"],
  "/perfil": ["admin", "barbero", "cliente"],
};

async function getAuthPayload(request: NextRequest): Promise<{ payload: { role?: string } | null; hasToken: boolean }> {
  const authHeader = request.headers.get("authorization");
  
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = await verifyAuthToken(token);
    if (payload) return { payload, hasToken: true };
  }

  const cookieToken = request.cookies.get("session_token")?.value;
  if (cookieToken) {
    const payload = await verifyAuthToken(cookieToken);
    if (payload) return { payload, hasToken: true };
  }

  return { payload: null, hasToken: false };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { payload, hasToken } = await getAuthPayload(request);

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute && hasToken && payload) {
    const role = payload.role;
    let redirectUrl = "/dashboard";
    if (role === "admin") redirectUrl = "/admin";
    else if (role === "barbero") redirectUrl = "/barbero";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  if (!hasToken && !isAuthRoute) {
    const isProtectedRoute = Object.keys(ROUTE_PERMISSIONS).some(
      (route) => pathname.startsWith(route) || pathname === route
    );
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (hasToken && payload) {
    if (!payload.role) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const role = payload.role as string;
    const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find((route) =>
      pathname.startsWith(route) || pathname === route
    );

    if (matchedRoute && !ROUTE_PERMISSIONS[matchedRoute].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};