"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {useCatalog} from '@/context/CatalogContext';
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";

// Ghorer Bazar-style contained hero: a wide photographic carousel panel
// (~66%) beside a narrow static promo panel (~33%), sitting on the warm
// cream page ground. Photography leads; the headline stays live HTML text
// (never baked into the image), so the admin appearance overrides keep
// working. The old dark full-bleed design language (trust row, ghost
// numeral, arch frame, gold ring, honeycomb texture) is gone.
const slides = [
  { label: "প্রকৃতির মিষ্টি উপহার", title: "প্রতিদিনের শুরু হোক", emphasis: "মধুর স্বাদে।", description: "সুন্দরবনের মধু থেকে ফুলের মধু—আপনার পছন্দের স্বাদ খুঁজে নিন আমাদের সংগ্রহে।", image: "/images/banners/hero-honey.jpg", alt: "হালাল সেবার পাঁচ রকমের মধুর বোতল", href: "/collections/honey", action: "মধুর সংগ্রহ দেখুন", number: "01", caption: "মধু" },
  { label: "রান্নায় আপন স্বাদ", title: "একটুখানি ঘি,", emphasis: "অনেকখানি তৃপ্তি।", description: "গরম ভাত, পোলাও কিংবা ঘরোয়া রান্না—পছন্দের ঘি ও তেলে সাজান প্রতিদিনের খাবার।", image: "/images/products/butter-makhon.jpg", alt: "হালাল সেবার বাটার ও মাখনের জার", href: "/collections/oil-ghee", action: "ঘি ও তেল দেখুন", number: "02", caption: "ঘি ও তেল" },
  { label: "চেনা স্বাদের টান", title: "দেশের স্বাদ,", emphasis: "আপনার ঘরে।", description: "খেজুরের গুড় আর দেশি মিষ্টির সংগ্রহ। পরিবারের সঙ্গে ভাগ করে নিন ভালো লাগার মুহূর্ত।", image: "/images/products/khejurer-jhola-gur-jars.jpg", alt: "হালাল সেবার খেজুরের ঝোলা গুড়ের জার", href: "/collections/gur-sweets", action: "গুড় ও মিষ্টি দেখুন", number: "03", caption: "গুড় ও মিষ্টি" },
];

function formatTaka(value: number) {
  return `৳${value.toLocaleString("en-US")}`;
}

export function HeroSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const touch = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (paused || hovered || focused || reduced) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((value) => (value + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, reduced, active]);
  const move = (step: number) => setActive((value) => (value + step + slides.length) % slides.length);
  const {settings, PRODUCTS}=useCatalog();
  const appearance=settings.appearance||{};
  const slide = active===0?{...slides[0],title:String(appearance.hero_title||slides[0].title),image:String(appearance.hero_image||slides[0].image),emphasis:appearance.hero_title?'':slides[0].emphasis}:slides[active];
  // Right promo panel: the wooden roti maker, read from the live catalog so
  // its photo and real price range always match the product as it exists.
  // If the product is ever missing from the catalog the panel hides and
  // the carousel takes the full width — never an empty box.
  const promo = PRODUCTS.find((p) => p.slug === "kather-roti-maker" || p.name.includes("রুটি মেকার"));
  const promoPrices = promo ? (promo.variants && promo.variants.length > 0 ? promo.variants.map((v) => v.price) : [promo.price]) : [];
  const promoMin = promoPrices.length ? Math.min(...promoPrices) : 0;
  const promoMax = promoPrices.length ? Math.max(...promoPrices) : 0;

  return (
    <section className="store-hero-wrap" aria-label="আমাদের সংগ্রহ">
      <div className={`store-hero-grid${promo ? "" : " store-hero-grid--solo"}`}>
        <div className="store-hero" role="region" aria-roledescription="carousel"
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setFocused(false); }}
          onTouchStart={(event) => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
          onTouchEnd={(event) => { if (!touch.current) return; const dx = event.changedTouches[0].clientX - touch.current.x; const dy = event.changedTouches[0].clientY - touch.current.y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? -1 : 1); touch.current = null; }}>
          <img src={slide.image} alt={slide.alt} fetchPriority={active === 0 ? "high" : "auto"} className="store-hero-photo" />
          <div className="store-hero-scrim" aria-hidden="true" />
          <div className="store-hero-copy" key={`copy-${active}`}>
            <p className="store-hero-badge">{slide.label}</p>
            <h1>{slide.title}<br /><em>{slide.emphasis}</em></h1>
            <p className="store-hero-description">{active === 0 ? String(appearance.hero_text||"আপনার পছন্দের মধু বেছে নিন।") : active === 1 ? "প্রতিদিনের রান্নায় ঘি ও তেলের সংগ্রহ।" : "খেজুরের গুড় ও দেশি মিষ্টির সংগ্রহ।"}</p>
            <div className="store-hero-actions">
              <Link href={slide.href} className="store-primary-link">{slide.action}<span aria-hidden="true">↗</span></Link>
            </div>
          </div>
          <button type="button" aria-label="Previous slide" className="store-hero-arrow store-hero-arrow--prev" onClick={() => move(-1)}><ChevronLeftIcon className="h-4 w-4" /></button>
          <button type="button" aria-label="Next slide" className="store-hero-arrow store-hero-arrow--next" onClick={() => move(1)}><ChevronRightIcon className="h-4 w-4" /></button>
          <div className="store-slider-controls">
            <div className="store-slide-dots">{slides.map((item, index) => <button key={item.number} type="button" aria-label={`${item.caption} দেখুন`} aria-pressed={index === active} onClick={() => setActive(index)}><span className={index === active ? "is-active" : ""} /></button>)}</div>
            <span className="store-slide-count">{slide.number}<span> / 03</span></span>
            {!reduced && <button type="button" aria-label={paused ? "Resume slideshow" : "Pause slideshow"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "▶" : "Ⅱ"}</button>}
          </div>
        </div>
        {promo && (
          <aside className="store-hero-promo" aria-label="নতুন পণ্য">
            <Link href={`/products/${promo.slug}`} className="store-hero-promo-link">
              <span className="store-hero-promo-badge">নতুন পণ্য</span>
              <span className="store-hero-promo-photo"><img src={promo.image} alt={promo.name} /></span>
              <span className="store-hero-promo-name">{promo.name}</span>
              <span className="store-hero-promo-price">{promoMin === promoMax ? formatTaka(promoMin) : `${formatTaka(promoMin)} – ${formatTaka(promoMax)}`}</span>
              <span className="store-hero-promo-cta">এখনই দেখুন<span aria-hidden="true"> →</span></span>
            </Link>
          </aside>
        )}
      </div>
      <div className="store-service-strip">
        <div><p><strong>সারা দেশে ডেলিভারি</strong></p></div>
        <div><p><strong>ক্যাশ অন ডেলিভারি</strong></p></div>
        <a href="tel:+8801313946402"><p><strong>কল করুন: 01313-946402</strong></p></a>
      </div>
    </section>
  );
}
