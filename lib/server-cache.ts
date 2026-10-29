/**
 * In-Memory Server Cache with TTL and Tag Invalidation
 * Provides ultra-fast responses for repeated database reads in API routes.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags: string[];
}

const globalForCache = globalThis as unknown as {
  __serverCache?: Map<string, CacheEntry<any>>;
  __tagMap?: Map<string, Set<string>>;
};

const cache = globalForCache.__serverCache ?? new Map<string, CacheEntry<any>>();
const tagMap = globalForCache.__tagMap ?? new Map<string, Set<string>>();

if (process.env.NODE_ENV !== "production") {
  globalForCache.__serverCache = cache;
  globalForCache.__tagMap = tagMap;
}

/**
 * Get data from cache or execute fetcher and store result
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttlSeconds?: number;
    tags?: string[];
  } = {}
): Promise<T> {
  const { ttlSeconds = 60, tags = [] } = options;
  const now = Date.now();

  const existing = cache.get(key);
  if (existing && existing.expiresAt > now) {
    return existing.data as T;
  }

  try {
    const data = await fetcher();

    // Cache the fresh data
    const expiresAt = now + ttlSeconds * 1000;
    cache.set(key, { data, expiresAt, tags });

    // Index tags
    for (const tag of tags) {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, new Set());
      }
      tagMap.get(tag)!.add(key);
    }

    return data;
  } catch (error) {
    // If fetcher fails but stale cached data exists, return stale data as fallback
    if (existing) {
      console.warn(`[ServerCache] Fetcher failed for key "${key}", serving stale data.`);
      return existing.data as T;
    }
    throw error;
  }
}

/**
 * Invalidate a specific cache key
 */
export function invalidateCacheKey(key: string): void {
  const entry = cache.get(key);
  if (entry) {
    for (const tag of entry.tags) {
      const set = tagMap.get(tag);
      if (set) {
        set.delete(key);
        if (set.size === 0) tagMap.delete(tag);
      }
    }
    cache.delete(key);
  }
}

/**
 * Invalidate all cache entries matching one or more tags
 */
export function invalidateCacheTag(...tags: string[]): void {
  for (const tag of tags) {
    const keys = tagMap.get(tag);
    if (keys) {
      for (const key of keys) {
        cache.delete(key);
      }
      tagMap.delete(tag);
    }
  }
}

/**
 * Invalidate all cached data
 */
export function clearAllServerCache(): void {
  cache.clear();
  tagMap.clear();
}

/**
 * Standard HTTP Cache-Control header helper
 */
export function getCacheHeaders(maxAgeSeconds = 30, swrSeconds = 60) {
  return {
    "Cache-Control": `public, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${swrSeconds}`,
  };
}

