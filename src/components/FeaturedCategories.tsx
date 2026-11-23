"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/data/catalog";
import { SafeImage } from "@/components/SafeImage";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";

export function FeaturedCategories() {
  const [perView, setPerView] = useState(6);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const updatePerView = () => {
      const w = window.innerWidth;
      if (w < 640) setPerView(2);
      else if (w < 768) setPerView(3);
      else if (w < 1024) setPerView(4);
      else setPerView(6);
    };
    updatePerView();
    window.addEventListener("resize", updatePerView);
    return () => window.removeEventListener("resize", updatePerView);
  }, []);

  const maxIndex = Math.max(0, CATEGORIES.length - perView);
  const safeIndex = Math.min(index, maxIndex);

  const prev = () => setIndex((i) => (i <= 0 ? maxIndex : i - 1));
  const next = () => setIndex((i) => (i >= maxIndex ? 0 : i + 1));

  return (
    <section className="mx-auto max-w-[1320px] px-3 sm:px-6 pt-3 pb-8 sm:pb-10">
      <h2 className="text-center text-[20px] sm:text-[26px] font-bold text-slate-800 mb-4 sm:mb-6">
        ক্যাটাগরি সমূহ
      </h2>

      <div
        className="relative px-1 sm:px-3"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          if (delta > 40) prev();
          if (delta < -40) next();
          touchStartX.current = null;
        }}
      >
        {/* Left Arrow */}
        <button
          type="button"
          onClick={prev}
          aria-label="Scroll categories left"
          className="hidden sm:flex absolute -left-1 sm:-left-2.5 top-[42%] -translate-y-1/2 z-20 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#065f46] hover:bg-[#043d2e] text-white items-center justify-center shadow-md transition-colors cursor-pointer"
        >
          <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Smooth Horizontal Sliding Track */}
        <div className="overflow-hidden py-2">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${(safeIndex * 100) / perView}%)`,
            }}
          >
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                style={{ width: `${100 / perView}%` }}
                className="shrink-0 px-1.5 sm:px-2"
              >
                <Link
                  href={`/collections/${cat.slug}`}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="w-full aspect-[1.08/1] rounded-2xl bg-white border border-slate-200/80 shadow-[0_3px_14px_rgba(0,0,0,0.04)] group-hover:shadow-[0_8px_24px_rgba(6,95,70,0.14)] group-hover:border-emerald-300 flex items-center justify-center p-3 sm:p-4 transition-all duration-300">
                    <SafeImage
                      src={cat.image}
                      alt={cat.name}
                      className="h-16 w-16 sm:h-24 sm:w-24 object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <span className="mt-2 text-[12.5px] sm:text-[14px] font-bold text-slate-800 group-hover:text-[#065f46] transition-colors truncate max-w-full">
                    {cat.name}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={next}
          aria-label="Scroll categories right"
          className="hidden sm:flex absolute -right-1 sm:-right-2.5 top-[42%] -translate-y-1/2 z-20 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#065f46] hover:bg-[#043d2e] text-white items-center justify-center shadow-md transition-colors cursor-pointer"
        >
          <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </section>
  );
}
