"use client";

import Link from "next/link";
import { useCatalog } from "@/context/CatalogContext";

// Unique centred hero (inspired by guur's mechanisms only — never its copy,
// products, photos or artwork). One idea per screenful, centre-aligned on
// warm cream: a scrolling claim marquee, one GIANT headline, one featured
// photo, quiet category pills, one trust line, ONE CTA, and a honeycomb
// band closing the hero. No carousel, no split layout, no full-bleed photo,
// no promo panel — the roti maker keeps its own "নতুন পণ্য" section below
// on the homepage (rendered separately in page.tsx, untouched here).
const MARQUEE_TEXT = "১০০% খাঁটি ✦ ক্যাশ অন ডেলিভারি ✦ সারা দেশে ডেলিভারি ✦ ";

const CATEGORY_PILLS = [
  { label: "মধু", href: "/collections/honey" },
  // "oil-ghee" is the combined collection route (oil OR ghee) — verified
  // in collections/[slug]/page.tsx, so it matches the "ঘি ও তেল" label.
  { label: "ঘি ও তেল", href: "/collections/oil-ghee" },
  { label: "গুড় ও মিষ্টি", href: "/collections/gur-sweets" },
];

export function HeroSection() {
  const { settings } = useCatalog();
  const appearance = settings.appearance || {};
  // Admin appearance overrides, same source as before (/api/catalog settings).
  // hero_title replaces the whole headline (single line); hero_text replaces
  // the trust line; hero_image replaces the featured visual. When unset
  // (the live API currently carries no appearance object) the static
  // content below shows.
  const hasTitleOverride = Boolean(appearance.hero_title);
  const headline = String(appearance.hero_title || "ভালোবাসার স্বাদ,");
  const headlineEmphasis = hasTitleOverride ? "" : "খাঁটি মধু।";
  const image = String(appearance.hero_image || "/images/banners/hero-honey.jpg");
  const trustLine = String(
    appearance.hero_text || "১০০% খাঁটি • ক্যাশ অন ডেলিভারি • সারা দেশে ডেলিভারি",
  );

  return (
    <section className="store-hero-unique" aria-label="হালাল সেবা">
      <div className="store-hero-marquee" aria-hidden="true">
        <div className="store-hero-marquee-track">
          <span>{MARQUEE_TEXT.repeat(6)}</span>
          <span>{MARQUEE_TEXT.repeat(6)}</span>
        </div>
      </div>

      <div className="store-hero-unique-inner">
        <h1>
          {headline}
          {headlineEmphasis ? (
            <>
              <br />
              <em>{headlineEmphasis}</em>
            </>
          ) : null}
        </h1>

        <figure className="store-hero-visual">
          <img src={image} alt="হালাল সেবার পাঁচ রকমের মধুর বোতল" fetchPriority="high" />
        </figure>

        <nav className="store-hero-pills" aria-label="জনপ্রিয় সংগ্রহ">
          {CATEGORY_PILLS.map((pill) => (
            <Link key={pill.href} href={pill.href}>
              {pill.label}
            </Link>
          ))}
        </nav>

        <p className="store-hero-trust">{trustLine}</p>

        <Link href="/collections/all-products" className="store-hero-cta">
          সব পণ্য দেখুন <span aria-hidden="true">→</span>
        </Link>
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
