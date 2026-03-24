"use client";

/**
 * Helpers de autenticación para el cliente.
 *
 * Las cookies JWT son httpOnly — JavaScript NO puede leerlas.
 * El browser las envía automáticamente en cada request gracias a `credentials: 'include'`.
 * La validación real se hace en el servidor via middleware.
 */

/**
 * Verifica si existe la cookie de sesión en el browser.
 * La cookie es httpOnly así que document.cookie NO puede leerla.
 * Este método existe por compatibilidad pero no es fiable para seguridad.
 * La validación real se hace en el servidor via middleware.
 */
export function isAuthenticated(): boolean {
  if (typeof document !== "undefined") {
    return document.cookie.includes("session_token");
  }
  return false;
}

/**
 * Las cookies JWT son httpOnly — document.cookie no puede leerlas.
 * Retornamos null. Las páginas deben usar fetchApi() en lugar de
 * intentar leer el token manualmente.
 */
export function getToken(): string | null {
  return null;
}

/**
 * Alias de getToken() por compatibilidad.
 */
export function getAuthCookie(): string | null {
  return null;
}

/**
 * Intenta limpiar la cookie del lado del cliente.
 * NOTA: Con cookies httpOnly esto NO funciona — la cookie persiste.
 * Para logout real, usar la Server Action `logoutAction`.
 */
export function clearAuthCookie(): void {
  if (typeof document !== "undefined") {
    document.cookie = "session_token=; max-age=0; path=/";
  }
}

/**
 * Helper de fetch autenticado. El browser envía la cookie httpOnly
 * automáticamente gracias a `credentials: 'include'`.
 * No es necesario agregar headers de Authorization manualmente.
 */
export async function fetchApi(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

/**
 * GET autenticado. Retorna el JSON parseado.
 */
export async function apiGet<T = unknown>(url: string): Promise<T> {
  const res = await fetchApi(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.details || `Error ${res.status}`);
  }
  return res.json();
}

/**
 * POST autenticado. Retorna el JSON parseado.
 */
export async function apiPost<T = unknown>(
  url: string,
  body?: unknown
): Promise<T> {
  const res = await fetchApi(url, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.details || `Error ${res.status}`);
  }
  return res.json();
}

/**
 * PUT autenticado. Retorna el JSON parseado.
 */
export async function apiPut<T = unknown>(
  url: string,
  body?: unknown
): Promise<T> {
  const res = await fetchApi(url, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.details || `Error ${res.status}`);
  }
  return res.json();
}

/**
 * DELETE autenticado. Retorna el JSON parseado.
 */
export async function apiDelete<T = unknown>(url: string): Promise<T> {
  const res = await fetchApi(url, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.details || `Error ${res.status}`);
  }
  return res.json();
}
