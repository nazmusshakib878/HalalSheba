"use client";
import { useCatalog } from "@/context/CatalogContext";
import Link from "next/link";

import { SafeImage } from "@/components/SafeImage";

export function FeaturedCategories() {
  const { PRODUCTS, CATEGORIES } = useCatalog();
  return (
    <section className="store-categories mx-auto max-w-[1320px] px-3 sm:px-6 py-8 sm:py-12">
      <div className="store-section-heading"><div><p className="store-eyebrow">FIND YOUR EVERYDAY FAVOURITES</p><h2>কী খুঁজছেন আজ?</h2></div><Link href="/collections/all-products">সব পণ্য <span aria-hidden="true">↗</span></Link></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {CATEGORIES.map((category) => (
          <Link key={category.id} href={`/collections/${category.slug}`} className="store-category">
            <SafeImage src={category.image} alt="" className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover" loading="lazy" />
            <span>{category.name}</span><span className="store-category-arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
