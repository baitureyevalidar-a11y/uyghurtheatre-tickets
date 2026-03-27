// ---------------------------------------------------------------------------
// Simple in-memory rate limiter
//
// Tracks request timestamps per key inside a Map.  Works correctly in a
// single-process Node.js runtime (Next.js dev server, single-instance
// deployment).  For multi-instance deployments replace the backing store
// with Redis or a shared cache.
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  /** Rolling window of request timestamps (ms) */
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

/**
 * Check whether a given key is within its rate limit.
 *
 * @param key       Unique identifier for the caller (e.g. IP address, user ID)
 * @param limit     Maximum number of requests allowed in the window
 * @param windowMs  Length of the sliding window in milliseconds
 *
 * @returns `{ success: true, remaining }` when the request is allowed,
 *          `{ success: false, remaining: 0 }` when the limit is exceeded.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { success: boolean; remaining: number } {
  const now = Date.now()
  const windowStart = now - windowMs

  let entry = store.get(key)

  if (!entry) {
    entry = { timestamps: [] }
    store.set(key, entry)
  }

  // Drop timestamps that have fallen outside the current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart)

  if (entry.timestamps.length >= limit) {
    return { success: false, remaining: 0 }
  }

  entry.timestamps.push(now)

  const remaining = limit - entry.timestamps.length
  return { success: true, remaining }
}
