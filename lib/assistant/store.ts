import { createHash, randomUUID } from "crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  LOG_RETENTION_SECONDS,
  RATE_LIMIT_PER_DAY,
  RATE_LIMIT_PER_HOUR,
} from "./config";
import type { AssistantStore, LogEntry, RateLimitResult } from "./service";

/**
 * Upstash-backed rate limiting and the unanswered-question log.
 *
 * Reads the Vercel-provisioned KV_REST_API_URL / KV_REST_API_TOKEN.
 *
 * The log is one key per entry, each expiring after 90 days, so it is readable
 * in the Upstash console's key browser (prefix `assistant:log:`) with no admin
 * page. Entries hold the question or the Gap labels — never a job description,
 * an answer, or an IP — see docs/adr/0004-assistant-grounded-in-authored-data.md.
 */
export function createUpstashStore(): AssistantStore {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  const hourly = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_PER_HOUR, "1 h"),
    prefix: "assistant:rl:hour",
  });
  const daily = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_PER_DAY, "1 d"),
    prefix: "assistant:rl:day",
  });

  async function checkRateLimit(clientId: string): Promise<RateLimitResult> {
    // Hourly first, so a request refused for the hour does not also spend a
    // daily allowance.
    for (const limiter of [hourly, daily]) {
      const { success, reset } = await limiter.limit(clientId);
      if (!success) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
        };
      }
    }
    return { allowed: true };
  }

  async function log(entry: LogEntry): Promise<void> {
    const at = new Date().toISOString();
    await redis.set(
      `assistant:log:${at}:${randomUUID().slice(0, 8)}`,
      { ...entry, at },
      { ex: LOG_RETENTION_SECONDS }
    );
  }

  return { checkRateLimit, log };
}

/**
 * The rate-limit key for a visitor. A hash rather than the address, so no IP is
 * stored; the limiter's own windows expire it within a day.
 */
export function clientIdFromIp(ip: string): string {
  return createHash("sha256").update(`cv-assistant:${ip}`).digest("hex").slice(0, 32);
}
