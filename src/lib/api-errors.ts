import { NextResponse } from "next/server";

/**
 * Retorna un error interno sin exponer detalles en producción.
 * En desarrollo muestra el error completo, en producción solo un mensaje genérico.
 */
export function internalError(err: unknown): NextResponse {
  const isDev = process.env.NODE_ENV !== "production";

  return NextResponse.json(
    {
      error: "INTERNAL_ERROR",
      ...(isDev && {
        details: err instanceof Error ? err.message : String(err),
      }),
    },
    { status: 500 }
  );
}

/**
 * Retorna un error de base de datos sin exponer detalles en producción.
 */
export function dbError(message: string): NextResponse {
  const isDev = process.env.NODE_ENV !== "production";

  return NextResponse.json(
    {
      error: "DB_ERROR",
      ...(isDev && { details: message }),
    },
    { status: 500 }
  );
}
