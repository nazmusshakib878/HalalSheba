"use client";

import Link from "next/link";
import { useCatalog } from "@/context/CatalogContext";

// Unique centred hero (inspired by guur's mechanisms only — never its copy,
// products, photos or artwork). One idea per screenful, centre-aligned on
// warm cream: a scrolling claim marquee, one GIANT headline, one animated
// honeycomb-and-bees illustration (pure inline SVG + CSS, NO photo — the
// user asked for a মৌচাক with flying মৌমাছি instead of honey bottles),
// quiet category pills, one trust line, ONE CTA, and a honeycomb band
// closing the hero. No carousel, no split layout, no full-bleed photo,
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

// One bee, drawn facing right around local origin (0,0). The wings carry
// the flutter animation (rotation lives on the parent <g> so the CSS
// transform does not override it); stripes are clipped to the body.
function BeeArt() {
  return (
    <>
      <g transform="rotate(-48 -3 -8)">
        <ellipse className="bee-wing" cx="-3" cy="-8" rx="6" ry="3.4" fill="#fff" opacity=".5" />
      </g>
      <g transform="rotate(-24 2 -8)">
        <ellipse className="bee-wing" cx="2" cy="-8" rx="7" ry="4" fill="#fff" opacity=".62" />
      </g>
      <ellipse cx="0" cy="0" rx="10" ry="6.5" fill="#f2b705" stroke="#b9822e" strokeWidth=".75" />
      <g clipPath="url(#heroBeeClip)">
        <rect x="1.5" y="-7" width="3" height="14" fill="#3a2313" />
        <rect x="6.5" y="-7" width="3" height="14" fill="#3a2313" />
      </g>
      <path d="M-10 0 L-14.5 -2.2 L-14.5 2.2 Z" fill="#3a2313" />
      <circle cx="10" cy="-1" r="3.2" fill="#3a2313" />
      <path d="M10 -4 Q 12 -8 15 -8.5" fill="none" stroke="#3a2313" strokeWidth="1" strokeLinecap="round" />
      <circle cx="11" cy="-2" r=".9" fill="#fff" />
    </>
  );
}

// Honeycomb cells: pointy-top hexagon (s = 34), rows staggered by half a
// cell. Centres: row 1 y=66 (4 cells), row 2 y=117 (5), row 3 y=168 (4),
// row 4 y=219 (3). Fills vary between the honey gradient, light honey,
// deep amber and empty cream — like a real comb.
const COMB_CELLS: Array<[number, number, string]> = [
  [272, 66, "#fbe7ae"],
  [331, 66, "url(#heroHoney)"],
  [390, 66, "url(#heroHoney)"],
  [449, 66, "#dd9317"],
  [243, 117, "url(#heroHoney)"],
  [302, 117, "#fdf6e3"],
  [361, 117, "url(#heroHoney)"],
  [420, 117, "#fbe7ae"],
  [479, 117, "url(#heroHoney)"],
  [272, 168, "#dd9317"],
  [331, 168, "url(#heroHoney)"],
  [390, 168, "#fbe7ae"],
  [449, 168, "url(#heroHoney)"],
  [302, 219, "url(#heroHoney)"],
  [361, 219, "url(#heroHoney)"],
  [420, 219, "#fdf6e3"],
];

export function HeroSection() {
  const { settings } = useCatalog();
  const appearance = settings.appearance || {};
  // Admin appearance overrides, same source as before (/api/catalog settings).
  // hero_title replaces the whole headline (single line); hero_text replaces
  // the trust line. hero_image NO LONGER applies — there is no photo in the
  // hero any more, the visual is the honeycomb-and-bees illustration, so an
  // admin hero_image has nothing to replace. When unset (the live API
  // currently carries no appearance object) the static content below shows.
  const hasTitleOverride = Boolean(appearance.hero_title);
  const headline = String(appearance.hero_title || "ভালোবাসার স্বাদ,");
  const headlineEmphasis = hasTitleOverride ? "" : "খাঁটি মধু।";
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

        <div
          className="store-hero-visual store-hero-scene"
          role="img"
          aria-label="সোনালি মৌচাক ও উড়ন্ত মৌমাছির চিত্র"
        >
          <svg viewBox="0 0 720 340" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="heroHoney" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f9d976" />
                <stop offset=".55" stopColor="#e9a319" />
                <stop offset="1" stopColor="#cf7f0e" />
              </linearGradient>
              <polygon
                id="heroHex"
                points="0,-34 29.4,-17 29.4,17 0,34 -29.4,17 -29.4,-17"
              />
              <clipPath id="heroBeeClip">
                <ellipse cx="0" cy="0" rx="10" ry="6.5" />
              </clipPath>
            </defs>

            {/* Scattered mini hexagons for depth */}
            <g fill="#d5a33d" opacity=".28">
              <use href="#heroHex" transform="translate(92 92) scale(.28)" />
              <use href="#heroHex" transform="translate(636 208) scale(.22)" />
              <use href="#heroHex" transform="translate(600 306) scale(.3)" />
              <use href="#heroHex" transform="translate(120 300) scale(.2)" />
            </g>

            {/* Dotted flight trail for the bee crossing low */}
            <path
              d="M28 252 C 160 216, 300 268, 430 240 S 600 238, 672 254"
              fill="none"
              stroke="#d5a33d"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="0.1 9"
              opacity=".38"
            />

            {/* Honeycomb cluster */}
            <g stroke="#b98a2e" strokeWidth="2" strokeLinejoin="round">
              {COMB_CELLS.map(([cx, cy, fill], i) => (
                <use key={i} href="#heroHex" transform={`translate(${cx} ${cy})`} fill={fill} />
              ))}
            </g>

            {/* Glossy highlights on a few full cells */}
            <g fill="#fff" opacity=".3">
              <ellipse cx="322" cy="52" rx="7" ry="4" transform="rotate(-25 322 52)" />
              <ellipse cx="352" cy="103" rx="7" ry="4" transform="rotate(-25 352 103)" />
              <ellipse cx="411" cy="204" rx="6" ry="3.5" transform="rotate(-25 411 204)" />
            </g>

            {/* Slow honey drip from the bottom-centre cell */}
            <path
              className="drip-strand"
              d="M361 250 C 357 262, 355 272, 357 282 C 359 289, 363 289, 365 282 C 367 272, 365 262, 361 250 Z"
              fill="url(#heroHoney)"
            />
            <circle className="drip-drop" cx="361" cy="290" r="4.5" fill="url(#heroHoney)" />

            {/* Bee 1 — hovering loop near the comb, top right */}
            <g transform="translate(520 80)">
              <g className="bee-path bee-path-loop-a">
                <g className="bee-bob">
                  <BeeArt />
                </g>
              </g>
            </g>

            {/* Bee 2 — crosses left to right, low, along the dotted trail */}
            <g transform="translate(30 250)">
              <g className="bee-path bee-path-cross-r">
                <g className="bee-bob">
                  <BeeArt />
                </g>
              </g>
            </g>

            {/* Bee 3 — crosses right to left, high (mirrored to face left) */}
            <g transform="translate(690 70)">
              <g className="bee-path bee-path-cross-l">
                <g className="bee-flip">
                  <g className="bee-bob">
                    <BeeArt />
                  </g>
                </g>
              </g>
            </g>

            {/* Bee 4 — small loop, bottom left of the comb */}
            <g transform="translate(170 265)">
              <g className="bee-path bee-path-loop-b">
                <g className="bee-bob">
                  <BeeArt />
                </g>
              </g>
            </g>
          </svg>
        </div>

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
