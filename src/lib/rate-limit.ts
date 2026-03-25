import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
let redisAvailable: boolean | null = null;

// In-memory fallback para cuando Redis no está disponible
const memoryStore = new Map<string, { count: number; expiresAt: number }>();

// Limpiar entradas expiradas cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (value.expiresAt < now) {
      memoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

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
 * Rate limiting con fallback a memoria cuando Redis no está disponible.
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

  // Si Redis está disponible, usar Redis
  if (db) {
    try {
      const key = `ratelimit:${identifier}`;
      const current = await db.incr(key);

      if (current === 1) {
        await db.expire(key, window);
      }

      const ttl = await db.ttl(key);
      const reset = Date.now() + (ttl > 0 ? ttl * 1000 : window * 1000);

      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        reset,
        limit,
      };
    } catch {
      // Si Redis falla, usar fallback en memoria
      redisAvailable = false;
    }
  }

  // Fallback: usar memoria local
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.expiresAt < now) {
    // Primera request o entrada expirada
    memoryStore.set(key, {
      count: 1,
      expiresAt: now + window * 1000,
    });

    return {
      allowed: true,
      remaining: limit - 1,
      reset: now + window * 1000,
      limit,
    };
  }

  // Incrementar contador
  entry.count++;
  memoryStore.set(key, entry);

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    reset: entry.expiresAt,
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
