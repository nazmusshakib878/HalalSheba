"use client";

import { useCatalog } from "@/context/CatalogContext";
import { ProductCarouselSection } from "@/components/ProductCarouselSection";

// Featured homepage section for the wooden roti maker
// (প্রিমিয়াম মেহগনি কাঠের রুটি মেকার), using the site's own product card
// and carousel — the same pattern as every other homepage section. The card
// shows the size buttons (৮/৯/১০ ইঞ্চি), the ৳1,090 – ৳1,420 price range
// and a SELECT OPTIONS button; the detail page's own size selector shows
// each size's price, exactly like the mustard oil product.
//
// Products are DB-backed, so this section renders ONLY once the product
// exists in the catalog (created in the admin panel with slug
// "kather-roti-maker"). Until then it renders nothing — never an empty or
// broken section. No stock count is shown anywhere here, by request.
export function RotiMakerSection() {
  const { PRODUCTS } = useCatalog();
  const product = PRODUCTS.find(
    (p) => p.slug === "kather-roti-maker" || p.name.includes("রুটি মেকার")
  );
  if (!product) return null;
  return (
    <ProductCarouselSection
      title="নতুন পণ্য"
      viewAllHref={`/products/${product.slug}`}
      products={[product]}
      direction="left"
    />
  );
}
