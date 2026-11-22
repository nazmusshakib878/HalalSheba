# Halal Sheba (হালাল সেবা) — Premium Halal & Safe Food E-Commerce Platform

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS storefront for **Halal Sheba (হালাল সেবা)**.

## Key Features & Routes

- `/` — Homepage featuring sticky header with instant live search autocomplete, multi-category navigation bar with dropdowns, luxury 3D Gold Halal Sheba logo, Hero slider with trust chips, Featured Categories carousel, Top Selling showcase with instant Cart & Buy Now buttons, Our Brands carousel, categorized product carousels (`All Natural Honey`, `Gur & Sweets`, `Pure Oil & Ghee`, `Spices & Organic Seeds`, `Organic Food & Fruits`), 4-pillar trust bar, and 5-column Footer with local payment method badges.
- `/collections/[slug]` — Category & collection catalog with subcategory checklists, dual-handle Price Range slider, Brand & Product Flag filters, sorting, per-page count, and pagination.
- `/products/[slug]` — Product details page with multi-image gallery, discount calculation, quantity controls, Add to Cart, Buy Now, Order on WhatsApp, direct Hotline ordering (`01313-946402`), Description & Customer Reviews tabs, and Related Products.
- `/checkout` & `/buy/now/[id]` — Complete checkout flow supporting Inside/Outside Dhaka shipping rates, promo codes (`HALAL10`, `HONEY200`), payment method selection, and instant order confirmation.
- `/track/order` — Interactive 5-step order status tracker (includes sample order `HS-10042` plus newly placed orders).
- `/my/wishlists`, `/login`, `/all-brands`, `/brand/[slug]`, `/faq`, `/page/[slug]`.

## Setup Instructions

### Prerequisites

- Node.js 18+ (tested with Node.js 24)
- npm 9+

### Install & Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Typecheck & Production Build

```bash
npm run typecheck
npm run build
npm run start
```
