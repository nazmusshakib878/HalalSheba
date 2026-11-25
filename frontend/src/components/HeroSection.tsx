"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCatalog } from "@/context/CatalogContext";

// Simple centred hero carousel (v8): the v5 shell kept exactly — marquee
// strip on top, trust line, honeycomb band and service strip below — with
// the hero body as a 3-slide carousel. Each slide is one idea,
// centre-aligned on warm cream: a small badge pill, a giant 2-line
// headline, one short description, one photo in the v5 frame, one CTA.
// Category pills are dropped to keep it clean. No video, no cartoon
// bees, no dark full-bleed background, no split layout, no extra
// decoration. Auto-advance ~6s, dots + prev/next arrows, pause on hover,
// reduced-motion stops autoplay (slide 1 shown statically, manual
// navigation still works). All slides share one grid cell so the banner
// height never shifts when slides change.
const MARQUEE_TEXT = "১০০% খাঁটি ✦ ক্যাশ অন ডেলিভারি ✦ সারা দেশে ডেলিভারি ✦ ";
const AUTO_ADVANCE_MS = 6000;

type Slide = {
  badge: string;
  title: string;
  emphasis: string;
  description: string;
  image: string;
  alt: string;
  href: string;
  action: string;
};

const SLIDES: Slide[] = [
  {
    badge: "মধু",
    title: "ভালোবাসার স্বাদ,",
    emphasis: "খাঁটি মধু।",
    description:
      "সুন্দরবনের চাকের মধু থেকে কালোজিরা ফুলের মধু—আপনার পছন্দের স্বাদ বেছে নিন।",
    image: "/images/banners/hero-honey.jpg",
    alt: "হালাল সেবার পাঁচ রকমের মধুর বোতল",
    href: "/collections/honey",
    action: "মধুর সংগ্রহ দেখুন",
  },
  {
    badge: "ঘি ও তেল",
    title: "একটুখানি ঘি,",
    emphasis: "অনেকখানি তৃপ্তি।",
    description:
      "গরম ভাত, পোলাও কিংবা ঘরোয়া রান্না—পছন্দের ঘি ও তেলে সাজান প্রতিদিনের খাবার।",
    image: "/images/products/butter-makhon.jpg",
    alt: "হালাল সেবার বাটার ও মাখনের জার",
    href: "/collections/oil-ghee",
    action: "ঘি ও তেল দেখুন",
  },
  {
    badge: "গুড় ও মিষ্টি",
    title: "দেশের স্বাদ,",
    emphasis: "আপনার ঘরে।",
    description:
      "খেজুরের গুড় আর দেশি মিষ্টির সংগ্রহ। পরিবারের সঙ্গে ভাগ করে নিন ভালো লাগার মুহূর্ত।",
    image: "/images/products/khejurer-jhola-gur-jars.jpg",
    alt: "হালাল সেবার খেজুরের ঝোলা গুড়ের জার",
    href: "/collections/gur-sweets",
    action: "গুড় ও মিষ্টি দেখুন",
  },
];

export function HeroSection() {
  const { settings } = useCatalog();
  const appearance = settings.appearance || {};
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, index]);

  // Admin appearance overrides, same source as v5 (/api/catalog settings).
  // They apply to slide 1 only: hero_title replaces its headline (single
  // line); hero_image replaces its photo; hero_text replaces the trust
  // line. When unset (the live API currently carries no appearance
  // object) the static content below shows.
  const hasTitleOverride = Boolean(appearance.hero_title);
  const slides: Slide[] = [
    {
      ...SLIDES[0],
      title: String(appearance.hero_title || SLIDES[0].title),
      emphasis: hasTitleOverride ? "" : SLIDES[0].emphasis,
      image: String(appearance.hero_image || SLIDES[0].image),
    },
    SLIDES[1],
    SLIDES[2],
  ];
  const trustLine = String(
    appearance.hero_text || "১০০% খাঁটি • ক্যাশ অন ডেলিভারি • সারা দেশে ডেলিভারি",
  );

  const goTo = (i: number) =>
    setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);

  return (
    <section
      className="store-hero-unique"
      aria-label="হালাল সেবা"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="store-hero-marquee" aria-hidden="true">
        <div className="store-hero-marquee-track">
          <span>{MARQUEE_TEXT.repeat(6)}</span>
          <span>{MARQUEE_TEXT.repeat(6)}</span>
        </div>
      </div>

      <div className="store-hero-unique-inner">
        <div className="store-hero-slides">
          {slides.map((slide, i) => (
            <div
              key={slide.href}
              className={
                "store-hero-slide" + (i === index ? " is-active" : "")
              }
              aria-hidden={i !== index}
            >
              <p className="store-hero-badge">{slide.badge}</p>

              <h1>
                {slide.title}
                {slide.emphasis ? (
                  <>
                    <br />
                    <em>{slide.emphasis}</em>
                  </>
                ) : null}
              </h1>

              <p className="store-hero-desc">{slide.description}</p>

              <figure className="store-hero-visual">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  fetchPriority={i === 0 ? "high" : undefined}
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </figure>

              <Link href={slide.href} className="store-hero-cta">
                {slide.action} <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </div>

        <div className="store-hero-controls">
          <button
            type="button"
            className="store-hero-arrow"
            aria-label="আগের স্লাইড"
            onClick={() => goTo(index - 1)}
          >
            ‹
          </button>
          <div className="store-hero-dots" aria-label="স্লাইড বেছে নিন">
            {slides.map((slide, i) => (
              <button
                key={slide.href}
                type="button"
                className={
                  "store-hero-dot" + (i === index ? " is-active" : "")
                }
                aria-label={`স্লাইড ${i + 1}: ${slide.badge}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="store-hero-arrow"
            aria-label="পরের স্লাইড"
            onClick={() => goTo(index + 1)}
          >
            ›
          </button>
        </div>

        <p className="store-hero-trust">{trustLine}</p>
      </div>

      <div className="store-hero-band" aria-hidden="true" />

      <div className="store-hero-strip-wrap">
        <div className="store-service-strip">
          <div>
            <p>
              <strong>সারা দেশে ডেলিভারি</strong>
            </p>
          </div>
          <div>
            <p>
              <strong>ক্যাশ অন ডেলিভারি</strong>
            </p>
          </div>
          <a href="tel:+8801313946402">
            <p>
              <strong>কল করুন: 01313-946402</strong>
            </p>
          </a>
        </div>
      </div>
    </section>
  );
}
