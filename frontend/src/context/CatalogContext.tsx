"use client";
import { createContext, useContext } from 'react';
import type { Product, Category } from '@/data/catalog';
export interface CatalogData { products: Product[]; categories: Category[]; settings: Record<string, Record<string, unknown>>; unavailable?: boolean }
const Context = createContext<CatalogData>({products:[],categories:[],settings:{}});
export function CatalogProvider({data,children}:{data:CatalogData;children:React.ReactNode}) { return <Context.Provider value={data}>{children}</Context.Provider>; }
export function useCatalog() { const data=useContext(Context); return {...data, PRODUCTS:data.products, CATEGORIES:data.categories}; }
