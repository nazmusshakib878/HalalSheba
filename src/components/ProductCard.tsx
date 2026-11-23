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
    <div className="group relative flex h-full min-w-0 flex-col rounded border border-slate-300 bg-white p-2 transition-colors hover:border-slate-300">
      <div className="relative">
        {/* Wishlist toggle button: visible on mobile touch (opacity-90), on desktop hover (group-hover) */}
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className={`absolute top-1 right-1 z-10 h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center bg-white/95 border border-slate-200 transition-all cursor-pointer shadow-xs ${
            wishlisted
              ? "text-[#d97706] opacity-100"
              : "text-slate-400 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:text-[#065f46]"
          }`}
        >
          <HeartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" filled={wishlisted} />
        </button>

        <Link
          href={`/products/${product.slug}`}
          className="aspect-square w-full overflow-hidden bg-white mb-3 sm:mb-4 flex items-center justify-center"
        >
          <SafeImage
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain"
          />
        </Link>
      </div>

      {/* Product Info + Add To Cart */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="block text-[13px] sm:text-[15px] font-medium leading-[1.5] text-slate-800 hover:text-[#065f46] line-clamp-2 min-h-[35px] sm:min-h-[39px] transition-colors"
          >
            {product.name}
          </Link>

          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[15px] sm:text-[17px] font-semibold text-[#d97706]">
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
          className="mt-2 sm:mt-3 w-full inline-flex items-center justify-center gap-1 sm:gap-1.5 min-h-10 rounded border border-[#d97706] bg-white py-2 px-1 sm:px-3 text-[11px] sm:text-[13px] font-medium text-[#b45309] hover:bg-amber-50 transition-colors cursor-pointer whitespace-nowrap"
        >
          <CartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate">Add To Cart</span>
        </button>
      </div>
    </div>
  );
}
