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
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-2.5 sm:p-3.5 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-emerald-300">
      {/* Top Left Status Badge + Top Right Save Badge */}
      <div className="relative">
        {product.badgeLeft && (
          <span className="absolute top-1 left-1 z-10 inline-flex items-center gap-1 rounded-full bg-[#065f46] px-2 py-0.5 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-[11px] font-bold text-white shadow-2xs">
            {product.badgeLeft === "Best Selling" && (
              <span aria-hidden="true">🔥</span>
            )}
            <span>{product.badgeLeft}</span>
          </span>
        )}

        {product.saveText && (
          <span className="absolute top-1 right-1 z-10 inline-flex items-center rounded-full bg-[#d97706] px-2 py-0.5 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-[11px] font-bold text-white shadow-2xs">
            {product.saveText}
          </span>
        )}

        {/* Wishlist toggle button: visible on mobile touch (opacity-90), on desktop hover (group-hover) */}
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className={`absolute ${
            product.saveText ? "top-7 sm:top-8" : "top-1"
          } right-1 z-10 h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center bg-white/95 border border-slate-200 transition-all cursor-pointer shadow-xs ${
            wishlisted
              ? "text-[#d97706] opacity-100"
              : "text-slate-400 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:text-[#065f46]"
          }`}
        >
          <HeartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" filled={wishlisted} />
        </button>

        <Link
          href={`/products/${product.slug}`}
          className="block aspect-square w-full overflow-hidden rounded-xl bg-[#fef4ea] mb-2.5 sm:mb-3 flex items-center justify-center p-1"
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
            className="block text-[13px] sm:text-[14px] font-semibold leading-[1.35] text-slate-800 hover:text-[#065f46] line-clamp-2 min-h-[35px] sm:min-h-[39px] transition-colors"
          >
            {product.name}
          </Link>

          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[15px] sm:text-[17px] font-black text-[#065f46]">
              {formatTaka(product.price)}
            </span>
            {product.regularPrice && (
              <span className="text-[11.5px] sm:text-[13px] text-slate-400 line-through">
                {formatTaka(product.regularPrice)}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => addToCart(product, 1, true)}
          className="mt-2 sm:mt-3 w-full inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50/70 py-1.5 sm:py-2.5 px-1 sm:px-3 text-[11px] xs:text-[12px] sm:text-[13px] font-bold text-[#065f46] hover:bg-[#065f46] hover:text-white transition-all cursor-pointer shadow-2xs whitespace-nowrap active:scale-[0.98]"
        >
          <CartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate">Add To Cart</span>
        </button>
      </div>
    </div>
  );
}
