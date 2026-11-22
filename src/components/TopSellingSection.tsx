"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRODUCTS, formatTaka } from "@/data/catalog";
import { useStore } from "@/context/StoreContext";
import { SafeImage } from "@/components/SafeImage";
import { CartIcon } from "@/components/Icons";

export function TopSellingSection() {
  const router = useRouter();
  const { addToCart } = useStore();
  const topSelling = PRODUCTS.filter((p) => p.isTopSelling);

  return (
    <section className="mx-auto max-w-[1320px] px-3 sm:px-6 pb-12">
      <h2 className="text-center text-[22px] sm:text-[26px] font-semibold text-[#222831] mb-6">
        Top Selling Products
      </h2>

      {/* 2-Column Featured Grid matching ghorerbazar.com */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {topSelling.map((product) => {
          const saveAmount =
            product.regularPrice && product.regularPrice > product.price
              ? product.regularPrice - product.price
              : 0;

          return (
            <div
              key={product.id}
              className="relative rounded-2xl bg-white border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 transition-all hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:border-emerald-200"
            >
              {/* Top-Right Best Selling Badge */}
              {product.badgeLeft && (
                <span className="absolute top-0 right-0 z-10 inline-flex items-center gap-1 rounded-bl-[10px] rounded-tr-[16px] bg-[#065f46] px-3.5 py-1 text-[11.5px] font-bold text-white shadow-xs">
                  <span aria-hidden="true">🔥</span>
                  <span>{product.badgeLeft}</span>
                </span>
              )}

              {/* Left Product Image */}
              <Link
                href={`/products/${product.slug}`}
                className="w-[165px] h-[165px] sm:w-[195px] sm:h-[195px] shrink-0 flex items-center justify-center bg-white rounded-xl p-2 overflow-hidden"
              >
                <SafeImage
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
                />
              </Link>

              {/* Right Content & Action Buttons */}
              <div className="flex-1 w-full flex flex-col items-center sm:items-start text-center sm:text-left">
                <Link
                  href={`/products/${product.slug}`}
                  className="text-[17px] sm:text-[18.5px] font-bold text-slate-800 hover:text-[#065f46] transition-colors"
                >
                  {product.name}
                </Link>

                <div className="mt-2 flex items-baseline gap-2.5 flex-wrap justify-center sm:justify-start">
                  <span className="text-[20px] font-black text-[#065f46]">
                    {formatTaka(product.price)}
                  </span>
                  {product.regularPrice && (
                    <span className="text-[14.5px] text-slate-400 line-through">
                      {formatTaka(product.regularPrice)}
                    </span>
                  )}
                </div>

                {saveAmount > 0 && (
                  <span className="mt-1.5 inline-block rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-3 py-0.5 text-[11.5px] font-bold">
                    Save {formatTaka(saveAmount)}
                  </span>
                )}

                {/* Side-by-side Add To Cart + Buy now */}
                <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={() => addToCart(product, 1, true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-4 py-2 text-[13.5px] font-bold text-[#065f46] hover:bg-[#065f46] hover:text-white transition-all cursor-pointer shadow-2xs"
                  >
                    <CartIcon className="h-4 w-4" />
                    <span>Add To Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/checkout?buyNow=${encodeURIComponent(product.slug)}`)
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#b45309] hover:to-[#92400e] px-5 py-2 text-[13.5px] font-bold text-white shadow-xs transition-all cursor-pointer"
                  >
                    <CartIcon className="h-4 w-4" />
                    <span>Buy now</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
