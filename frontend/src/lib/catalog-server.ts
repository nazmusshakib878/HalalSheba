import { cache } from 'react';
import type { CatalogData } from '@/context/CatalogContext';
import type { Product, Category } from '@/data/catalog';
import { PRODUCTS, CATEGORIES, sortProductVariants, repairProductImages } from '@/data/catalog';

// The legacy "মসলা ও বীজ" category (slug spices-seeds) was split in the admin
// panel into "মসলা" (spices), "বাদাম ও বীজ" (nuts-seeds) and "ফাংশনাল ফুড"
// (functional-food), but the database still lists it and some products still
// carry its slug. Merge those leftovers into "মসলা" here, in the one place
// every storefront surface reads from, so the legacy category stops
// duplicating the new ones in the nav, tiles, footer and collections —
// without moving any product back and without touching the database.
function mergeLegacySpicesSeeds(products: Product[], categories: Category[]): { products: Product[]; categories: Category[] } {
  const mergedProducts = products.map((p) =>
    p.categorySlug === 'spices-seeds'
      ? { ...p, categorySlug: 'spices', category: p.category === 'মসলা ও বীজ' ? 'মসলা' : p.category }
      : p
  );
  return {
    products: mergedProducts,
    categories: categories.filter((c) => c.slug !== 'spices-seeds'),
  };
}

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
        const merged = mergeLegacySpicesSeeds(
          data.products,
          Array.isArray(data.categories) && data.categories.length > 0 ? data.categories : CATEGORIES
        );
        const result: CatalogData = {
          products: sortProductVariants(repairProductImages(merged.products)),
          categories: merged.categories,
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

  const mergedFallback = mergeLegacySpicesSeeds(PRODUCTS, CATEGORIES);
  const fallbackResult: CatalogData = {
    products: sortProductVariants(repairProductImages(mergedFallback.products)),
    categories: mergedFallback.categories,
    settings: {},
    unavailable: false,
  };
  // Do not lock memoryCache on fallback so next request retries backend immediately
  return fallbackResult;
});
