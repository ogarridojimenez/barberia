import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
let redisAvailable: boolean | null = null;

function getRedis(): Redis | null {
  if (redisAvailable === false) return null;

  if (!redis) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      redisAvailable = false;
      return null;
    }

    try {
      redis = new Redis({ url, token });
      redisAvailable = true;
    } catch {
      redisAvailable = false;
      return null;
    }
  }

  return redis;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

/**
 * Verifica si un identificador (IP, email, etc.) excedió el rate limit
 *
 * @param identifier - Identificador único (ej: IP, email)
 * @param limit - Máximo de requests permitidas
 * @param window - Ventana de tiempo en segundos
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 5,
  window: number = 60
): Promise<RateLimitResult> {
  const db = getRedis();
  
  if (!db) {
    return {
      allowed: true,
      remaining: limit - 1,
      reset: Date.now() + window * 1000,
      limit,
    };
  }

  const key = `ratelimit:${identifier}`;

  // Incrementa el contador y obtiene el valor actual
  const current = await db.incr(key);

  // Si es el primer request, setear el expiry
  if (current === 1) {
    await db.expire(key, window);
  }

  // Calcular tiempo restante hasta reset
  const ttl = await db.ttl(key);
  const reset = Date.now() + (ttl > 0 ? ttl * 1000 : window * 1000);

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
    reset,
    limit,
  };
}

/**
 * Extrae la IP del request, manejando proxies y load balancers
 */
export function getIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0] ?? "unknown";
  return ip.trim();
}
