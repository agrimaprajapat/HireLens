import "server-only";

/**
 * Minimal in-memory fixed-window rate limiter for public, unauthenticated
 * endpoints (currently only PDF extraction). Authenticated AI routes are not
 * rate-limited here — they are throttled by the credit system instead.
 *
 * Note: state is per-instance and in-memory, which is sufficient as a basic
 * abuse guard. A distributed store (e.g. Redis) would be the next step if the
 * app scales to multiple instances.
 */

interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();

/** Remove expired windows so the map can't grow unbounded. */
function prune(now: number): void {
  for (const [key, window] of buckets) {
    if (now > window.resetAt) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets (only meaningful when `ok` is false). */
  retryAfterSeconds: number;
}

/**
 * Record a hit for `key` and report whether it is within the allowed limit.
 * @param key       Identifier to bucket by (e.g. `extract:<ip>`).
 * @param limit     Max requests allowed per window.
 * @param windowMs  Window length in milliseconds.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const window = buckets.get(key);

  if (!window || now > window.resetAt) {
    if (buckets.size > 5000) prune(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  if (window.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((window.resetAt - now) / 1000),
    };
  }

  window.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}

/** Best-effort client IP from proxy headers, falling back to a shared bucket. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
