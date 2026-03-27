import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function addSecurityHeaders(response: NextResponse): void {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  );
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
}

export function securityMiddleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  addSecurityHeaders(response);
  return response;
}
