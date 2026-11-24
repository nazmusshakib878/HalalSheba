import { cache } from 'react';
import type { CatalogData } from '@/context/CatalogContext';
import { PRODUCTS, CATEGORIES } from '@/data/catalog';

// Ultra-fast in-memory cache: 0s in development (instant updates), 3s in production (protect against traffic spikes)
let memoryCache: { data: CatalogData; expiresAt: number } | null = null;
const CACHE_TTL_MS = process.env.NODE_ENV === 'production' ? 3000 : 0;

export function clearCatalogServerCache() {
  memoryCache = null;
}

export const getCatalog = cache(async (): Promise<CatalogData> => {
  const now = Date.now();
  if (memoryCache && now < memoryCache.expiresAt) {
    return memoryCache.data;
  }

  try {
    const apiBase = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${apiBase}/api/catalog`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        const result: CatalogData = {
          products: data.products,
          categories: Array.isArray(data.categories) && data.categories.length > 0 ? data.categories : CATEGORIES,
          settings: data.settings || {},
          unavailable: false,
        };
        if (CACHE_TTL_MS > 0) {
          memoryCache = { data: result, expiresAt: now + CACHE_TTL_MS };
        } else {
          memoryCache = null;
        }
        return result;
      }
    }
  } catch (error) {
    // Graceful and instant fallback to local catalog
  }

  const fallbackResult: CatalogData = {
    products: PRODUCTS,
    categories: CATEGORIES,
    settings: {},
    unavailable: false,
  };
  // Do not lock memoryCache on fallback so next request retries backend immediately
  return fallbackResult;
});
