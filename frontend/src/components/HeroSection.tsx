"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {useCatalog} from '@/context/CatalogContext';
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";

// Original v1 two-column hero, restored 26 Nov 2026 at the user's
// request ("prothome jemon design cilo") and extended from 3 to 5
// slides, with auto-advance 6500ms -> 4000ms ("slide gula ektu fast").
// Copy left, big photo right, dots + prev/next + pause bottom-left.
// No marquee, no honeycomb band, no badge pill, no trust line.
// Every slide carries a description field; the paragraph renders it
// directly (v1's 3-way ternary would have shown the gur text on
// slides 4-5). Admin appearance overrides apply to slide 1 only.
const slides = [
  { label: "প্রকৃতির মিষ্টি উপহার", title: "প্রতিদিনের শুরু হোক", emphasis: "মধুর স্বাদে।", description: "আপনার পছন্দের মধু বেছে নিন।", image: "/images/products/sundarban-chaker-modhu.jpg", alt: "হালাল সেবার মধুর বোতল", href: "/collections/honey", action: "মধুর সংগ্রহ দেখুন", number: "01", caption: "মধু", tone: "honey" },
  { label: "রান্নায় আপন স্বাদ", title: "একটুখানি ঘি,", emphasis: "অনেকখানি তৃপ্তি।", description: "প্রতিদিনের রান্নায় ঘি ও তেলের সংগ্রহ।", image: "/images/products/gawa-ghee.jpg", alt: "হালাল সেবার গাওয়া ঘি", href: "/collections/oil-ghee", action: "ঘি ও তেল দেখুন", number: "02", caption: "ঘি ও তেল", tone: "ghee" },
  { label: "চেনা স্বাদের টান", title: "দেশের স্বাদ,", emphasis: "আপনার ঘরে।", description: "খেজুরের গুড় ও দেশি মিষ্টির সংগ্রহ।", image: "/images/products/khejurer-gur.jpg", alt: "খেজুরের গুড়", href: "/collections/gur-sweets", action: "গুড় ও মিষ্টি দেখুন", number: "03", caption: "গুড় ও মিষ্টি", tone: "gur" },
  { label: "পুষ্টিকর সংগ্রহ", title: "পুষ্টিতে ভরপুর", emphasis: "বাদাম ও বীজ।", description: "চিয়া সিড, বাদাম আর পুষ্টিকর বীজের সংগ্রহ।", image: "/images/products/chia-seed.jpg", alt: "হালাল সেবার চিয়া সিড", href: "/collections/nuts-seeds", action: "বাদাম ও বীজ দেখুন", number: "04", caption: "বাদাম ও বীজ", tone: "nuts" },
  { label: "রান্নার আসল স্বাদ", title: "রান্নার আসল", emphasis: "স্বাদ মসলায়।", description: "চুইঝাল আর খাঁটি মসলার সংগ্রহ।", image: "/images/products/chui-jhal.jpg", alt: "হালাল সেবার চুইঝাল", href: "/collections/spices", action: "মসলা দেখুন", number: "05", caption: "মসলা", tone: "spices" },
];

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
    }, 4000);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, reduced, active]);
  const move = (step: number) => setActive((value) => (value + step + slides.length) % slides.length);
  const {settings}=useCatalog();
  const appearance=settings.appearance||{};
  const slide = active===0?{...slides[0],title:String(appearance.hero_title||slides[0].title),image:String(appearance.hero_image||slides[0].image),emphasis:appearance.hero_title?'':slides[0].emphasis}:slides[active];

  return (
    <section className="store-hero-wrap" aria-label="আমাদের সংগ্রহ">
      <div className={`store-hero store-hero--${slide.tone}`} role="region" aria-roledescription="carousel"
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setFocused(false); }}
        onTouchStart={(event) => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
        onTouchEnd={(event) => { if (!touch.current) return; const dx = event.changedTouches[0].clientX - touch.current.x; const dy = event.changedTouches[0].clientY - touch.current.y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? -1 : 1); touch.current = null; }}>
        <div className="store-hero-copy" key={`copy-${active}`}>
          <h1>{slide.title}<br /><em>{slide.emphasis}</em></h1>
          <p className="store-hero-description">{active === 0 ? String(appearance.hero_text || slides[0].description) : slide.description}</p>
          <div className="store-hero-actions">
            <Link href={slide.href} className="store-primary-link">{slide.action}<span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className="store-hero-visual" key={`image-${active}`}>
          <img src={slide.image} alt={slide.alt} fetchPriority={active === 0 ? "high" : "auto"} className="store-hero-photo" />
        </div>
        <div className="store-slider-controls">
          <div className="store-slide-dots">{slides.map((item, index) => <button key={item.number} type="button" aria-label={`${item.caption} দেখুন`} aria-pressed={index === active} onClick={() => setActive(index)}><span className={index === active ? "is-active" : ""} /></button>)}</div>
          <button type="button" aria-label="Previous slide" onClick={() => move(-1)}><ChevronLeftIcon className="h-4 w-4" /></button>
          <button type="button" aria-label="Next slide" onClick={() => move(1)}><ChevronRightIcon className="h-4 w-4" /></button>
          {!reduced && <button type="button" aria-label={paused ? "Resume slideshow" : "Pause slideshow"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "▶" : "Ⅱ"}</button>}
        </div>
      </div>
      <div className="store-service-strip">
        <div><p><strong>সারা দেশে ডেলিভারি</strong></p></div>
        <div><p><strong>ক্যাশ অন ডেলিভারি</strong></p></div>
        <a href="tel:+8801313946402"><p><strong>কল করুন: 01313-946402</strong></p></a>
      </div>
    </section>
  );
}
