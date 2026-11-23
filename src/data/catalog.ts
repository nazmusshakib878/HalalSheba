export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  subcategories: string[];
}

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  highlight?: boolean;
  subcategories?: { label: string; href: string }[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  image: string;
  tagline: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  image: string;
  href: string;
  badge?: string;
  subtitle?: string;
  priceTag?: string;
  primaryBtnText?: string;
  chips?: string[];
  theme?: "honey" | "gur" | "ghee";
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  quote: string;
  avatarSrc: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  regularPrice?: number;
  image: string;
  gallery?: string[];
  category: string;
  categorySlug: string;
  subcategory?: string;
  brand: string;
  weight?: string;
  badgeLeft?: "Best Selling" | "New Arrival" | "Offered Items";
  saveText?: string;
  isTopSelling?: boolean;
  inStock: boolean;
  sections: (
    | "top-selling"
    | "natural-honey"
    | "premium-dates"
    | "cooking-essentials"
    | "organic-food"
    | "just-for-you"
  )[];
  shortDescription: string;
  descriptionSections?: { heading: string; paragraphs: string[] }[];
  highlights: string[];
  origin: string;
}

export const SITE_ASSETS = {
  logo: "/images/halal-sheba-logo.png",
  paymentGateway: "/images/badges/payment-methods.svg",
  googlePlayBadge: "/images/badges/google-play.svg",
  appStoreBadge: "/images/badges/app-store.svg",
  rightPromoBanner: {
    image: "/images/banners/promo-side.jpg",
    alt: "স্পেশাল কম্বো অফার",
    href: "/collections/oil-ghee",
  },
  midPromoBanner: {
    image: "/images/banners/promo-mid.jpg",
    alt: "ঐতিহ্যবাহী মিষ্টান্ন ও মিষ্টির ছানা",
    href: "/collections/gur-sweets",
  },
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    badge: "১০০% খাঁটি ও প্রাকৃতিক মধু",
    title: "সুন্দরবনের প্রাকৃতিক চাকের মধু",
    subtitle: "সরাসরি মৌচাক থেকে সংগৃহীত কাঁচা মধু — ল্যাব টেস্টে ১০০% খাঁটি প্রমাণিত। কোনো কেমিক্যাল বা প্রিজারভেটিভ নেই।",
    priceTag: "শুরু মাত্র ৳৫০০ থেকে",
    primaryBtnText: "মধু অর্ডার করুন",
    chips: ["১০০% প্রাকৃতিক", "ল্যাব সার্টিফাইড", "ক্যাশ অন ডেলিভারি"],
    theme: "honey",
    image: "/images/banners/hero-honey.jpg",
    href: "/collections/honey",
  },
  {
    id: "slide-2",
    badge: "যশোরের ঐতিহ্যবাহী গুড়",
    title: "খেজুরের খাঁটি পাটালি ও বীজগুড়",
    subtitle: "গাছিদের নিপুণ হাতে তৈরি শতভাগ খাঁটি খেজুরের পাটালি, দানা পাটালি এবং স্পেশাল প্যারা সন্দেশ।",
    priceTag: "শুরু মাত্র ৳৩৯০ থেকে",
    primaryBtnText: "গুড় ও মিষ্টি দেখুন",
    chips: ["শতভাগ খাঁটি রস", "চিনির ভেজালমুক্ত", "ঐতিহ্যবাহী স্বাদ"],
    theme: "gur",
    image: "/images/banners/hero-gur.jpg",
    href: "/collections/gur-sweets",
  },
  {
    id: "slide-3",
    badge: "খাঁটি ও স্বাস্থ্যকর খাদ্য",
    title: "বাঘাবাড়ির খাঁটি গাওয়া ঘি ও ঘানির তেল",
    subtitle: "দুধের সর থেকে তৈরি সুস্বাদু গাওয়া ঘি, প্রিমিয়াম মাখন এবং কাঠের ঘানিতে ভাঙানো সরিষার তেল।",
    priceTag: "শুরু মাত্র ৳১,৫০০ থেকে",
    primaryBtnText: "ঘি ও তেল কিনুন",
    chips: ["খাঁটি দুধের মাখন", "কাঠের ঘানির তেল", "অতুলনীয় সুবাস"],
    theme: "ghee",
    image: "/images/banners/hero-ghee.jpg",
    href: "/collections/oil-ghee",
  },
];

export const CATEGORIES: Category[] = [
  {
    id: "cat-honey",
    name: "খাঁটি মধু",
    slug: "honey",
    image: "/images/products/sundarban-chaker-modhu.jpg",
    subcategories: [
      "সুন্দরবনের চাকের মধু",
      "চাক সহ মধু",
      "সুন্দরবনের মিক্স মধু",
      "কালোজিরা মধু",
      "সরিষা মধু",
      "লিচু মধু",
      "বরই মধু",
      "ক্রিম হানি",
    ],
  },
  {
    id: "cat-oil-ghee",
    name: "তেল ও ঘি",
    slug: "oil-ghee",
    image: "/images/products/sorishar-tel.jpg",
    subcategories: [
      "সরিষার তেল",
      "গাওয়া ঘি",
      "বাটার/মাখন",
      "নারিকেল তেল",
      "কালোজিরা তেল",
    ],
  },
  {
    id: "cat-gur-sweets",
    name: "গুড় ও মিষ্টান্ন",
    slug: "gur-sweets",
    image: "/images/products/khejurer-gur.jpg",
    subcategories: [
      "খেজুরের পাটালি গুড়",
      "খেজুরের বীজগুড়",
      "খেজুরের ঝোলা গুড়",
      "খাঁটি আখের গুড়",
      "দেশি আখের লাল চিনি",
      "তাল মিছরি",
      "প্যারা সন্দেশ",
      "মিষ্টির ছানা",
      "ঢেঁকি ছাঁটা চালের গুঁড়া",
    ],
  },
  {
    id: "cat-spices-seeds",
    name: "মসলা ও বীজ",
    slug: "spices-seeds",
    image: "/images/products/chui-jhal.jpg",
    subcategories: [
      "সাতক্ষীরার চুইঝাল",
      "শরবত সিড মিক্সার",
      "ড্রাই ফুড ও বাদাম",
      "অর্গানিক বিটরুট গুঁড়া",
      "চিয়া সিড",
      "কুমড়া বড়ি",
      "কালোজিরা",
      "তাল মিছরি",
    ],
  },
  {
    id: "cat-organic-food",
    name: "অর্গানিক ও মৌসুমি ফল",
    slug: "organic-food",
    image: "/images/products/satkhira-aam.jpg",
    subcategories: [
      "সাতক্ষীরার তাজা আম",
      "ত্বীন ফল",
      "ড্রাই ফুড ও বাদাম",
      "কুমড়া বড়ি",
      "আখের চিনি ও সিড মিক্সার",
    ],
  },
];

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "All Products", href: "/collections/all-products" },
  {
    label: "খাঁটি মধু",
    href: "/collections/honey",
    subcategories: [
      { label: "সুন্দরবনের চাকের মধু", href: "/products/sundarban-chaker-modhu" },
      { label: "সুন্দরবনের চাক সহ মধু", href: "/products/chak-shoho-modhu" },
      { label: "সুন্দরবনের মিক্স মধু", href: "/products/sundarban-mix-modhu" },
      { label: "গ্রাম্য মিক্স মধু", href: "/products/gramyo-mix-modhu" },
      { label: "কালোজিরা মধু", href: "/products/kalojira-modhu" },
      { label: "সরিষা মধু", href: "/products/sorisha-modhu" },
      { label: "লিচু মধু", href: "/products/lichu-modhu" },
      { label: "বরই মধু", href: "/products/boroi-modhu" },
      { label: "ক্রিম হানি", href: "/products/cream-honey" },
    ],
  },
  {
    label: "তেল ও ঘি",
    href: "/collections/oil-ghee",
    subcategories: [
      { label: "গাওয়া ঘি", href: "/products/gawa-ghee" },
      { label: "বাটার-মাখন", href: "/products/butter-makhon" },
      { label: "সরিষার তেল (১ লিটার)", href: "/products/sorishar-tel" },
      { label: "সরিষার তেল (৫ কেজি)", href: "/products/sorishar-tel-5-liter" },
      { label: "নারিকেল তেল", href: "/products/narikel-tel" },
      { label: "কালোজিরা তেল", href: "/products/kalojira-tel" },
    ],
  },
  {
    label: "গুড় ও মিষ্টান্ন",
    href: "/collections/gur-sweets",
    subcategories: [
      { label: "খেজুরের গুড়", href: "/products/khejurer-gur" },
      { label: "খেজুরের বীজগুড়", href: "/products/khejurer-beej-gur" },
      { label: "খেজুরের ঝোলা গুড়", href: "/products/khejurer-jhola-gur" },
      { label: "খাঁটি আখের গুড়", href: "/products/akher-gur" },
      { label: "দেশি আখের লাল চিনি", href: "/products/akher-lal-chini" },
      { label: "তাল মিছরি", href: "/products/tal-michri" },
      { label: "প্যারা সন্দেশ", href: "/products/pera-sandesh" },
      { label: "মিষ্টির ছানা", href: "/products/mishtir-chhana" },
      { label: "ঢেঁকি ছাঁটা চালের গুঁড়া", href: "/products/dheki-chhata-chaler-gura" },
    ],
  },
  {
    label: "মসলা ও বীজ",
    href: "/collections/spices-seeds",
    subcategories: [
      { label: "সাতক্ষীরার চুইঝাল", href: "/products/chui-jhal" },
      { label: "শরবত সিড মিক্সার", href: "/products/sharbat-seed-mixer" },
      { label: "ড্রাই ফুড ও বাদাম", href: "/products/dry-food-mix" },
      { label: "অর্গানিক বিটরুট গুঁড়া", href: "/products/beetroot-powder" },
      { label: "অর্গানিক চিয়া সিড", href: "/products/chia-seed" },
      { label: "চালকুমড়া বড়ি", href: "/products/kumra-bori" },
    ],
  },
  {
    label: "অর্গানিক ও ফল",
    href: "/collections/organic-food",
    subcategories: [
      { label: "সাতক্ষীরার তাজা আম", href: "/products/satkhira-aam" },
      { label: "প্রিমিয়াম ত্বীন ফল", href: "/products/twin-fol" },
      { label: "ড্রাই ফুড ও বাদাম", href: "/products/dry-food-mix" },
      { label: "আখের চিনি ও সিড মিক্সার", href: "/products/akher-chini-seed-mixer" },
      { label: "ঐতিহ্যবাহী চালকুমড়া বড়ি", href: "/products/kumra-bori" },
    ],
  },
  { label: "আমাদের সম্পর্কে", href: "/page/about-us" },
  { label: "যোগাযোগ", href: "/page/contact-us" },
];

export const BRANDS: Brand[] = [
  {
    id: "brand-halalsheba",
    name: "Halal Sheba",
    slug: "halalsheba",
    image: "/images/halal-sheba-logo.png",
    tagline: "হালাল ও খাঁটি পণ্যের এক বিশ্বস্ত প্রতিষ্ঠান",
  },
  {
    id: "brand-sundarban",
    name: "Sundarban Naturals",
    slug: "sundarban",
    image: "/images/products/sundarban-chaker-modhu.jpg",
    tagline: "সুন্দরবনের শতভাগ প্রাকৃতিক চাকের মধু",
  },
  {
    id: "brand-satkhira",
    name: "Satkhira Agro",
    slug: "satkhira-agro",
    image: "/images/products/chui-jhal.jpg",
    tagline: "সাতক্ষীরার খাঁটি চুইঝাল ও খেজুরের গুড়",
  },
  {
    id: "brand-baghabari",
    name: "Baghabari Dairy",
    slug: "baghabari",
    image: "/images/products/gawa-ghee.jpg",
    tagline: "ঐতিহ্যবাহী গাওয়া ঘি ও খাঁটি বাটার",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    name: "আব্দুল্লাহ আল মামুন",
    role: "ব্যবসায়ী, ঢাকা",
    rating: 5,
    quote:
      "হালাল সেবা থেকে সুন্দরবনের চাকের মধু আর গাওয়া ঘি নিয়েছিলাম। মাশাআল্লাহ পণ্যের মান অসাধারণ এবং সম্পূর্ণ নির্ভেজাল। ডেলিভারিও খুব দ্রুত পেয়েছি।",
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "t-2",
    name: "ফারহানা সুলতানা",
    role: "গৃহিণী, খুলনা",
    rating: 5,
    quote:
      "খেজুরের বীজগুড় আর প্যারা সন্দেশ খুবই সুস্বাদু ছিল। পরিবারের সবাই খুব পছন্দ করেছে। হালাল সেবার সততা বজায় থাকুক এই দোয়া করি।",
    avatarSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "t-3",
    name: "মোহাম্মদ রফিকুল ইসলাম",
    role: "শিক্ষক, রাজশাহী",
    rating: 5,
    quote:
      "ঘানি ভাঙা খাঁটি সরিষার তেল ও কালোজিরা তেলের ঝাঁঝ এবং ঘ্রাণে স্পষ্ট বোঝা যায় এটি নির্ভেজাল। এখন থেকে সব প্রাকৃতিক পণ্য এখান থেকেই নিব।",
    avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    slug: "sundarban-chaker-modhu",
    name: "সুন্দরবনের চাকের মধু",
    price: 1800,
    regularPrice: 1950,
    weight: "১ কেজি",
    image: "/images/products/sundarban-chaker-modhu.jpg",
    gallery: [
      "/images/products/sundarban-chaker-modhu.jpg",
      "/images/products/chak-shoho-modhu.jpg",
      "/images/products/sundarban-mix-modhu.jpg",
    ],
    category: "Natural Honey",
    categorySlug: "honey",
    subcategory: "সুন্দরবনের চাকের মধু",
    brand: "Halal Sheba",
    badgeLeft: "Best Selling",
    saveText: "৳১৫০ ছাড়",
    isTopSelling: true,
    inStock: true,
    sections: ["top-selling", "natural-honey", "just-for-you"],
    shortDescription: "সুন্দরবনের বিভিন্ন ফুলের নির্যাস থেকে সংগ্রহ করা প্রাকৃতিক RAW মধু। ফুল ও ভৌগোলিক বৈশিষ্ট্যভেদে এর রং, ঘ্রাণ ও স্বাদে কিছুটা ভিন্নতা থাকতে পারে।",
    highlights: [
      "১০০% প্রাকৃতিক সুন্দরবনের চাকের অপরিশোধিত মধু",
      "কোনো প্রকার কেমিক্যাল বা কৃত্রিম চিনি মুক্ত",
      "প্রাকৃতিক রোগ প্রতিরোধ ক্ষমতা বাড়াতে দারুণ কার্যকরী",
      "সাতক্ষীরা সুন্দরবন সংলগ্ন অঞ্চল থেকে সংগৃহীত",
    ],
    origin: "সুন্দরবন, সাতক্ষীরা",
  },
  {
    id: 2,
    slug: "sundarban-mix-modhu",
    name: "সুন্দরবনের মিক্স মধু",
    price: 1000,
    regularPrice: 1100,
    weight: "১ কেজি",
    image: "/images/products/sundarban-mix-modhu.jpg",
    gallery: [
      "/images/products/sundarban-mix-modhu.jpg",
    ],
    category: "Natural Honey",
    categorySlug: "honey",
    subcategory: "সুন্দরবনের মিক্স মধু",
    brand: "Halal Sheba",
    saveText: "৳১০০ ছাড়",
    inStock: true,
    sections: ["natural-honey", "just-for-you"],
    shortDescription: "সুন্দরবনের বিভিন্ন ফুলের নির্যাস থেকে সংগ্রহ করা প্রাকৃতিক RAW মধু। ফুল ও ভৌগোলিক বৈশিষ্ট্যভেদে এর রং, ঘ্রাণ ও স্বাদে কিছুটা ভিন্নতা থাকতে পারে।",
    highlights: [
      "সুন্দরবনের খলসী, গেওয়া, বাইনসহ বিভিন্ন বুনো ফুলের মধু",
      "প্রাকৃতিক হালকা ঘ্রাণ ও অতুলনীয় স্বাদ",
      "প্রাকৃতিক অ্যান্টিঅক্সিডেন্টে ভরপুর",
    ],
    origin: "সুন্দরবন",
  },
  {
    id: 3,
    slug: "gramyo-mix-modhu",
    name: "গ্রাম্য মিক্স মধু",
    price: 1000,
    regularPrice: 1100,
    weight: "১ কেজি",
    image: "/images/products/gramyo-mix-modhu.jpg",
    gallery: [
      "/images/products/gramyo-mix-modhu.jpg",
    ],
    category: "Natural Honey",
    categorySlug: "honey",
    subcategory: "গ্রাম্য মিক্স মধু",
    brand: "Halal Sheba",
    saveText: "৳১০০ ছাড়",
    inStock: true,
    sections: ["natural-honey", "just-for-you"],
    shortDescription: "গ্রামবাংলার বিভিন্ন বুনো ফুল ও মৌসুমি ফলের মুকুল থেকে সংগৃহীত খাঁটি দেশি মিক্স মধু।",
    highlights: [
      "প্রাকৃতিক গ্রাম্য পরিবেশ থেকে সংগৃহীত",
      "প্রাকৃতিক পুষ্টিগুণ সমৃদ্ধ ও সুস্বাদু",
      "দৈনন্দিন স্বাস্থ্য সুরক্ষায় উপযোগী",
    ],
    origin: "গ্রামীন প্রাকৃতিক অঞ্চল",
  },
  {
    id: 4,
    slug: "kalojira-modhu",
    name: "কালোজিরা ফুলের মধু",
    price: 1200,
    regularPrice: 1350,
    weight: "১ কেজি",
    image: "/images/products/kalojira-modhu.jpg",
    gallery: [
      "/images/products/kalojira-modhu.jpg",
      "/images/products/kalojira-modhu-bottle.jpg",
    ],
    category: "Natural Honey",
    categorySlug: "honey",
    subcategory: "কালোজিরা মধু",
    brand: "Halal Sheba",
    badgeLeft: "Best Selling",
    saveText: "৳১৫০ ছাড়",
    isTopSelling: true,
    inStock: true,
    sections: ["top-selling", "natural-honey", "just-for-you"],
    shortDescription: "কালোজিরা ফুলের মধু ফেব্রুয়ারি ও মার্চ মাসে সংগ্রহ করা হয়ে থাকে। সংগ্রহের স্থান: ফরিদপুর, মাদারীপুর ও শরীয়তপুর।",
    highlights: [
      "দেখতে সাধারণত লালচে থেকে কালচে রঙের হয়ে থাকে।",
      "স্বাদে অনেকটা খেজুরের গুড়ের মতো অনুভূতি পাওয়া যায়।",
      "ঘ্রাণেও খেজুরের গুড়ের মতো স্বতন্ত্র সুবাস থাকতে পারে।",
      "মধুর ঘনত্ব কম-বেশি হতে পারে।",
      "পাতলা হলে ঝাঁকানোর সময় ফেনা দেখা যেতে পারে।",
      "সাধারণত কালোজিরা ফুলের মধু সহজে জমাট বাঁধে না।",
      "ধনিয়া ফুলসহ অন্য ফুলের নির্যাস মিশ্রিত থাকলে সামান্য জমাট বাঁধতে পারে।",
    ],
    origin: "ফরিদপুর, মাদারীপুর, শরীয়তপুর",
  },
  {
    id: 5,
    slug: "sorisha-modhu",
    name: "সরিষা ফুলের মধু",
    price: 500,
    regularPrice: 580,
    weight: "১ কেজি",
    image: "/images/products/sorisha-modhu.jpg",
    gallery: [
      "/images/products/sorisha-modhu.jpg",
      "/images/products/sorisha-modhu-bottles.jpg",
      "/images/products/sorisha-modhu-liquid-cream.jpg",
    ],
    category: "Natural Honey",
    categorySlug: "honey",
    subcategory: "সরিষা মধু",
    brand: "Halal Sheba",
    saveText: "৳৮০ ছাড়",
    inStock: true,
    sections: ["natural-honey", "just-for-you"],
    shortDescription: "শীতকালীন হলুদ সরিষা ক্ষেত থেকে সংগৃহীত খাঁটি সরিষা ফুলের মধু। ঠান্ডা মৌসুমে হালকা জমে যাওয়ার প্রাকৃতিক বৈশিষ্ট্যযুক্ত।",
    highlights: [
      "দেশি হলুদ সরিষা ফুলের প্রাকৃতিক মধু",
      "সহজলভ্য এবং উচ্চ পুষ্টিগুণে সমৃদ্ধ",
      "সকালে কুসুম গরম পানির সাথে পানের জন্য আদর্শ",
    ],
    origin: "মানিকগঞ্জ ও সিরাজগঞ্জ",
  },
  {
    id: 6,
    slug: "lichu-modhu",
    name: "লিচু ফুলের মধু",
    price: 600,
    regularPrice: 700,
    weight: "১ কেজি",
    image: "/images/products/lichu-modhu.jpg",
    gallery: [
      "/images/products/lichu-modhu.jpg",
      "/images/products/lichu-modhu-bottle.jpg",
    ],
    category: "Natural Honey",
    categorySlug: "honey",
    subcategory: "লিচু মধু",
    brand: "Halal Sheba",
    saveText: "৳১০০ ছাড়",
    inStock: true,
    sections: ["natural-honey", "just-for-you"],
    shortDescription: "দিনাজপুরের বিখ্যাত লিচু বাগান থেকে মৌমাছির সাহায্যে সংগৃহীত মিষ্টি সুবাসযুক্ত লিচু মধু।",
    highlights: [
      "মৃদু মিষ্টি স্বাদ ও আকর্ষণীয় লিচু ফুলের সুবাস",
      "শিশুদের অত্যন্ত প্রিয় স্বাস্থ্যকর মধু",
      "সহজে হজমযোগ্য এবং ক্লান্তি দূরীকরণে সহায়ক",
    ],
    origin: "দিনাজপুর ও ঈশ্বরদী",
  },
  {
    id: 7,
    slug: "boroi-modhu",
    name: "বরই ফুলের মধু",
    price: 700,
    regularPrice: 800,
    weight: "১ কেজি",
    image: "/images/products/boroi-modhu.jpg",
    gallery: [
      "/images/products/boroi-modhu.jpg",
      "/images/products/boroi-modhu-bottle.jpg",
    ],
    category: "Natural Honey",
    categorySlug: "honey",
    subcategory: "বরই মধু",
    brand: "Halal Sheba",
    saveText: "৳১০০ ছাড়",
    inStock: true,
    sections: ["natural-honey", "just-for-you"],
    shortDescription: "কুল বা বরই বাগানের ফুল থেকে সংগৃহীত বিশেষ স্বাদের সুমিষ্ট ও পুষ্টিকর বরই মধু।",
    highlights: [
      "গাঢ় অ্যাম্বার রঙের খাঁটি বরই ফুলের নির্যাস",
      "হজমশক্তি বৃদ্ধি এবং পেটের সুস্থতায় দারুণ ফলদায়ক",
      "প্রাকৃতিক খনিজ ও পুষ্টি উপাদানে সমৃদ্ধ",
    ],
    origin: "রাজশাহী ও নাটোর",
  },
  {
    id: 8,
    slug: "cream-honey",
    name: "প্রিমিয়াম ক্রিম হানি",
    price: 950,
    regularPrice: 1100,
    weight: "১ কেজি",
    image: "/images/products/cream-honey.jpg",
    gallery: [
      "/images/products/cream-honey.jpg",
      "/images/products/sorisha-modhu-liquid-cream.jpg",
    ],
    category: "Natural Honey",
    categorySlug: "honey",
    subcategory: "ক্রিম হানি",
    brand: "Halal Sheba",
    badgeLeft: "New Arrival",
    saveText: "৳১৫০ ছাড়",
    isTopSelling: true,
    inStock: true,
    sections: ["top-selling", "natural-honey", "just-for-you"],
    shortDescription: "প্রাকৃতিক উপায়ে প্রক্রিয়াজাত সিল্কি স্মুথ ক্রিম হানি। রুটি, টোস্ট বা সরাসরি খাওয়ার জন্য অতুলনীয়।",
    highlights: [
      "সিল্কি ক্রিমের মতো মিহি টেক্সচার",
      "রুটি, প্যানকেক বা ডেজার্টের সাথে স্প্রেড হিসেবে দারুণ",
      "১০০% খাঁটি ও নির্ভেজাল নিশ্চয়তা",
    ],
    origin: "হালাল সেবা স্পেশাল",
  },
  {
    id: 9,
    slug: "khejurer-gur",
    name: "খেজুরের খাঁটি পাটালি গুড়",
    price: 390,
    regularPrice: 450,
    weight: "১ কেজি",
    image: "/images/products/khejurer-gur.jpg",
    gallery: [
      "/images/products/khejurer-gur.jpg",
      "/images/products/khejurer-beej-gur.jpg",
    ],
    category: "Gur & Sweets",
    categorySlug: "gur-sweets",
    subcategory: "খেজুরের পাটালি গুড়",
    brand: "Halal Sheba",
    badgeLeft: "Best Selling",
    saveText: "৳৬০ ছাড়",
    isTopSelling: true,
    inStock: true,
    sections: ["top-selling", "organic-food", "just-for-you"],
    shortDescription: "শীতের খাঁটি খেজুরের রস থেকে ঐতিহ্যবাহী পদ্ধতিতে তৈরি সুস্বাদু গোল পাটালি গুড়। প্রাকৃতিক মিষ্টতা, মনমাতানো সুবাস ও সমৃদ্ধ স্বাদের অনন্য সমন্বয়।",
    descriptionSections: [
      {
        heading: "খেজুরের ফয়েল পাটালি 🌴",
        paragraphs: [
          "শীতের খাঁটি খেজুরের রস থেকে ঐতিহ্যবাহী পদ্ধতিতে তৈরি সুস্বাদু ফয়েল পাটালি গুড়। প্রাকৃতিক মিষ্টতা, মনমাতানো সুবাস ও সমৃদ্ধ স্বাদের অনন্য সমন্বয়।",
          "পিঠা, পায়েসসহ নানা বাঙালি খাবারে যোগ করে শীতের চিরচেনা আমেজ ও মিষ্টি ঐতিহ্য।",
          "বাঙালির শীতের স্বাদ, ঐতিহ্যের মিষ্টি ছোঁয়া।",
        ],
      },
      {
        heading: "খেজুরের গোল পাটালি 🌴",
        paragraphs: [
          "শীতের খাঁটি খেজুরের রস থেকে ঐতিহ্যবাহী পদ্ধতিতে তৈরি সুস্বাদু গোল পাটালি গুড়। প্রাকৃতিক মিষ্টতা, মনমাতানো সুবাস ও সমৃদ্ধ স্বাদের অনন্য সমন্বয়।",
          "পিঠা, পায়েসসহ নানা বাঙালি খাবারে যোগ করে শীতের চিরচেনা আমেজ ও মিষ্টি ঐতিহ্য।",
          "বাঙালির শীতের স্বাদ, ঐতিহ্যের মিষ্টি ছোঁয়া।",
        ],
      },
    ],
    highlights: [
      "শতভাগ চিনি ও রাসায়নিক কেমিক্যাল মুক্ত",
      "যশোর ও সাতক্ষীরার ঐতিহ্যবাহী খেজুরের রস থেকে তৈরি",
      "পাটিসাপটা, পায়েস ও শীতকালীন পিঠাপুলির জন্য সেরা",
    ],
    origin: "যশোর ও সাতক্ষীরা",
  },
  {
    id: 10,
    slug: "khejurer-beej-gur",
    name: "খেজুরের স্পেশাল বীজগুড়",
    price: 490,
    regularPrice: 550,
    weight: "১ কেজি",
    image: "/images/products/khejurer-beej-gur.jpg",
    gallery: [
      "/images/products/khejurer-beej-gur.jpg",
    ],
    category: "Gur & Sweets",
    categorySlug: "gur-sweets",
    subcategory: "খেজুরের বীজগুড়",
    brand: "Halal Sheba",
    badgeLeft: "New Arrival",
    saveText: "৳৬০ ছাড়",
    inStock: true,
    sections: ["organic-food", "just-for-you"],
    shortDescription: "খেজুরের রস থেকে ঐতিহ্যবাহী পদ্ধতিতে তৈরি বিশেষ এই বীজ গুড়। দানাদার গঠন, মনমাতানো ঘ্রাণ আর মিষ্টি স্বাদের অপূর্ব সমন্বয়।",
    descriptionSections: [{
      heading: "বীজ গুড় 🌴",
      paragraphs: [
        "খেজুরের রস থেকে ঐতিহ্যবাহী পদ্ধতিতে তৈরি বিশেষ এই বীজ গুড়। দানাদার গঠন, মনমাতানো ঘ্রাণ আর মিষ্টি স্বাদের অপূর্ব সমন্বয়।",
        "সরাসরি খেতে যেমন সুস্বাদু, তেমনি পিঠা-পায়েসসহ নানা শীতকালীন খাবারের স্বাদ বাড়াতেও অতুলনীয়।",
        "বাঙালির শীতকালীন ঐতিহ্যের এক মিষ্টি উপহার।",
      ],
    }],
    highlights: [
      "সরাসরি খেতে সুস্বাদু; পিঠা-পায়েসসহ নানা শীতকালীন খাবারের স্বাদ বাড়ায়",
      "বাঙালির শীতকালীন ঐতিহ্যের এক মিষ্টি উপহার",
    ],
    origin: "যশোর ও সাতক্ষীরা",
  },
  {
    id: 11,
    slug: "khejurer-jhola-gur",
    name: "খেজুরের খাঁটি ঝোলা গুড়",
    price: 390,
    regularPrice: 450,
    weight: "১ কেজি",
    image: "/images/products/khejurer-jhola-gur.jpg",
    gallery: [
      "/images/products/khejurer-jhola-gur.jpg",
      "/images/products/khejurer-jhola-gur-jars.jpg",
    ],
    category: "Gur & Sweets",
    categorySlug: "gur-sweets",
    subcategory: "খেজুরের ঝোলা গুড়",
    brand: "Halal Sheba",
    saveText: "৳৬০ ছাড়",
    inStock: true,
    sections: ["organic-food", "just-for-you"],
    shortDescription: "শীতের তাজা খেজুরের রস জ্বাল দিয়ে ঐতিহ্যবাহী পদ্ধতিতে তৈরি সুস্বাদু ঝোলা গুড়। ঘন সোনালি রং, মিষ্টি সুবাস আর মোলায়েম স্বাদের অপূর্ব সমন্বয়।",
    descriptionSections: [{
      heading: "ঝোলা গুড় 🌴",
      paragraphs: [
        "শীতের তাজা খেজুরের রস জ্বাল দিয়ে ঐতিহ্যবাহী পদ্ধতিতে তৈরি সুস্বাদু ঝোলা গুড়। ঘন সোনালি রং, মিষ্টি সুবাস আর মোলায়েম স্বাদের অপূর্ব সমন্বয়।",
        "পিঠা, পুলি কিংবা পায়েস—সবকিছুর স্বাদে যোগ করে বাড়তি মিষ্টতা।",
        "বাঙালির শীতকালীন ঐতিহ্যের এক মজাদার স্বাদ।",
      ],
    }],
    highlights: [
      "পিঠা, পুলি কিংবা পায়েস—সবকিছুর স্বাদে যোগ করে বাড়তি মিষ্টতা",
      "বাঙালির শীতকালীন ঐতিহ্যের এক মজাদার স্বাদ",
    ],
    origin: "যশোর",
  },
  {
    id: 12,
    slug: "gawa-ghee",
    name: "খাঁটি গাওয়া ঘি",
    price: 1500,
    regularPrice: 1650,
    weight: "১ কেজি",
    image: "/images/products/gawa-ghee.jpg",
    gallery: [
      "/images/products/gawa-ghee.jpg",
    ],
    category: "Oil & Ghee",
    categorySlug: "oil-ghee",
    subcategory: "গাওয়া ঘি",
    brand: "Halal Sheba",
    badgeLeft: "Best Selling",
    saveText: "৳১৫০ ছাড়",
    isTopSelling: true,
    inStock: true,
    sections: ["top-selling", "cooking-essentials", "just-for-you"],
    shortDescription: "সাতক্ষীরার খাঁটি দেশি গরুর দুধের মাখন থেকে ঐতিহ্যবাহী পদ্ধতিতে জ্বাল দেওয়া সুঘ্রাণযুক্ত খাঁটি গাওয়া ঘি।",
    highlights: [
      "১০০% খাঁটি দেশি গরুর দুধের ননী ও মাখন থেকে প্রস্তুত",
      "দানাযুক্ত টেক্সচার ও মন মাতানো সুবাস",
      "পোলাও, বিরিয়ানি ও গরম ভাতে অপরূপ স্বাদ",
    ],
    origin: "সাতক্ষীরা",
  },
  {
    id: 13,
    slug: "butter-makhon",
    name: "খাঁটি বাটার / মাখন",
    price: 900,
    regularPrice: 1000,
    weight: "১ কেজি",
    image: "/images/products/butter-makhon.jpg",
    gallery: [
      "/images/products/butter-makhon.jpg",
    ],
    category: "Oil & Ghee",
    categorySlug: "oil-ghee",
    subcategory: "বাটার/মাখন",
    brand: "Halal Sheba",
    badgeLeft: "Best Selling",
    saveText: "৳১০০ ছাড়",
    isTopSelling: true,
    inStock: true,
    sections: ["top-selling", "cooking-essentials", "just-for-you"],
    shortDescription: "গরুর খাঁটি দুধের সর থেকে ঐতিহ্যবাহী পদ্ধতিতে তৈরি সুস্বাদু ও নির্ভেজাল মাখন।",
    highlights: [
      "সম্পূর্ণ প্রাকৃতিক উপায়ে ব্লেন্ড ও চূর্ণকৃত মাখন",
      "লবণমুক্ত, তাজা ও পুষ্টিকর",
      "রুটি, পরোটা বা সরাসরি ঘি তৈরির জন্য উপযুক্ত",
    ],
    origin: "দেশি ডেইরি খামার",
  },
  {
    id: 14,
    slug: "sorishar-tel",
    name: "ঘানি ভাঙা খাঁটি সরিষার তেল",
    price: 330,
    regularPrice: 360,
    weight: "১ লিটার",
    image: "/images/products/sorishar-tel.jpg",
    gallery: [
      "/images/products/sorishar-tel.jpg",
      "/images/products/sorishar-tel-5l.jpg",
    ],
    category: "Oil & Ghee",
    categorySlug: "oil-ghee",
    subcategory: "সরিষার তেল",
    brand: "Halal Sheba",
    badgeLeft: "Best Selling",
    saveText: "৳৩০ ছাড়",
    isTopSelling: true,
    inStock: true,
    sections: ["top-selling", "cooking-essentials", "just-for-you"],
    shortDescription: "বাছাইকৃত দেশি মাঘী সরিষা কাঠের ঘানিতে ভেঙে তৈরি তীব্র ঝাঁঝালো ও খাঁটি সরিষার তেল।",
    highlights: [
      "কাঠের ঘানিতে কোল্ড প্রেস পদ্ধতিতে ভাঙানো",
      "প্রাকৃতিক ঝাঁঝ ও আসল সরিষার ঘ্রাণ অক্ষুণ্ণ",
      "ভর্তা ও রান্নায় শতভাগ স্বাস্থ্যকর নিশ্চয়তা",
    ],
    origin: "সাতক্ষীরা ও সিরাজগঞ্জ",
  },
  {
    id: 15,
    slug: "narikel-tel",
    name: "কোল্ড প্রেসড খাঁটি নারিকেল তেল",
    price: 1200,
    regularPrice: 1350,
    weight: "১ লিটার",
    image: "/images/products/narikel-tel.jpg",
    gallery: [
      "/images/products/narikel-tel.jpg",
    ],
    category: "Oil & Ghee",
    categorySlug: "oil-ghee",
    subcategory: "নারিকেল তেল",
    brand: "Halal Sheba",
    saveText: "৳১৫০ ছাড়",
    inStock: true,
    sections: ["cooking-essentials", "just-for-you"],
    shortDescription: "উপকূলীয় তাজা পাকা নারিকেল থেকে কোল্ড প্রেস পদ্ধতিতে তৈরি শতভাগ খাঁটি ও ভোজ্য নারিকেল তেল।",
    highlights: [
      "ভোজ্য গ্রেড কোল্ড প্রেসড এক্সট্রা ভার্জিন নারিকেল তেল",
      "চুল ও ত্বকের যত্নের পাশাপাশি রান্নায় ব্যবহারযোগ্য",
      "কোনো কৃত্রিম সুগন্ধি বা রাসায়নিক নেই",
    ],
    origin: "বাগেরহাট ও ভোলা",
  },
  {
    id: 16,
    slug: "kalojira-tel",
    name: "কোল্ড প্রেসড খাঁটি কালোজিরা তেল",
    price: 1800,
    regularPrice: 2000,
    weight: "১ লিটার",
    image: "/images/products/kalojira-tel.jpg",
    gallery: [
      "/images/products/kalojira-tel.jpg",
    ],
    category: "Oil & Ghee",
    categorySlug: "oil-ghee",
    subcategory: "কালোজিরা তেল",
    brand: "Halal Sheba",
    saveText: "৳২০০ ছাড়",
    inStock: true,
    sections: ["cooking-essentials", "just-for-you"],
    shortDescription: "সেরা মানের দেশি কালোজিরা দানা থেকে ঠান্ডা চাপে নিষ্কাশিত শতভাগ খাঁটি ঔষধি কালোজিরা তেল।",
    highlights: [
      "১০০% খাঁটি কোল্ড প্রেসড অপরিশোধিত তেল",
      "রোগ প্রতিরোধ ক্ষমতা ও শারীরিক শক্তিবর্ধক",
      "নিয়মিত কয়েক ফোঁটা সেবনে শরীরের রোগ প্রতিরোধ ক্ষমতা বহুগুণ বৃদ্ধি পায়",
    ],
    origin: "শরীয়তপুর",
  },
  {
    id: 17,
    slug: "tal-michri",
    name: "শ্রী দুলাল চন্দ্র ভড়ের খাঁটি তাল মিছরি",
    price: 350,
    regularPrice: 400,
    weight: "১ কেজি",
    image: "/images/products/tal-michri.jpg",
    gallery: [
      "/images/products/tal-michri.jpg",
    ],
    category: "Gur & Sweets",
    categorySlug: "gur-sweets",
    subcategory: "তাল মিছরি",
    brand: "Halal Sheba",
    saveText: "৳৫০ ছাড়",
    inStock: true,
    sections: ["organic-food", "just-for-you"],
    shortDescription: "ঐতিহাসিক শ্রী দুলাল চন্দ্র ভড়ের অরিজিনাল তাল মিছরি। সর্দি-কাশি উপশমে ও কণ্ঠনালীর আরামদায়ক প্রাকৃতিক ওষুধ।",
    highlights: [
      "শতবর্ষের ঐতিহ্যবাহী দুলাল চন্দ্র ভড়ের অরিজিনাল ফর্মুলা",
      "সর্দি, কাশি ও গলার খুশখুশ নিরাময়ে বিশ্বস্ত",
      "শিশুদের জন্য অত্যন্ত নিরাপদ ও পুষ্টিকর মিষ্টি বিকল্প",
    ],
    origin: "অরিজিনাল তাল মিছরি",
  },
  {
    id: 18,
    slug: "chia-seed",
    name: "প্রিমিয়াম অর্গানিক চিয়া সিড",
    price: 600,
    regularPrice: 700,
    weight: "১ কেজি",
    image: "/images/products/chia-seed.jpg",
    gallery: [
      "/images/products/chia-seed.jpg",
    ],
    category: "Spices & Seeds",
    categorySlug: "spices-seeds",
    subcategory: "চিয়া সিড",
    brand: "Halal Sheba",
    badgeLeft: "New Arrival",
    saveText: "৳১০০ ছাড়",
    inStock: true,
    sections: ["organic-food", "just-for-you"],
    shortDescription: "ওমেগা-৩ ফ্যাটি এসিড, ফাইবার এবং প্রোটিনে ভরপুর প্রিমিয়াম গ্রেড অর্গানিক চিয়া সিড।",
    highlights: [
      "উচ্চমানের ফাইবার ও ওমেগা-৩ সমৃদ্ধ সুপারফুড",
      "ওজন নিয়ন্ত্রণ ও হজম প্রক্রিয়া স্বাভাবিক রাখতে অত্যন্ত কার্যকরী",
      "পানি, জুস বা পুডিংয়ে মিশিয়ে প্রতিদিন সেবনযোগ্য",
    ],
    origin: "আমদানিকৃত প্রিমিয়াম গ্রেড",
  },
  {
    id: 19,
    slug: "chui-jhal",
    name: "সাতক্ষীরার খাঁটি চুইঝাল",
    price: 750,
    regularPrice: 900,
    weight: "১ কেজি (সাইজ ও গ্রেড ভেদে ৬০০৳ - ১০০০৳)",
    image: "/images/products/chui-jhal.jpg",
    gallery: [
      "/images/products/chui-jhal.jpg",
    ],
    category: "Spices & Seeds",
    categorySlug: "spices-seeds",
    subcategory: "সাতক্ষীরার চুইঝাল",
    brand: "Halal Sheba",
    badgeLeft: "Best Selling",
    saveText: "৳১৫০ ছাড়",
    isTopSelling: true,
    inStock: true,
    sections: ["cooking-essentials", "just-for-you"],
    shortDescription: "খুলনা ও সাতক্ষীরার ঐতিহ্যবাহী সুস্বাদু ও তীব্র ঝাঁঝালো আসল চুইঝালের ডাল ও শিকড়।",
    highlights: [
      "সাতক্ষীরা অঞ্চলের নিজস্ব বাগান থেকে সংগৃহীত খাঁটি চুইঝাল",
      "গরু বা খাসির মাংসের সাথে বিশেষ ঝাঁঝ ও অনন্য স্বাদের সংযোজন",
      "গ্যাস্ট্রিক ও বাতব্যথা নিরাময়ে সহায়ক ভেষজ গুণসম্পন্ন",
    ],
    origin: "থানাঘাটা, সাতক্ষীরা",
  },
  {
    id: 20,
    slug: "pera-sandesh",
    name: "ঐতিহ্যবাহী সুস্বাদু প্যারা সন্দেশ",
    price: 800,
    regularPrice: 900,
    weight: "১ কেজি",
    image: "/images/products/pera-sandesh.jpg",
    gallery: [
      "/images/products/pera-sandesh.jpg",
    ],
    category: "Gur & Sweets",
    categorySlug: "gur-sweets",
    subcategory: "প্যারা সন্দেশ",
    brand: "Halal Sheba",
    saveText: "৳১০০ ছাড়",
    inStock: true,
    sections: ["organic-food", "just-for-you"],
    shortDescription: "খাঁটি গরুর দুধের ঘন খোয়া ক্ষীর থেকে ঐতিহ্যবাহী হাতে তৈরি মিষ্টি ও পুষ্টিকর প্যারা সন্দেশ।",
    highlights: [
      "১০০% খাঁটি গরুর দুধের মাওয়া ও ক্ষীর দিয়ে তৈরি",
      "কোনো কৃত্রিম ফ্লেভার বা প্রিজারভেটিভ নেই",
      "পারিবারিক যেকোনো আয়োজনে বা উপহার হিসেবে চমৎকার",
    ],
    origin: "সাতক্ষীরা ও যশোর",
  },
  {
    id: 21,
    slug: "mishtir-chhana",
    name: "খাঁটি মিষ্টির ছানা",
    price: 650,
    regularPrice: 750,
    weight: "১ কেজি",
    image: "/images/products/mishtir-chhana.jpg",
    gallery: [
      "/images/products/mishtir-chhana.jpg",
    ],
    category: "Gur & Sweets",
    categorySlug: "gur-sweets",
    subcategory: "মিষ্টির ছানা",
    brand: "Halal Sheba",
    saveText: "৳১০০ ছাড়",
    inStock: true,
    sections: ["organic-food", "just-for-you"],
    shortDescription: "টাটকা গরুর খাঁটি দুধ কেটে তৈরি নরম, সতেজ ও তুলতুলে মিষ্টির ছানা। মিষ্টি তৈরির জন্য আদর্শ।",
    highlights: [
      "তাজা দেশি গরুর দুধ থেকে প্রস্তুতকৃত",
      "রসগোল্লা, চমচম, ছানার জিলাপিসহ যেকোনো মিষ্টান্ন তৈরির জন্য উপযুক্ত",
      "প্রাকৃতিক প্রোটিন ও ক্যালসিয়ামে সমৃদ্ধ",
    ],
    origin: "সাতক্ষীরা ডেইরি",
  },
  {
    id: 22,
    slug: "dheki-chhata-chaler-gura",
    name: "ঢেঁকি ছাঁটা চালের গুঁড়া",
    price: 220,
    regularPrice: 260,
    weight: "১ কেজি (1 Kg Premium Pack)",
    image: "/images/products/dheki-chhata-chaler-gura.jpg",
    gallery: [
      "/images/products/dheki-chhata-chaler-gura.jpg",
    ],
    category: "Gur & Sweets",
    categorySlug: "gur-sweets",
    subcategory: "ঢেঁকি ছাঁটা চালের গুঁড়া",
    brand: "Halal Sheba",
    badgeLeft: "New Arrival",
    saveText: "৳৪০ ছাড়",
    isTopSelling: false,
    inStock: true,
    sections: ["organic-food", "just-for-you", "cooking-essentials"],
    shortDescription: "গ্রামের ঐতিহ্যবাহী কাঠের ঢেঁকিতে ভানা সুগন্ধি আতপ চালের শতভাগ খাঁটি ও পুষ্টিকর চালের গুঁড়া।",
    highlights: [
      "গ্রামের কাঠের ঢেঁকিতে তৈরি হওয়ায় চালের নিজস্ব পুষ্টি ও সুবাস অক্ষুণ্ন থাকে",
      "ভাপা পিঠা, চিতই পিঠা, পাটিসাপটা ও পুলি পিঠা তৈরিতে দেয় নরম তুলতুলে ভাব",
      "কোনো কৃত্রিম রং, রাসায়নিক বা প্রিজারভেটিভ ছাড়া ১০০% প্রাকৃতিক ও স্বাস্থ্যকর",
    ],
    origin: "সাতক্ষীরা ও যশোর গ্রাম",
  },
  {
    id: 23,
    slug: "beetroot-powder",
    name: "অর্গানিক বিটরুট গুঁড়া",
    price: 350,
    regularPrice: 420,
    weight: "২০০ গ্রাম (200g Jar)",
    image: "/images/products/beetroot-powder.jpg",
    gallery: [
      "/images/products/beetroot-powder.jpg",
    ],
    category: "Spices & Seeds",
    categorySlug: "spices-seeds",
    subcategory: "বিটরুট গুঁড়া",
    brand: "Halal Sheba",
    badgeLeft: "New Arrival",
    saveText: "৳৭০ ছাড়",
    isTopSelling: false,
    inStock: true,
    sections: ["organic-food", "just-for-you", "cooking-essentials"],
    shortDescription: "তাজা খাঁটি বিটরুট থেকে প্রস্তুতকৃত শতভাগ প্রাকৃতিক, পুষ্টিকর ও অর্গানিক বিটরুট পাউডার।",
    highlights: [
      "প্রাকৃতিক আয়রন ও ভিটামিন সমৃদ্ধ যা রক্তস্বল্পতা দূর করতে ও হিমোগ্লোবিন বাড়াতে সাহায্য করে",
      "উচ্চ অ্যান্টিঅক্সিডেন্ট ও নাইট্রেট সমৃদ্ধ যা রক্তচাপ নিয়ন্ত্রণে এবং ত্বকের উজ্জ্বলতা ও লাবণ্য বৃদ্ধিতে কার্যকরী",
      "জুস, স্মুদি বা রূপচর্চায় ব্যবহারের জন্য ১০০% প্রাকৃতিক ও স্বাস্থ্যকর",
    ],
    origin: "হালাল সেবা অর্গানিক গার্ডেন",
  },
  {
    id: 24,
    slug: "chak-shoho-modhu",
    name: "সুন্দরবনের প্রাকৃতিক চাক সহ মধু",
    price: 3000,
    regularPrice: 3300,
    weight: "১ কেজি (1 Kg Box Pack)",
    image: "/images/products/chak-shoho-modhu.jpg",
    gallery: [
      "/images/products/chak-shoho-modhu.jpg",
    ],
    category: "Natural Honey",
    categorySlug: "honey",
    subcategory: "চাক সহ মধু",
    brand: "Halal Sheba",
    badgeLeft: "Best Selling",
    saveText: "৳৩০০ ছাড়",
    isTopSelling: true,
    inStock: true,
    sections: ["natural-honey", "just-for-you", "top-selling"],
    shortDescription: "সুন্দরবনের বিভিন্ন ফুলের নির্যাস থেকে সংগ্রহ করা প্রাকৃতিক RAW চাকসহ মধু। ফুল ও ভৌগোলিক বৈশিষ্ট্যভেদে এর রং, ঘ্রাণ ও স্বাদে কিছুটা ভিন্নতা থাকতে পারে।",
    highlights: [
      "আসল প্রাকৃতিক মোমযুক্ত চাকসহ কাঁচা মধু, যার প্রতি ফোঁটায় রয়েছে প্রাকৃতিকভাবে তৈরি পোলেন ও পুষ্টি",
      "কোনো তাপ প্রক্রিয়াজাত বা রিফাইন ছাড়া সরাসরি মৌচাকের খাঁটি স্বাদ ও সুবাস",
      "রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি ও দীর্ঘমেয়াদী শারীরিক শক্তিতে অতুলনীয়",
    ],
    origin: "সুন্দরবন, সাতক্ষীরা",
  },
  {
    id: 25,
    slug: "twin-fol",
    name: "প্রিমিয়াম ত্বীন ফল",
    price: 1250,
    regularPrice: 1450,
    weight: "১ কেজি (1 Kg Premium Box)",
    image: "/images/products/twin-fol.jpg",
    gallery: [
      "/images/products/twin-fol.jpg",
    ],
    category: "Organic Food",
    categorySlug: "organic-food",
    subcategory: "ত্বীন ফল",
    brand: "Halal Sheba",
    badgeLeft: "Best Selling",
    saveText: "৳২০০ ছাড়",
    isTopSelling: true,
    inStock: true,
    sections: ["organic-food", "just-for-you", "top-selling"],
    shortDescription: "পবিত্র কুরআনে বর্ণিত মোবারকময় পুষ্টিকর ত্বীন ফল। নরম, মিষ্টি ও প্রাকৃতিক আঁশে ভরপুর।",
    highlights: [
      "উচ্চমানের বড় সাইজের রসালো ও মিষ্টি প্রিমিয়াম গ্রেড ত্বীন ফল",
      "প্রচুর পরিমাণে খাদ্যআঁশ, ক্যালসিয়াম ও পটাশিয়ামে সমৃদ্ধ",
      "কোষ্ঠকাঠিন্য দূর করতে এবং হৃদযন্ত্র সুস্থ রাখতে অত্যন্ত কার্যকরী",
    ],
    origin: "আমদানিকৃত প্রিমিয়াম গ্রেড",
  },
  {
    id: 26,
    slug: "dry-food-mix",
    name: "প্রিমিয়াম মিক্সড ড্রাই ফুড ও বাদাম",
    price: 1350,
    regularPrice: 1550,
    weight: "১ কেজি (1 Kg Family Pack)",
    image: "/images/products/dry-food-mix.jpg",
    gallery: [
      "/images/products/dry-food-mix.jpg",
    ],
    category: "Organic Food",
    categorySlug: "organic-food",
    subcategory: "ড্রাই ফুড ও বাদাম",
    brand: "Halal Sheba",
    badgeLeft: "New Arrival",
    saveText: "৳২০০ ছাড়",
    isTopSelling: true,
    inStock: true,
    sections: ["organic-food", "just-for-you", "top-selling"],
    shortDescription: "কাজু বাদাম, পেস্তা, কাঠবাদাম, আখরোট, কিশমিশ, ত্বীন ফল ও পুষ্টিকর বীজসমৃদ্ধ রাজকীয় মিক্স ড্রাই ফুড।",
    highlights: [
      "১১+ পুষ্টিকর ড্রাই ফ্রুটস ও সিডের ব্যালেন্সড পারফেক্ট কম্বিনেশন",
      "স্মৃতিশক্তি বৃদ্ধি, মস্তিষ্কের কার্যক্ষমতা ও ত্বকের লাবণ্য বাড়াতে সাহায্য করে",
      "শিশু থেকে বৃদ্ধ সবার প্রতিদিনের সুষম পুষ্টির জন্য আদর্শ হেলদি স্ন্যাকস",
    ],
    origin: "হালাল সেবা স্পেশাল কালেকশন",
  },
  {
    id: 27,
    slug: "akher-lal-chini",
    name: "দেশি খাঁটি আখের লাল চিনি",
    price: 160,
    regularPrice: 190,
    weight: "১ কেজি (1 Kg Pack)",
    image: "/images/products/akher-lal-chini.jpg",
    gallery: [
      "/images/products/akher-lal-chini.jpg",
    ],
    category: "Gur & Sweets",
    categorySlug: "gur-sweets",
    subcategory: "আখের লাল চিনি",
    brand: "Halal Sheba",
    badgeLeft: "Best Selling",
    saveText: "৳৩০ ছাড়",
    isTopSelling: false,
    inStock: true,
    sections: ["cooking-essentials", "organic-food", "just-for-you"],
    shortDescription: "রাসায়নিক ও সালফারমুক্ত দেশি আখের রসে তৈরি স্বাস্থ্যকর ও খনিজসমৃদ্ধ খাঁটি লাল চিনি।",
    highlights: [
      "কোনো ব্লিচিং বা সালফার কেমিক্যাল ছাড়া প্রাকৃতিক উপায়ে উৎপাদিত",
      "আখের প্রাকৃতিক মোলাসেস ও আয়রন, ম্যাগনেসিয়াম সহ উপকারী খনিজ বজায় থাকে",
      "চা, কফি, শরবত ও মিষ্টি খাবারে আসল পুষ্টিকর মিষ্টতা প্রদান করে",
    ],
    origin: "কুষ্টিয়া ও নাটোর",
  },
  {
    id: 28,
    slug: "akher-chini-seed-mixer",
    name: "আখের লাল চিনি ও সিড মিক্সার",
    price: 480,
    regularPrice: 560,
    weight: "১ সেট (Red Sugar + Mixed Seeds)",
    image: "/images/products/akher-chini-seed-mixer.jpg",
    gallery: [
      "/images/products/akher-chini-seed-mixer.jpg",
    ],
    category: "Gur & Sweets",
    categorySlug: "gur-sweets",
    subcategory: "আখের লাল চিনি ও সিড মিক্সার",
    brand: "Halal Sheba",
    badgeLeft: "New Arrival",
    saveText: "৳৮০ ছাড়",
    isTopSelling: false,
    inStock: true,
    sections: ["organic-food", "just-for-you", "cooking-essentials"],
    shortDescription: "খাঁটি আখের লাল চিনি এবং চিয়া সিড, তোকমা ও কালোজিরার সুষম স্বাস্থ্যকর পুষ্টি কম্বো।",
    highlights: [
      "শরীরে দ্রুত শক্তি জোগাতে ও পেটের শীতলতা বজায় রাখতে জাদুকরী কম্বিনেশন",
      "ওজন নিয়ন্ত্রণ ও হজমশক্তি বৃদ্ধির জন্য প্রতিদিনের স্বাস্থ্যকর পানীয় তৈরির উপযোগী",
      "১০০% অর্গানিক ও রাসায়নিক উপাদানমুক্ত",
    ],
    origin: "হালাল সেবা অর্গানিক",
  },
  {
    id: 29,
    slug: "sharbat-seed-mixer",
    name: "পুষ্টিকর স্পেশাল শরবত সিড মিক্সার",
    price: 380,
    regularPrice: 450,
    weight: "২৫০ গ্রাম জার (250g Multi-Seed Jar)",
    image: "/images/products/sharbat-seed-mixer.jpg",
    gallery: [
      "/images/products/sharbat-seed-mixer.jpg",
    ],
    category: "Spices & Seeds",
    categorySlug: "spices-seeds",
    subcategory: "শরবত সিড মিক্সার",
    brand: "Halal Sheba",
    badgeLeft: "Best Selling",
    saveText: "৳৭০ ছাড়",
    isTopSelling: true,
    inStock: true,
    sections: ["cooking-essentials", "organic-food", "just-for-you"],
    shortDescription: "চিয়া সিড, তোকমা দানা, হালিম দানা, ইসবগুলের ভুসি ও মিষ্টি দানার পারফেক্ট স্বাস্থ্যকর শরবত মিক্স।",
    highlights: [
      "গরমের দিনে শরীরকে রাখে সতেজ, ঠান্ডা ও চাঙ্গা",
      "প্রাকৃতিক ফাইবার ও ওমেগা-৩ ফ্যাটি এসিডে ভরপুর যা কোষ্ঠকাঠিন্য ও গ্যাস্ট্রিক কমায়",
      "পানিতে মাত্র ১০ মিনিট ভিজিয়ে রেখেই চমৎকার পুষ্টিকর শরবত প্রস্তুত করা যায়",
    ],
    origin: "হালাল সেবা অর্গানিক হাব",
  },
  {
    id: 30,
    slug: "akher-gur",
    name: "খাঁটি দেশি আখের গুড়",
    price: 260,
    regularPrice: 300,
    weight: "১ কেজি জার (1 Kg Jar)",
    image: "/images/products/akher-gur.jpg",
    gallery: [
      "/images/products/akher-gur.jpg",
    ],
    category: "Gur & Sweets",
    categorySlug: "gur-sweets",
    subcategory: "আখের গুড়",
    brand: "Halal Sheba",
    badgeLeft: "New Arrival",
    saveText: "৳৪০ ছাড়",
    isTopSelling: false,
    inStock: true,
    sections: ["organic-food", "just-for-you", "cooking-essentials"],
    shortDescription: "গ্রামের ঐতিহ্যবাহী চুলায় জ্বাল দেওয়া সুস্বাদু, সুবাসিত ও ঘন দেশি আখের খাঁটি গুড়।",
    highlights: [
      "কোনো হাইড্রোজ বা ক্ষতিকারক কেমিক্যাল ছাড়া প্রস্তুতকৃত খাঁটি আখের গুড়",
      "চা, পায়েস, পিঠাপুলি এবং নিয়মিত খাবারে চিনির শ্রেষ্ঠ প্রাকৃতিক বিকল্প",
      "রক্ত পরিশোধন ও শারীরিক দুর্বলতা দূর করতে অত্যন্ত সহায়ক",
    ],
    origin: "কুষ্টিয়া ও চুয়াডাঙ্গা",
  },
  {
    id: 31,
    slug: "satkhira-aam",
    name: "সাতক্ষীরার ফরমালিনমুক্ত তাজা আম",
    price: 120,
    regularPrice: 150,
    weight: "১ কেজি (ন্যূনতম ৫ কেজি অর্ডার)",
    image: "/images/products/satkhira-aam.jpg",
    gallery: [
      "/images/products/satkhira-aam.jpg",
    ],
    category: "Organic Food",
    categorySlug: "organic-food",
    subcategory: "সাতক্ষীরার তাজা আম",
    brand: "Halal Sheba",
    badgeLeft: "New Arrival",
    saveText: "৳৩০ ছাড়",
    isTopSelling: false,
    inStock: true,
    sections: ["organic-food", "just-for-you"],
    shortDescription: "সাতক্ষীরার বাগান থেকে সরাসরি গাছপাকা মিষ্টি ও সুস্বাদু গোবিন্দভোগ / হিমসাগর / ল্যাংড়া আম।",
    highlights: [
      "কোনো প্রকার কার্বাইড বা ক্ষতিকর কেমিক্যাল ছাড়াই শতভাগ প্রাকৃতিক উপায়ে পাকানো",
      "সাতক্ষীরার নিজস্ব বাগানের গাছের তাজা আম, রসালো ও মিষ্টি",
      "প্যাকেজিং নিশ্চিত করে সুরক্ষিত অবস্থায় সরাসরি আপনার ঠিকানায় ডেলিভারি",
    ],
    origin: "সাতক্ষীরা সদর ও দেবহাটা",
  },
  {
    id: 32,
    slug: "kumra-bori",
    name: "ঐতিহ্যবাহী চালকুমড়া বড়ি",
    price: 420,
    regularPrice: 480,
    weight: "৫০০ গ্রাম (500g Pack)",
    image: "/images/products/kumra-bori.jpg",
    gallery: [
      "/images/products/kumra-bori.jpg",
    ],
    category: "Spices & Seeds",
    categorySlug: "spices-seeds",
    subcategory: "কুমড়া বড়ি",
    brand: "Halal Sheba",
    badgeLeft: "New Arrival",
    saveText: "৳৬০ ছাড়",
    isTopSelling: false,
    inStock: true,
    sections: ["cooking-essentials", "organic-food", "just-for-you"],
    shortDescription: "খাঁটি মাষকলাইয়ের ডাল ও কচি চালকুমড়া দিয়ে গ্রামের মা-বোনদের নিপুণ হাতে রোদে শুকানো সুস্বাদু বড়ি।",
    highlights: [
      "১০০% খাঁটি মাষকলাই ও দেশি চালকুমড়ার নিখুঁত মিশ্রণ",
      "মাছ, মাংস বা যেকোনো সবজি তরকারিতে দেয় অতুলনীয় দেশি স্বাদ ও মুচমুচে ভাব",
      "কোনো ময়দা বা ভেজাল উপাদান মেশানো হয় না",
    ],
    origin: "যশোর ও সাতক্ষীরা",
  },
];

export const FAQ_ITEMS = [
  {
    q: "আপনাদের পণ্যগুলো কি শতভাগ খাঁটি ও নির্ভেজাল?",
    a: "হ্যাঁ, আলহামদুলিল্লাহ! হালাল সেবা (Halal Sheba) এর প্রতিটি পণ্য নিজস্ব তত্ত্বাবধানে বিশ্বস্ত উৎস ও কৃষকদের কাছ থেকে সরাসরি সংগ্রহ ও বাজারজাত করা হয়।",
  },
  {
    q: "আমি কীভাবে সরাসরি অর্ডার করব?",
    a: "আপনি ওয়েবসাইটের মাধ্যমে সরাসরি 'Buy Now' অথবা 'Add To Cart' এ ক্লিক করে অর্ডার করতে পারেন। এছাড়া আমাদের হটলাইন নম্বর ০১৩১৩-৯৪৬৪০২ বা হোয়াটসঅ্যাপে মেসেজ পাঠিয়ে সরাসরি অর্ডার কনফার্ম করতে পারেন।",
  },
  {
    q: "ডেলিভারি চার্জ ও সময় কত?",
    a: "সাতক্ষীরা ও ঢাকা সহ সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। সাধারণত ঢাকা ও জেলা শহরে ২-৩ দিনের মধ্যে পণ্য পৌঁছে দেওয়া হয়।",
  },
  {
    q: "পণ্য পছন্দ না হলে বা ক্ষতিগ্রস্ত হলে কি রিটার্ন করা যাবে?",
    a: "অবশ্যই! পণ্য হাতে পাওয়ার পর কোনো সমস্যা বা অমিল পেলে ডেলিভারি পাওয়ার ২৪ থেকে ৪৮ ঘণ্টার মধ্যে আমাদের হেল্পলাইনে জানালে তাত্ক্ষণিক রিপ্লেসমেন্ট অথবা রিফান্ড নিশ্চিত করা হবে।",
  },
];

export const STATIC_PAGES: Record<
  string,
  { title: string; subtitle: string; body: string[] }
> = {
  "about-us": {
    title: "About Us",
    subtitle: "Halal Sheba (হালাল সেবা) — হালাল ও খাঁটি পণ্যের এক বিশ্বস্ত প্রতিষ্ঠান",
    body: [
      "হালাল সেবা দেশের বিভিন্ন অঞ্চলের জনপ্রিয়, খাঁটি ও নির্ভেজাল হালাল পণ্য মানুষের ঘরে ঘরে পৌঁছে দেওয়ার লক্ষ্য নিয়ে কাজ করে যাচ্ছে।",
      "সুন্দরবনের মৌয়ালদের সংগৃহীত প্রাকৃতিক চাকের মধু, শীতের আসল খেজুরের গুড়, সাতক্ষীরার খাঁটি গাওয়া ঘি, কাঠের ঘানির সরিষার তেল এবং সাতক্ষীরার খাঁটি চুইঝাল সহ প্রতিটি পণ্য আমরা সর্বোচ্চ সততার সাথে গ্রাহকের হাতে তুলে দিই।",
      "আমাদের প্রধান কার্যালয় ও হাব: থানাঘাটা, সাতক্ষীরা, বাংলাদেশ। হটলাইন: ০১৩১৩-৯৪৬৪০২।",
    ],
  },
  "contact-us": {
    title: "Contact Us",
    subtitle: "যেকোনো তথ্য বা সরাসরি অর্ডারের জন্য আমাদের সাথে যোগাযোগ করুন",
    body: [
      "প্রধান কার্যালয় ও হাব: থানাঘাটা, সাতক্ষীরা, বাংলাদেশ",
      "Customer Care Hotline: +8801313946402",
      "WhatsApp Support: +8801313946402",
      "Email: halalsheba25@gmail.com",
      "Facebook: https://www.facebook.com/HalalSheba/",
    ],
  },
  "company-information": {
    title: "Company Information",
    subtitle: "Halal Sheba Food & Agro",
    body: [
      "হালাল সেবা একটি প্রতিষ্ঠিত নিরাপদ খাদ্য সরবরাহকারী প্রতিষ্ঠান।",
      "রেজিস্টার্ড হাব: থানাঘাটা, সাতক্ষীরা, বাংলাদেশ।",
    ],
  },
  stories: {
    title: "Halal Sheba Stories",
    subtitle: "সুন্দরবন ও সাতক্ষীরার মাটি থেকে আপনার খাবারের টেবিলে",
    body: [
      "সাতক্ষীরা ও সুন্দরবন অঞ্চলের ঐতিহ্যবাহী কৃষক, মৌয়াল ও গাছি ভাইদের পরিশ্রমের ফসল সরাসরি আপনার দরজায় পৌঁছে দেয় হালাল সেবা।",
      "মধ্যস্বত্বভোগী ছাড়া সরাসরি উৎপাদনের উৎস থেকে সংগ্রহ করায় পণ্যের গুণগত মান থাকে শতভাগ খাঁটি ও অকৃত্রিম।",
    ],
  },
  terms: {
    title: "Terms & Conditions",
    subtitle: "সেবা ও ক্রয় সংক্রান্ত নিয়ামাবলী",
    body: [
      "ওয়েবসাইটে উল্লিখিত সকল মূল্য বাংলাদেশি টাকায় (৳) নির্ধারিত।",
      "অর্ডার দেওয়ার পর আমাদের সাপোর্ট টিম থেকে ফোন বা মেসেজের মাধ্যমে কনফার্ম করা হতে পারে।",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    subtitle: "আপনার ব্যক্তিগত তথ্যের নিরাপত্তা",
    body: [
      "অর্ডার ডেলিভারির জন্য গ্রাহকের নাম, ফোন নম্বর ও ঠিকানা সর্বোচ্চ নিরাপত্তার সাথে সংরক্ষণ করা হয় এবং কোনো তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।",
    ],
  },
  careers: {
    title: "Careers",
    subtitle: "হালাল সেবার সাথে ক্যারিয়ার গড়ুন",
    body: [
      "আমাদের ক্রমবর্ধমান টিমে যুক্ত হতে আপনার জীবনবৃত্তান্ত পাঠান halalsheba25@gmail.com ঠিকানায়।",
    ],
  },
  support: {
    title: "Support Center",
    subtitle: "দ্রুত গ্রাহক সেবা ও ডেলিভারি সহায়তা",
    body: [
      "যেকোনো প্রশ্ন বা সহায়তার জন্য প্রতিদিন সকাল ৯টা থেকে রাত ১০টা পর্যন্ত কল করুন ০১৩১৩-৯৪৬৪০২ নম্বরে অথবা হোয়াটসঅ্যাপ করুন।",
    ],
  },
  "how-to-order": {
    title: "How to Order",
    subtitle: "৩টি সহজ ধাপে অর্ডার করুন",
    body: [
      "১. আপনার পছন্দের পণ্যটি নির্বাচন করে 'Add to Cart' বা 'Buy Now' এ ক্লিক করুন।",
      "২. আপনার নাম, মোবাইল নম্বর এবং পূর্ণাঙ্গ ডেলিভারি ঠিকানা প্রদান করুন।",
      "৩. ক্যাশ অন ডেলিভারি নির্বাচন করে 'Place Order' বাটনে চাপ দিন। ব্যস, আপনার অর্ডার সম্পন্ন!",
    ],
  },
  payment: {
    title: "Payment Methods",
    subtitle: "সহজ ও নিরাপদ পেমেন্ট সুবিধা",
    body: [
      "সারাদেশে ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা রয়েছে। এছাড়া বিকাশ, নগদ, রকেট বা ব্যাংক পেমেন্টের মাধ্যমেও মূল্য পরিশোধ করতে পারবেন।",
    ],
  },
  shipping: {
    title: "Shipping & Delivery",
    subtitle: "সারাদেশে ৬৪ জেলায় হোম ডেলিভারি",
    body: [
      "সাতক্ষীরা ও ঢাকা সিটি: ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি।",
      "সারাদেশের যেকোনো প্রান্তে: ২ থেকে ৪ কার্যদিবসের মধ্যে কুরিয়ার হোম ডেলিভারি।",
    ],
  },
  "happy-return": {
    title: "Happy Return Policy",
    subtitle: "১০০% সন্তুষ্টি নিশ্চয়তা",
    body: [
      "পণ্যে কোনো ত্রুটি বা ভুল পরিলক্ষিত হলে ডেলিভারির ৪৮ ঘণ্টার মধ্যে আমাদের হেল্পলাইনে জানালে কোনো অতিরিক্ত খরচ ছাড়াই পণ্য পরিবর্তন বা রিফান্ড প্রদান করা হবে।",
    ],
  },
  "refund-policy": {
    title: "Refund Policy",
    subtitle: "স্বচ্ছ ও দ্রুত রিফান্ড প্রক্রিয়া",
    body: [
      "অনুমোদিত রিফান্ডের ক্ষেত্রে ৩ থেকে ৫ কার্যদিবসের মধ্যে আপনার বিকাশ বা নগদ নম্বরে মূল্য ফেরত দেওয়া হবে।",
    ],
  },
  exchange: {
    title: "Exchange Policy",
    subtitle: "সহজ পণ্য পরিবর্তন সুবিধা",
    body: [
      "অর্ডার আইডি ও পণ্যের বিবরণ জানিয়ে আমাদের হটলাইন ০১৩১৩-৯৪৬৪০২ নম্বরে যোগাযোগ করুন।",
    ],
  },
  cancellation: {
    title: "Order Cancellation",
    subtitle: "পণ্য প্রেরণের পূর্বে অর্ডার বাতিল",
    body: [
      "পণ্য কুরিয়ারে বুকিং হওয়ার পূর্বে যেকোনো সময় হটলাইনে ফোন দিয়ে অর্ডার বাতিল করতে পারবেন।",
    ],
  },
  "pre-order": {
    title: "Pre-Order",
    subtitle: "মৌসুমি পণ্যের আগাম বুকিং",
    body: [
      "সুন্দরবনের তাজা চাকের মধু ও শীতের তাজা খেজুরের গুড়ের জন্য আপনি আগাম প্রি-অর্ডার করতে পারেন।",
    ],
  },
  "extra-discount": {
    title: "Extra Discount & Offer Zone",
    subtitle: "কম্বো প্যাক ও বিশেষ ছাড়",
    body: [
      "আমাদের অফার সেকশনে নিয়মিত কম্বো প্যাক ও আকর্ষণীয় ছাড়ের সুযোগ থাকে।",
    ],
  },
};

export function formatTaka(amount: number): string {
  return `৳${amount.toLocaleString("en-IN")}`;
}

export function formatTakaDecimals(amount: number): string {
  return `৳${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
