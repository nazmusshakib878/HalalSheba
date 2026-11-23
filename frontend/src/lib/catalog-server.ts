import { cache } from 'react';
import type { CatalogData } from '@/context/CatalogContext';
import { PRODUCTS, CATEGORIES } from '@/data/catalog';

// Ultra-fast in-memory cache with 60-second TTL
let memoryCache: { data: CatalogData; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60000;

export const getCatalog = cache(async (): Promise<CatalogData> => {
  const now = Date.now();
  if (memoryCache && now < memoryCache.expiresAt) {
    return memoryCache.data;
  }

  try {
    const apiBase = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${apiBase}/api/catalog`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
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
        memoryCache = { data: result, expiresAt: now + CACHE_TTL_MS };
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
  memoryCache = { data: fallbackResult, expiresAt: now + CACHE_TTL_MS };
  return fallbackResult;
});
