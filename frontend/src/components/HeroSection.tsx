"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";

// Full-bleed video hero carousel. Slide 1 is a real honeybee video:
// real bees moving across a honeycomb in a hive box, steady camera, no
// artificial motion. The video fills the banner edge to edge; the copy
// sits on the left over a deep forest-green gradient that fades to
// transparent toward the center. Slides 2–3 are the photo slides
// recovered from the earlier carousel (ghee, gur). The marquee strip,
// honeycomb band and service strip below the hero are unchanged.
//
// Loop handling: the camera is static, so the comb is identical in the
// first and last frames, but the bees are in different positions — the
// loop WOULD jump visibly. A short dissolve masks it: the video fades
// to the poster frame in the last 0.5s of the clip and back in after the
// loop point, so no black flash ever appears behind the text.
//
// If the video file is missing, the poster shows; if the poster is
// missing too, the animated SVG honeycomb-and-bees scene (v6) shows as
// the fallback — the banner never renders empty or black.
const POSTER = "/images/hero-honey-poster.jpg";
const VIDEO_SRC = "/videos/hero-honey-bees.mp4";
const SLIDE_1_SECONDS_FALLBACK = 6.82;

type VideoSlide = {
  kind: "video";
  headline: string;
  description: string;
  action: string;
  href: string;
  caption: string;
  number: string;
};

type PhotoSlide = {
  kind: "photo";
  label: string;
  title: string;
  emphasis: string;
  description: string;
  image: string;
  alt: string;
  href: string;
  action: string;
  caption: string;
  number: string;
};

type Slide = VideoSlide | PhotoSlide;

const slides: Slide[] = [
  {
    kind: "video",
    headline: "প্রতিদিনের শুরু হোক মধুর স্বাদে।",
    description:
      "সুন্দরবনের চাকের মধু থেকে কালোজিরা ফুলের মধু—আপনার পছন্দের স্বাদ বেছে নিন।",
    action: "মধুর সংগ্রহ দেখুন",
    href: "/collections/honey",
    caption: "মধু",
    number: "01",
  },
  {
    kind: "photo",
    label: "রান্নায় আপন স্বাদ",
    title: "একটুখানি ঘি,",
    emphasis: "অনেকখানি তৃপ্তি।",
    description:
      "গরম ভাত, পোলাও কিংবা ঘরোয়া রান্না—পছন্দের ঘি ও তেলে সাজান প্রতিদিনের খাবার।",
    image: "/images/products/butter-makhon.jpg",
    alt: "হালাল সেবার বাটার ও মাখনের জার",
    href: "/collections/oil-ghee",
    action: "ঘি ও তেল দেখুন",
    caption: "ঘি ও তেল",
    number: "02",
  },
  {
    kind: "photo",
    label: "চেনা স্বাদের টান",
    title: "দেশের স্বাদ,",
    emphasis: "আপনার ঘরে।",
    description:
      "খেজুরের গুড় আর দেশি মিষ্টির সংগ্রহ। পরিবারের সঙ্গে ভাগ করে নিন ভালো লাগার মুহূর্ত।",
    image: "/images/products/khejurer-jhola-gur-jars.jpg",
    alt: "হালাল সেবার খেজুরের ঝোলা গুড়ের জার",
    href: "/collections/gur-sweets",
    action: "গুড় ও মিষ্টি দেখুন",
    caption: "গুড় ও মিষ্টি",
    number: "03",
  },
];

const MARQUEE_TEXT = "১০০% খাঁটি ✦ ক্যাশ অন ডেলিভারি ✦ সারা দেশে ডেলিভারি ✦ ";

// One bee, drawn facing right around local origin (0,0). The wings carry
// the flutter animation (rotation lives on the parent <g> so the CSS
// transform does not override it); stripes are clipped to the body.
// Used only as the fallback visual when both the video and the poster
// are unavailable.
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

function HoneycombScene() {
  return (
    <div
      className="store-hero-visual"
      role="img"
      aria-label="সোনালি মৌচাক ও উড়ন্ত মৌমাছির চিত্র"
    >
      <svg viewBox="0 0 720 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
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
  );
}

export function HeroSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [dissolving, setDissolving] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const move = (step: number) =>
    setActive((value) => (value + step + slides.length) % slides.length);

  // Entering the honey slide: the (keyed) video element mounts fresh at
  // currentTime 0, so returning to the slide always restarts the clip.
  // With reduced motion the poster stays and the visitor starts playback
  // manually with the play button; a paused visitor stays paused.
  useEffect(() => {
    const video = videoRef.current;
    if (active !== 0 || !video) return;
    setVideoReady(false);
    setVideoFailed(false);
    setPosterFailed(false);
    setDissolving(false);
    if (paused || reduced) return;
    const play = video.play();
    if (play) play.catch(() => { /* autoplay blocked: poster stays, play button starts it */ });
  }, [active, reduced]);

  // Auto-advance: slide 1 gets the clip's real duration (read from the
  // video element, falling back to the known 6.82s), so the full clip
  // plays at least once before advancing; resuming mid-clip uses the
  // remaining time. Photo slides keep 6.5s. Hover/focus/pause/reduced
  // motion all stop the timer.
  useEffect(() => {
    if (paused || reduced || hovered || focused) return;
    const video = videoRef.current;
    const total = videoDuration > 0 ? videoDuration : SLIDE_1_SECONDS_FALLBACK;
    const delay =
      active === 0
        ? Math.max(1000, (total - (video ? video.currentTime : 0)) * 1000)
        : 6500;
    const timer = window.setTimeout(() => {
      if (!document.hidden) move(1);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [active, paused, reduced, hovered, focused, videoDuration, videoReady]);

  // Loop dissolve: the bees jump between the last and first frames, so
  // fade the video out to the poster in the last 0.5s of the clip and
  // back in once the loop restarts — never a black frame behind the text.
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration || paused || reduced) return;
    if (!dissolving && video.currentTime >= video.duration - 0.5) {
      setDissolving(true);
    } else if (dissolving && video.currentTime < 0.5) {
      setDissolving(false);
    }
  };

  // One play/pause control: on the honey slide it pauses/plays the video,
  // and in both cases it also stops/resumes automatic slide advancement.
  const togglePlayback = () => {
    const video = videoRef.current;
    if (active === 0 && video) {
      if (paused) {
        setDissolving(false);
        video.play().catch(() => {});
      } else {
        video.pause();
        setDissolving(false);
      }
    }
    setPaused((value) => !value);
  };

  const slide = slides[active];
  const playPauseLabel =
    active === 0
      ? paused
        ? "Play video"
        : "Pause video"
      : paused
        ? "Resume slideshow"
        : "Pause slideshow";

  return (
    <section className="store-hero-unique" aria-label="হালাল সেবা">
      <div className="store-hero-marquee" aria-hidden="true">
        <div className="store-hero-marquee-track">
          <span>{MARQUEE_TEXT.repeat(6)}</span>
          <span>{MARQUEE_TEXT.repeat(6)}</span>
        </div>
      </div>

      <div className="store-hero-wrap">
        <div
          className={`store-hero${active === 0 ? " store-hero--video" : ""}`}
          role="region"
          aria-roledescription="carousel"
          aria-label="আমাদের সংগ্রহ"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setFocused(false);
          }}
          onTouchStart={(event) => {
            touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
          }}
          onTouchEnd={(event) => {
            if (!touch.current) return;
            const dx = event.changedTouches[0].clientX - touch.current.x;
            const dy = event.changedTouches[0].clientY - touch.current.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? -1 : 1);
            touch.current = null;
          }}
        >
          {/* Keyed by slide: the copy fades in once per slide entry, and
              the video element remounts fresh (currentTime 0) whenever the
              visitor returns to the honey slide. */}
          <div key={active} className="store-hero-slide">
            {slide.kind === "video" ? (
              <>
                {videoFailed && posterFailed ? <HoneycombScene /> : null}
                {!posterFailed && (
                  <img
                    src={POSTER}
                    alt=""
                    fetchPriority="high"
                    className="store-hero-poster"
                    onError={() => setPosterFailed(true)}
                  />
                )}
                {!videoFailed && (
                  <video
                    ref={videoRef}
                    className={`store-hero-video${videoReady ? " is-ready" : ""}${
                      dissolving ? " is-dissolving" : ""
                    }`}
                    src={VIDEO_SRC}
                    poster={POSTER}
                    muted
                    autoPlay={!reduced}
                    playsInline
                    preload="metadata"
                    loop
                    aria-hidden="true"
                    onLoadedMetadata={() => {
                      const video = videoRef.current;
                      if (video && video.duration) setVideoDuration(video.duration);
                    }}
                    onLoadedData={() => {
                      setVideoReady(true);
                      const video = videoRef.current;
                      if (video && video.duration) setVideoDuration(video.duration);
                    }}
                    onTimeUpdate={handleTimeUpdate}
                    onError={() => setVideoFailed(true)}
                  />
                )}
                <div className="store-hero-scrim" aria-hidden="true" />
                <div className="store-hero-copy">
                  <h1>{slide.headline}</h1>
                  <p className="store-hero-description">{slide.description}</p>
                  <div className="store-hero-actions">
                    <Link href={slide.href} className="store-primary-link store-hero-gold-btn">
                      {slide.action}
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                <img src={slide.image} alt={slide.alt} className="store-hero-photo" />
                <div className="store-hero-scrim" aria-hidden="true" />
                <div className="store-hero-copy">
                  <p className="store-hero-badge">{slide.label}</p>
                  <h1>
                    {slide.title}
                    <br />
                    <em>{slide.emphasis}</em>
                  </h1>
                  <p className="store-hero-description">{slide.description}</p>
                  <div className="store-hero-actions">
                    <Link href={slide.href} className="store-primary-link">
                      {slide.action}
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label="Previous slide"
            className="store-hero-arrow store-hero-arrow--prev"
            onClick={() => move(-1)}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="store-hero-arrow store-hero-arrow--next"
            onClick={() => move(1)}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>

          <div className="store-slider-controls">
            <div className="store-slide-dots">
              {slides.map((item, index) => (
                <button
                  key={item.number}
                  type="button"
                  aria-label={`${item.caption} দেখুন`}
                  aria-pressed={index === active}
                  onClick={() => setActive(index)}
                >
                  <span className={index === active ? "is-active" : ""} />
                </button>
              ))}
            </div>
            <span className="store-slide-count">
              {slide.number}
              <span> / 03</span>
            </span>
            <button
              type="button"
              aria-label={playPauseLabel}
              aria-pressed={paused}
              onClick={togglePlayback}
            >
              {paused ? "▶" : "Ⅱ"}
            </button>
          </div>
        </div>
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
