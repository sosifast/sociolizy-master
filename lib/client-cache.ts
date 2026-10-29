"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// In-memory client cache map (persists as user navigates around the SPA/Next.js app)
const clientCacheStore = new Map<string, CacheItem<any>>();

export const clientCache = {
  get<T>(key: string, maxAgeMs = 60_000): T | null {
    const item = clientCacheStore.get(key);
    if (!item) return null;
    const isStale = Date.now() - item.timestamp > maxAgeMs;
    // We still return stale data for SWR (stale-while-revalidate), but mark whether it needs refresh
    return item.data as T;
  },

  isExpired(key: string, maxAgeMs = 60_000): boolean {
    const item = clientCacheStore.get(key);
    if (!item) return true;
    return Date.now() - item.timestamp > maxAgeMs;
  },

  set<T>(key: string, data: T): void {
    clientCacheStore.set(key, { data, timestamp: Date.now() });
  },

  invalidate(patternOrKey?: string): void {
    if (!patternOrKey) {
      clientCacheStore.clear();
      return;
    }
    for (const key of clientCacheStore.keys()) {
      if (key === patternOrKey || key.startsWith(patternOrKey)) {
        clientCacheStore.delete(key);
      }
    }
  },

  clear(): void {
    clientCacheStore.clear();
  },
};

interface UseCachedFetchOptions<T> {
  ttlMs?: number;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (err: any) => void;
}

/**
 * Reusable React Hook with Stale-While-Revalidate Client Caching.
 * Loads instantly from cache on navigation (0ms), then silently revalidates.
 */
export function useCachedFetch<T>(
  url: string | null,
  options: UseCachedFetchOptions<T> = {}
) {
  const { ttlMs = 60_000, enabled = true, onSuccess, onError } = options;

  // Check if we have cached data right at hook initialization
  const cachedData = url ? clientCache.get<T>(url, ttlMs) : null;
  const isExpired = url ? clientCache.isExpired(url, ttlMs) : true;

  const [data, setData] = useState<T | null>(cachedData);
  // If we already have cached data, don't show initial full-page loader!
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(url && !cachedData));
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!url || !enabled) return;

      const currentCached = clientCache.get<T>(url, ttlMs);
      const expired = clientCache.isExpired(url, ttlMs);

      // If we have unexpired cache and not forcing refresh, no network request needed
      if (currentCached && !expired && !forceRefresh) {
        setData(currentCached);
        setIsLoading(false);
        return;
      }

      // If forcing refresh or no cache, show appropriate loader
      if (forceRefresh) {
        setIsRefreshing(true);
      } else if (!currentCached) {
        setIsLoading(true);
      }

      try {
        const res = await fetch(url);
        const json = await res.json();

        if (!isMountedRef.current) return;

        if (json.success !== false) {
          const payload = (json.data !== undefined ? json.data : json) as T;
          clientCache.set(url, payload);
          setData(payload);
          setError(null);
          onSuccess?.(payload);
        } else {
          setError(json.message || "Failed to fetch data");
          onError?.(json.message);
        }
      } catch (err: any) {
        if (!isMountedRef.current) return;
        setError(err);
        onError?.(err);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [url, enabled, ttlMs, onSuccess, onError]
  );

  // Trigger on mount or url change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Force re-fetch function for manual refresh buttons
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Mutate local state and cache directly (e.g. after optimistic updates or item deletion)
  const mutate = useCallback(
    (updater: T | ((prev: T | null) => T | null)) => {
      setData((prev) => {
        const next = typeof updater === "function" ? (updater as any)(prev) : updater;
        if (url) {
          clientCache.set(url, next);
        }
        return next;
      });
    },
    [url]
  );

  return {
    data,
    setData,
    isLoading,
    isRefreshing,
    error,
    refresh,
    mutate,
  };
}

