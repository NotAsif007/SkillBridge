/**
 * cache.js — High-Performance In-Memory & Session Storage Stale-While-Revalidate Cache
 * 
 * Accelerates page transitions to 0ms by rendering cached data instantly while
 * revalidating in the background.
 */

const memoryCache = new Map();
const SESSION_PREFIX = 'sb_cache_';

// Default Time-to-Live: 5 minutes for reference data, 1 minute for user metrics
export const CACHE_TTL = {
  STATIC: 10 * 60 * 1000,    // 10 mins (Careers, Skills)
  STANDARD: 3 * 60 * 1000,   // 3 mins (Dashboard, Assessments, Jobs)
  DYNAMIC: 1 * 60 * 1000,    // 1 min (Profile, Roadmap)
};

export const apiCache = {
  /**
   * Get cached data if available
   * @param {string} key
   * @returns {{ data: any, isStale: boolean } | null}
   */
  get(key) {
    // 1. Check in-memory first (fastest)
    if (memoryCache.has(key)) {
      const entry = memoryCache.get(key);
      const isStale = Date.now() > entry.expiry;
      return { data: entry.data, isStale };
    }

    // 2. Check sessionStorage fallback (persists across page reloads in session)
    try {
      const raw = sessionStorage.getItem(SESSION_PREFIX + key);
      if (raw) {
        const entry = JSON.parse(raw);
        const isStale = Date.now() > entry.expiry;
        // Promote back to memory cache
        memoryCache.set(key, entry);
        return { data: entry.data, isStale };
      }
    } catch {
      // Ignore sessionStorage serialization errors
    }

    return null;
  },

  /**
   * Set cache entry
   * @param {string} key
   * @param {any} data
   * @param {number} ttlMs
   */
  set(key, data, ttlMs = CACHE_TTL.STANDARD) {
    const entry = {
      data,
      expiry: Date.now() + ttlMs,
      savedAt: Date.now(),
    };

    memoryCache.set(key, entry);

    try {
      sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Storage might be full or disabled, memoryCache is sufficient
    }
  },

  /**
   * Invalidate specific key or keys matching prefix/pattern
   * @param {string | RegExp} pattern
   */
  invalidate(pattern) {
    if (typeof pattern === 'string') {
      memoryCache.delete(pattern);
      try {
        sessionStorage.removeItem(SESSION_PREFIX + pattern);
      } catch {}
      return;
    }

    if (pattern instanceof RegExp) {
      for (const key of memoryCache.keys()) {
        if (pattern.test(key)) {
          memoryCache.delete(key);
        }
      }
      try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith(SESSION_PREFIX) && pattern.test(key.slice(SESSION_PREFIX.length))) {
            sessionStorage.removeItem(key);
          }
        }
      } catch {}
    }
  },

  /**
   * Clear entire cache
   */
  clear() {
    memoryCache.clear();
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(SESSION_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      }
    } catch {}
  },
};
