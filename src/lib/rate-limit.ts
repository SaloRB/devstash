import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

export function getIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export async function checkRateLimit(
  key: string,
  limit: number,
  window: `${number} ${"ms" | "s" | "m" | "h" | "d"}`
): Promise<{ allowed: boolean; retryAfterSecs: number }> {
  const client = getRedis();
  if (!client) return { allowed: true, retryAfterSecs: 0 };

  try {
    const limiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: "rl",
    });

    const result = await limiter.limit(key);
    const retryAfterSecs = result.success
      ? 0
      : Math.ceil((result.reset - Date.now()) / 1000);

    return { allowed: result.success, retryAfterSecs };
  } catch (err) {
    console.error("Rate limit check failed:", err);
    return { allowed: true, retryAfterSecs: 0 };
  }
}

export async function applyRateLimit(
  key: string,
  limit: number,
  window: `${number} ${"ms" | "s" | "m" | "h" | "d"}`
): Promise<NextResponse | null> {
  const { allowed, retryAfterSecs } = await checkRateLimit(key, limit, window);

  if (!allowed) {
    const minutes = Math.ceil(retryAfterSecs / 60);
    return NextResponse.json(
      {
        error: `Too many attempts. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
      },
      { status: 429, headers: { "Retry-After": String(retryAfterSecs) } }
    );
  }

  return null;
}
