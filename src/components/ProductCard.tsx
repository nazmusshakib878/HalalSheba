"use client";

import React from "react";
import Link from "next/link";
import { Product, formatTaka } from "@/data/catalog";
import { useStore } from "@/context/StoreContext";
import { SafeImage } from "@/components/SafeImage";
import { CartIcon, HeartIcon } from "@/components/Icons";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-emerald-300">
      {/* Top Left Status Badge + Top Right Save Badge */}
      <div className="relative">
        {product.badgeLeft && (
          <span className="absolute top-1 left-1 z-10 inline-flex items-center gap-1 rounded-full bg-[#065f46] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
            {product.badgeLeft === "Best Selling" && (
              <span aria-hidden="true">🔥</span>
            )}
            <span>{product.badgeLeft}</span>
          </span>
        )}

        {product.saveText && (
          <span className="absolute top-1 right-1 z-10 inline-flex items-center rounded-full bg-[#d97706] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
            {product.saveText}
          </span>
        )}

        {/* Wishlist toggle button */}
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className={`absolute ${
            product.saveText ? "top-8" : "top-1"
          } right-1 z-10 h-7 w-7 rounded-full flex items-center justify-center bg-white/90 border border-slate-200 transition-all cursor-pointer ${
            wishlisted
              ? "text-[#d97706] opacity-100"
              : "text-slate-400 opacity-0 group-hover:opacity-100 hover:text-[#065f46]"
          }`}
        >
          <HeartIcon className="h-4 w-4" filled={wishlisted} />
        </button>

        <Link
          href={`/products/${product.slug}`}
          className="block aspect-square w-full overflow-hidden rounded-xl bg-[#fef4ea] mb-3 flex items-center justify-center p-1"
        >
          <SafeImage
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Product Info + Add To Cart */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="block text-[14px] font-semibold leading-[1.38] text-slate-800 hover:text-[#065f46] line-clamp-2 min-h-[39px] transition-colors"
          >
            {product.name}
          </Link>

          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-[17px] font-black text-[#065f46]">
              {formatTaka(product.price)}
            </span>
            {product.regularPrice && (
              <span className="text-[13px] text-slate-400 line-through">
                {formatTaka(product.regularPrice)}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => addToCart(product, 1, true)}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50/50 py-2.5 px-3 text-[13px] font-bold text-[#065f46] hover:bg-[#065f46] hover:text-white transition-all cursor-pointer shadow-2xs"
        >
          <CartIcon className="h-4 w-4 shrink-0" />
          <span>Add To Cart</span>
        </button>
      </div>
    </div>
  );
}
