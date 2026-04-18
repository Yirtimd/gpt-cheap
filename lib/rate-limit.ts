import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

let _signupLimiter: Ratelimit | null = null;

function getSignupLimiter(): Ratelimit | null {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!_signupLimiter) {
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
    _signupLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      analytics: true,
      prefix: "rl:signup",
    });
  }
  return _signupLimiter;
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
  stub?: boolean;
};

export async function limitSignup(identifier: string): Promise<RateLimitResult> {
  const limiter = getSignupLimiter();
  if (!limiter) {
    return { success: true, remaining: 999, reset: 0, stub: true };
  }
  const res = await limiter.limit(identifier);
  return { success: res.success, remaining: res.remaining, reset: res.reset };
}
