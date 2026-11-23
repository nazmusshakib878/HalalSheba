"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Product } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";

interface ProductCarouselSectionProps {
  title: string;
  viewAllHref: string;
  products: Product[];
  direction?: "left" | "right";
}

export function ProductCarouselSection({
  title,
  viewAllHref,
  products,
  direction = "left",
}: ProductCarouselSectionProps) {
  const [perView, setPerView] = useState(4);
  const [startIndex, setStartIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const updatePerView = () => {
      const w = window.innerWidth;
      if (w < 640) setPerView(2);
      else if (w < 1024) setPerView(3);
      else setPerView(4);
    };
    updatePerView();
    window.addEventListener("resize", updatePerView);
    return () => window.removeEventListener("resize", updatePerView);
  }, []);

  const maxStart = Math.max(0, products.length - perView);
  const safeStart = Math.min(startIndex, maxStart);
  const totalDots = Math.max(1, maxStart + 1);
  const travelDirection = useRef(direction === "left" ? 1 : -1);

  useEffect(() => {
    travelDirection.current = direction === "left" ? 1 : -1;
    setStartIndex(direction === "right" ? maxStart : 0);
  }, [direction, maxStart]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPlaying(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!playing || interacting || maxStart === 0) return;
    const timer = window.setInterval(() => {
      const bounds = sectionRef.current?.getBoundingClientRect();
      if (document.hidden || !bounds || bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
      // Reverse at the edge instead of jumping across the entire row.
      if (safeStart >= maxStart) travelDirection.current = -1;
      else if (safeStart <= 0) travelDirection.current = 1;
      setStartIndex(safeStart + travelDirection.current);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [playing, interacting, maxStart, safeStart]);

  const prev = () => setStartIndex((s) => (s <= 0 ? maxStart : s - 1));
  const next = () => setStartIndex((s) => (s >= maxStart ? 0 : s + 1));

  return (
    <section ref={sectionRef} className="mx-auto max-w-[1320px] px-3 sm:px-6 pb-8 sm:pb-11"
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setInteracting(false);
      }}>
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6 border-b border-slate-200 pb-2.5 sm:pb-3">
        <div className="relative">
          <h2 className="text-[18px] sm:text-[23px] font-semibold text-[#244333] tracking-tight">
            {title}
          </h2>
          <span className="absolute left-0 -bottom-[11px] sm:-bottom-[13px] h-[3px] w-16 sm:w-20 bg-[#065f46] rounded-full" />
        </div>
        <Link
          href={viewAllHref}
          className="shrink-0 inline-flex items-center gap-1 text-[12px] sm:text-[13px] font-bold uppercase tracking-wide text-[#065f46] hover:text-[#d97706] transition-colors"
        >
          <span>সকল পণ্য দেখুন</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Smooth Sliding Track with Touch Swipe */}
      <div
        className="relative group/slider"
        onTouchStart={(e) => {
          setInteracting(true);
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          setInteracting(false);
          if (touchStartX.current === null) return;
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          if (delta > 40) prev();
          if (delta < -40) next();
          touchStartX.current = null;
        }}
        onTouchCancel={() => { touchStartX.current = null; setInteracting(false); }}
      >
        {products.length > perView && (
          <button
            type="button"
            onClick={prev}
            aria-label={`Previous ${title}`}
            className="hidden sm:flex absolute -left-2 sm:-left-3.5 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white border border-gray-200 text-[#222831] hover:bg-[#065f46] hover:text-white hover:border-[#065f46] items-center justify-center shadow-md lg:opacity-0 lg:group-hover/slider:opacity-100 transition-all cursor-pointer"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        )}

        <div className="overflow-hidden py-1">
          <div
            className="flex transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{
              transform: `translateX(-${(safeStart * 100) / perView}%)`,
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                style={{ width: `${100 / perView}%` }}
                className="shrink-0 px-1.5 sm:px-2 flex flex-col"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {products.length > perView && (
          <button
            type="button"
            onClick={next}
            aria-label={`Next ${title}`}
            className="hidden sm:flex absolute -right-2 sm:-right-3.5 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white border border-gray-200 text-[#222831] hover:bg-[#065f46] hover:text-white hover:border-[#065f46] items-center justify-center shadow-md lg:opacity-0 lg:group-hover/slider:opacity-100 transition-all cursor-pointer"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Pagination Dots */}
      {totalDots > 1 && (
        <div className="mt-4 sm:mt-5 flex items-center justify-center gap-1.5 sm:gap-2">
          {Array.from({ length: totalDots }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setStartIndex(idx)}
              aria-label={`${title} slide ${idx + 1}`}
              className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full transition-colors cursor-pointer ${
                idx === safeStart
                  ? "bg-[#065f46] w-5 sm:w-6"
                  : "border border-slate-300 bg-slate-200 hover:bg-slate-300"
              }`}
            />
          ))}
          <button
            type="button"
            onClick={() => {
              setPlaying((value) => !value);
              setInteracting(false);
            }}
            aria-label={playing ? `Pause ${title} slideshow` : `Play ${title} slideshow`}
            aria-pressed={playing}
            className="ml-3 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-[#065f46] hover:bg-emerald-50 cursor-pointer"
          >
            <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
          </button>
        </div>
      )}
    </section>
  );
}
