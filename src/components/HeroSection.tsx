"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HERO_SLIDES } from "@/data/catalog";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";

export function HeroSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused]);

  const prevSlide = () =>
    setActive((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const nextSlide = () =>
    setActive((prev) => (prev + 1) % HERO_SLIDES.length);

  return (
    <section className="mx-auto max-w-[1320px] px-3 sm:px-6 pt-4 sm:pt-6 pb-6">
      {/* Top Grid: Hero Slider (8 cols) + 2 Luxury Promo Cards (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        {/* Main Hero Slider (8 Columns) */}
        <div
          className="lg:col-span-8 relative group rounded-2xl overflow-hidden bg-gradient-to-br from-[#fdfbf7] via-[#faf6ed] to-[#f5eedb] border border-amber-900/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] min-h-[380px] sm:min-h-[420px] flex items-center select-none"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const delta = e.changedTouches[0].clientX - touchStartX.current;
            if (delta > 40) prevSlide();
            if (delta < -40) nextSlide();
            touchStartX.current = null;
          }}
        >
          {/* Slides Track */}
          <div
            className="flex h-full w-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {HERO_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className="w-full h-full shrink-0 relative flex flex-col justify-center p-6 sm:p-9 lg:p-10"
              >
                {/* Background visual with subtle gradient blend */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-right sm:object-center opacity-85 sm:opacity-90"
                  />
                  {/* Gradient overlay to ensure text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#fefbf6] via-[#fefbf6]/90 sm:via-[#fefbf6]/80 to-transparent sm:w-[70%]" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 max-w-[500px] flex flex-col space-y-3 sm:space-y-4">
                  {slide.badge && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] sm:text-[12.5px] font-bold bg-[#065f46] text-white shadow-xs w-fit">
                      <span>✨</span>
                      <span>{slide.badge}</span>
                    </span>
                  )}

                  <h2 className="text-[23px] sm:text-[30px] lg:text-[34px] font-black text-slate-900 leading-[1.2] tracking-tight">
                    {slide.title}
                  </h2>

                  {slide.subtitle && (
                    <p className="text-[13px] sm:text-[14.5px] text-slate-700 leading-relaxed line-clamp-2">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* Trust Chips */}
                  {slide.chips && slide.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {slide.chips.map((chip) => (
                        <span
                          key={chip}
                          className="inline-flex items-center text-[11.5px] font-semibold text-emerald-950 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md border border-emerald-300/80 shadow-xs"
                        >
                          <span className="text-emerald-700 mr-1 font-bold">✓</span>
                          <span>{chip}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href={slide.href}
                      className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#065f46] via-[#047857] to-[#022c22] hover:from-[#047857] hover:to-[#065f46] text-white text-[13.5px] sm:text-[14.5px] font-bold shadow-[0_4px_14px_rgba(6,95,70,0.35)] hover:shadow-[0_6px_20px_rgba(6,95,70,0.45)] transition-all transform hover:-translate-y-0.5"
                    >
                      <span>{slide.primaryBtnText || "অর্ডার করুন"}</span>
                      <span aria-hidden="true">→</span>
                    </Link>

                    {slide.priceTag && (
                      <span className="text-[13px] sm:text-[14px] font-bold text-amber-800 bg-amber-100/80 px-3.5 py-2 rounded-xl border border-amber-300/60 shadow-2xs">
                        {slide.priceTag}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Left & Right Chevrons */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/95 text-slate-800 hover:bg-[#065f46] hover:text-white flex items-center justify-center shadow-md opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-all cursor-pointer border border-slate-200/60"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/95 text-slate-800 hover:bg-[#065f46] hover:text-white flex items-center justify-center shadow-md opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-all cursor-pointer border border-slate-200/60"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          {/* Bottom Indicators */}
          <div className="absolute bottom-3.5 left-6 z-20 flex items-center gap-2">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActive(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === active
                    ? "w-7 bg-[#065f46] ring-2 ring-white/90"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Side 2 Feature Promo Cards (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 sm:gap-5">
          {/* Card 1: Artisanal Ghee & Butter */}
          <Link
            href="/products/gawa-ghee"
            className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#78350f] via-[#451a03] to-[#1c1917] p-5 text-white flex items-center justify-between shadow-[0_8px_25px_rgba(120,53,15,0.2)] border border-amber-500/25 hover:border-amber-400/60 transition-all flex-1 min-h-[180px]"
          >
            <div className="flex-1 pr-3 z-10">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-amber-950 uppercase tracking-wide shadow-2xs">
                হাতে তৈরি ঘি
              </span>
              <h3 className="text-[19px] sm:text-[20px] font-black text-white mt-1.5 leading-tight group-hover:text-amber-200 transition-colors">
                খাঁটি গাওয়া ঘি
              </h3>
              <p className="text-[12px] text-amber-100/80 mt-0.5 line-clamp-1">
                ঐতিহ্যবাহী সুবাস ও সেরা স্বাদ
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[18px] font-black text-amber-300">৳১,৫০০</span>
                <span className="text-[11px] text-amber-200/70">/ ১ কেজি বোতল</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[12px] font-bold text-amber-300 mt-2 group-hover:translate-x-1 transition-transform">
                অর্ডার করুন →
              </span>
            </div>

            <div className="relative w-[115px] h-[115px] sm:w-[130px] sm:h-[130px] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/products/gawa-ghee.jpg"
                alt="খাঁটি গাওয়া ঘি"
                className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Card 2: Satkhira Authentic Chui Jhal */}
          <Link
            href="/products/chui-jhal"
            className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#0f172a] p-5 text-white flex items-center justify-between shadow-[0_8px_25px_rgba(6,78,59,0.2)] border border-emerald-500/25 hover:border-emerald-400/60 transition-all flex-1 min-h-[180px]"
          >
            <div className="flex-1 pr-3 z-10">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400 text-emerald-950 uppercase tracking-wide shadow-2xs">
                সাতক্ষীরার ঐতিহ্য
              </span>
              <h3 className="text-[19px] sm:text-[20px] font-black text-white mt-1.5 leading-tight group-hover:text-emerald-200 transition-colors">
                সাতক্ষীরার চুইঝাল
              </h3>
              <p className="text-[12px] text-emerald-100/80 mt-0.5 line-clamp-1">
                মাংস ও তরকারির আসল স্বাদ
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[18px] font-black text-emerald-300">৳৪৫০</span>
                <span className="text-[11px] text-emerald-200/70">/ ২৫০ গ্রাম</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-300 mt-2 group-hover:translate-x-1 transition-transform">
                কালেকশন দেখুন →
              </span>
            </div>

            <div className="relative w-[115px] h-[115px] sm:w-[130px] sm:h-[130px] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/products/chui-jhal.jpg"
                alt="সাতক্ষীরার চুইঝাল"
                className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>
        </div>
      </div>

      {/* 4-Pillar Trust / Value Proposition Bar Directly Below Hero */}
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-emerald-300 transition-colors">
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 text-[18px]">
            🌿
          </div>
          <div>
            <h4 className="text-[13px] sm:text-[14px] font-bold text-slate-800 leading-tight">
              ১০০% খাঁটি ও অর্গানিক
            </h4>
            <p className="text-[11.5px] text-slate-500 mt-0.5 line-clamp-1">
              সরাসরি প্রাকৃতিক উৎস থেকে
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-emerald-300 transition-colors">
          <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 text-[18px]">
            🚚
          </div>
          <div>
            <h4 className="text-[13px] sm:text-[14px] font-bold text-slate-800 leading-tight">
              ক্যাশ অন ডেলিভারি
            </h4>
            <p className="text-[11.5px] text-slate-500 mt-0.5 line-clamp-1">
              সারা দেশে পণ্য হাতে পেয়ে পরিশোধ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-emerald-300 transition-colors">
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 text-[18px]">
            🛡️
          </div>
          <div>
            <h4 className="text-[13px] sm:text-[14px] font-bold text-slate-800 leading-tight">
              মানিব্যাক গ্যারান্টি
            </h4>
            <p className="text-[11.5px] text-slate-500 mt-0.5 line-clamp-1">
              ভেজাল প্রমাণে ১০০% রিফান্ড
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-emerald-300 transition-colors">
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 text-[18px]">
            📞
          </div>
          <div>
            <h4 className="text-[13px] sm:text-[14px] font-bold text-slate-800 leading-tight">
              ফোন ও হোয়াটসঅ্যাপ
            </h4>
            <p className="text-[11.5px] text-slate-500 mt-0.5 line-clamp-1">
              ০১৩১৩-৯৪৬৪০২ নম্বরে কল দিন
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
