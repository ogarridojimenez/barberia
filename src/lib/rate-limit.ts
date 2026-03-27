import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
let redisAvailable: boolean | null = null;

const memoryStore = new Map<string, { count: number; expiresAt: number }>();

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

export type RateLimitScope = "login" | "register" | "api" | "admin";

const rateLimitConfig: Record<RateLimitScope, { limit: number; window: number }> = {
  login: { limit: 5, window: 60 },
  register: { limit: 3, window: 300 },
  api: { limit: 100, window: 60 },
  admin: { limit: 30, window: 60 },
};

function getCompositeKey(identifier: string, scope: RateLimitScope): string {
  return `${scope}:${identifier}`;
}

export async function checkRateLimit(
  identifier: string,
  limit: number = 5,
  window: number = 60
): Promise<RateLimitResult> {
  const db = getRedis();

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
      redisAvailable = false;
    }
  }

  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.expiresAt < now) {
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

  entry.count++;
  memoryStore.set(key, entry);

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    reset: entry.expiresAt,
    limit,
  };
}

export async function checkRateLimitWithScope(
  ip: string,
  userId?: string,
  scope: RateLimitScope = "api"
): Promise<RateLimitResult> {
  const config = rateLimitConfig[scope];
  
  if (userId) {
    const userResult = await checkRateLimit(`user:${userId}`, config.limit, config.window);
    if (!userResult.allowed) {
      return userResult;
    }
  }
  
  return checkRateLimit(`ip:${ip}`, config.limit, config.window);
}

export function getIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0] ?? "unknown";
  return ip.trim();
}
