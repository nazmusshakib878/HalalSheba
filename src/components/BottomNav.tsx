"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { CATEGORIES } from "@/data/catalog";
import {
  CartIcon,
  HeartIcon,
  PhoneIcon,
  MenuLinesIcon,
  CloseIcon,
} from "@/components/Icons";

function HomeSvg({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10.5l9-7.5 9 7.5v9a1.5 1.5 0 01-1.5 1.5h-5a1.5 1.5 0 01-1.5-1.5v-4.5h-2v4.5A1.5 1.5 0 019.5 21h-5A1.5 1.5 0 013 19.5v-9z"
      />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { totalItems, wishlist, openCart } = useStore();
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const isHome = pathname === "/";
  const isWishlist = pathname === "/wishlist";

  return (
    <>
      {/* Category Bottom Sheet Modal on Mobile */}
      {categoriesOpen && (
        <div
          className="md:hidden fixed inset-0 z-[95] bg-black/60 backdrop-blur-xs flex flex-col justify-end transition-opacity"
          onClick={() => setCategoriesOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-[17px] font-black text-slate-900 flex items-center gap-2">
                <span>📁</span>
                <span>ক্যাটাগরি সমূহ</span>
              </h3>
              <button
                type="button"
                onClick={() => setCategoriesOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                aria-label="Close categories"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-4">
              <Link
                href="/collections/all-products"
                onClick={() => setCategoriesOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:border-emerald-500 transition-colors"
              >
                <span className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg bg-white text-[#065f46]">
                  <MenuLinesIcon className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-slate-800">সকল পণ্য</p>
                  <p className="text-[11px] text-emerald-700 font-semibold">সব দেখুন →</p>
                </div>
              </Link>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/collections/${cat.slug}`}
                  onClick={() => setCategoriesOpen(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-colors"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-10 w-10 object-contain rounded-lg bg-amber-50/50 p-0.5"
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-slate-800 truncate">
                      {cat.name}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      কালেকশন →
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>জরুরি অর্ডার বা জিজ্ঞাসা?</span>
              <a
                href="tel:+8801313946402"
                className="font-bold text-[#065f46] hover:underline"
              >
                ০১৩১৩-৯৪৬৪০২
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Sticky Bottom Nav Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.07)] px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]"
      >
        <div className="grid grid-cols-5 items-center justify-items-center">
          {/* 1. Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${
              isHome
                ? "text-[#065f46]"
                : "text-slate-600 hover:text-[#065f46]"
            }`}
          >
            <HomeSvg className="h-5 w-5 mb-0.5" />
            <span
              className={`text-[10.5px] tracking-tight ${
                isHome ? "font-bold text-[#065f46]" : "font-semibold"
              }`}
            >
              হোম
            </span>
          </Link>

          {/* 2. Categories Drawer */}
          <button
            type="button"
            onClick={() => setCategoriesOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-1.5 rounded-lg text-slate-600 hover:text-[#065f46] transition-colors cursor-pointer"
          >
            <MenuLinesIcon className="h-5 w-5 mb-0.5" />
            <span className="text-[10.5px] font-semibold tracking-tight">
              ক্যাটাগরি
            </span>
          </button>

          {/* 3. Direct Call Hotline */}
          <a
            href="tel:+8801313946402"
            className="flex flex-col items-center justify-center -mt-4 relative group cursor-pointer"
            aria-label="Call Hotline 01313-946402"
          >
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#065f46] to-[#047857] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(6,95,70,0.4)] group-hover:scale-105 transition-transform border-2 border-white">
              <PhoneIcon className="h-5 w-5 animate-pulse" />
            </div>
            <span className="text-[10.5px] font-bold text-[#065f46] mt-0.5 tracking-tight">
              কল দিন
            </span>
          </a>

          {/* 4. Wishlist */}
          <Link
            href="/wishlist"
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition-colors relative cursor-pointer ${
              isWishlist
                ? "text-[#d97706]"
                : "text-slate-600 hover:text-[#d97706]"
            }`}
          >
            <div className="relative">
              <HeartIcon
                className="h-5 w-5 mb-0.5"
                filled={wishlist.length > 0}
              />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-2.5 h-4 min-w-[16px] px-1 rounded-full bg-[#d97706] text-white text-[9.5px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span
              className={`text-[10.5px] tracking-tight ${
                isWishlist ? "font-bold text-[#d97706]" : "font-semibold"
              }`}
            >
              পছন্দ
            </span>
          </Link>

          {/* 5. Cart Drawer Trigger */}
          <button
            type="button"
            onClick={openCart}
            aria-label="Open Cart"
            className="flex flex-col items-center justify-center py-1 px-1.5 rounded-lg text-slate-600 hover:text-[#065f46] transition-colors relative cursor-pointer"
          >
            <div className="relative">
              <CartIcon className="h-5 w-5 mb-0.5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2.5 h-4 min-w-[16px] px-1 rounded-full bg-[#065f46] text-white text-[9.5px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[10.5px] font-semibold tracking-tight">
              কার্ট
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
