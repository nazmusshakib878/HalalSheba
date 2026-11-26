"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product, Category } from '@/data/catalog';
import { sortProductVariants, repairProductImages } from '@/data/catalog';

export interface CatalogData {
  products: Product[];
  categories: Category[];
  settings: Record<string, Record<string, unknown>>;
  unavailable?: boolean;
}

export interface CatalogContextValue extends CatalogData {
  PRODUCTS: Product[];
  CATEGORIES: Category[];
  refreshCatalog: () => Promise<void>;
}

const Context = createContext<CatalogContextValue>({
  products: [],
  categories: [],
  settings: {},
  PRODUCTS: [],
  CATEGORIES: [],
  refreshCatalog: async () => {},
});

export function notifyCatalogUpdated() {
  if (typeof window === 'undefined') return;
  try {
    const bc = new BroadcastChannel('halalsheba_catalog');
    bc.postMessage('catalog_updated');
    bc.close();
  } catch {}
  try {
    localStorage.setItem('halalsheba_catalog_updated', Date.now().toString());
  } catch {}
}

export function CatalogProvider({
  data: initialData,
  children,
}: {
  data: CatalogData;
  children: React.ReactNode;
}) {
  const [data, setData] = useState<CatalogData>(initialData);

  // Sync if server sends updated initialData
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const refreshCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/catalog', {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.products) && json.products.length > 0) {
          setData((prev) => ({
            products: sortProductVariants(repairProductImages(json.products)),
            categories: Array.isArray(json.categories) && json.categories.length > 0 ? json.categories : prev.categories,
            settings: json.settings || prev.settings,
            unavailable: false,
          }));
        }
      }
    } catch {
      // Ignore background revalidation errors
    }
  }, []);

  // Listen for admin changes via BroadcastChannel and window storage events, and on tab focus
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('halalsheba_catalog');
      bc.onmessage = (event) => {
        if (event.data === 'catalog_updated') {
          refreshCatalog();
        }
      };
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'halalsheba_catalog_updated') {
        refreshCatalog();
      }
    };
    window.addEventListener('storage', handleStorage);

    const handleFocus = () => {
      refreshCatalog();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      bc?.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshCatalog]);

  return (
    <Context.Provider
      value={{
        ...data,
        PRODUCTS: data.products,
        CATEGORIES: data.categories,
        refreshCatalog,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(Context);
  return {
    ...ctx,
    PRODUCTS: ctx.products,
    CATEGORIES: ctx.categories,
  };
}
