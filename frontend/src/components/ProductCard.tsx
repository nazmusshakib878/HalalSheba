"use client";

import React, { useState } from "react";
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
  // Variant products (e.g. the wooden roti maker with ৮/৯/১০ ইঞ্চি sizes,
  // or mustard oil with ১/৫ লিটার): show the size buttons and an Add to
  // Cart button that adds the selected variant directly — like the product
  // detail page, which pre-selects the first variant. No stock count is
  // shown anywhere.
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const selected = selectedVariant != null ? variants[selectedVariant] : null;
  // Default to the first variant when no size is selected yet, matching
  // the product detail page (which starts at variant index 0). addToCart
  // also falls back to variants[0] when variantId is undefined.
  const effectiveVariant = selected ?? variants[0];
  const minPrice = hasVariants ? Math.min(...variants.map((v) => v.price)) : product.price;
  const maxPrice = hasVariants ? Math.max(...variants.map((v) => v.price)) : product.price;

  return (
    <div className="premium-product group relative flex h-full min-w-0 flex-col">
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
          className="premium-product-image aspect-square w-full overflow-hidden flex items-center justify-center"
        >
          <SafeImage
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain"
          />
        </Link>
      </div>

      {/* Product Info + Add To Cart */}
      <div className="premium-product-info flex flex-col flex-1 justify-between">
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="block font-bengali text-[14px] sm:text-[16px] font-medium leading-[1.65] text-slate-800 hover:text-[#065f46] line-clamp-2 min-h-[47px] sm:min-h-[53px] transition-colors"
          >
            {product.name}
          </Link>

          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[15px] sm:text-[18px] font-semibold text-[#254b39]">
              {selected
                ? formatTaka(selected.price)
                : hasVariants && minPrice !== maxPrice
                ? `${formatTaka(minPrice)} – ${formatTaka(maxPrice)}`
                : formatTaka(product.price)}
            </span>
            {!selected && product.regularPrice && (
              <span className="text-[11.5px] sm:text-[13px] text-slate-400 line-through">
                {formatTaka(product.regularPrice)}
              </span>
            )}
          </div>

          {hasVariants && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {variants.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={selectedVariant === i}
                  onClick={() => setSelectedVariant(i)}
                  className={
                    "rounded-lg border px-2.5 py-1.5 text-[11px] sm:text-xs font-bold cursor-pointer " +
                    (selectedVariant === i
                      ? "border-orange-500 text-orange-500 bg-orange-50"
                      : "border-slate-200 text-slate-700")
                  }
                >
                  {v.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {hasVariants ? (
          <button
            type="button"
            onClick={() =>
              addToCart({ ...product, variantId: effectiveVariant.id }, 1, true)
            }
            className="premium-cart-button mt-3 sm:mt-4 w-full inline-flex items-center justify-center gap-1.5 min-h-11 py-2 px-2 text-[12px] sm:text-[13px] font-semibold cursor-pointer active:scale-95 transition-transform"
          >
            <CartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span>Add to Cart</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => addToCart(product, 1, true)}
            className="premium-cart-button mt-3 sm:mt-4 w-full inline-flex items-center justify-center gap-1.5 min-h-11 py-2 px-2 text-[12px] sm:text-[13px] font-semibold cursor-pointer active:scale-95 transition-transform"
          >
            <CartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span>Add to Cart</span>
          </button>
        )}
      </div>
    </div>
  );
}
