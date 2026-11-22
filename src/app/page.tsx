import Link from "next/link";
import { PRODUCTS, SITE_ASSETS } from "@/data/catalog";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { TopSellingSection } from "@/components/TopSellingSection";
import { BrandCarousel } from "@/components/BrandCarousel";
import { ProductCarouselSection } from "@/components/ProductCarouselSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { SafeImage } from "@/components/SafeImage";

export default function HomePage() {
  const naturalHoney = PRODUCTS.filter((p) =>
    p.categorySlug === "honey"
  );
  const gurAndSweets = PRODUCTS.filter((p) =>
    p.categorySlug === "gur-sweets"
  );
  const cookingEssentials = PRODUCTS.filter((p) =>
    p.categorySlug === "oil-ghee"
  );
  const spicesAndSeeds = PRODUCTS.filter((p) =>
    p.categorySlug === "spices-seeds"
  );

  return (
    <div className="bg-[#f8fafc]">
      {/* Hero Slider + Promo Banner */}
      <HeroSection />

      {/* 10 Featured Categories Carousel */}
      <FeaturedCategories />

      {/* 2x2 Top Selling Products Showcase */}
      <TopSellingSection />

      {/* Our Brands Carousel */}
      <BrandCarousel />

      {/* All Natural Honey */}
      <ProductCarouselSection
        title="খাঁটি প্রাকৃতিক মধু (All Natural Honey)"
        viewAllHref="/collections/honey"
        products={naturalHoney}
      />

      {/* Gur & Sweets */}
      <ProductCarouselSection
        title="খেজুরের গুড় ও ঐতিহ্যবাহী মিষ্টি (Gur & Traditional Sweets)"
        viewAllHref="/collections/gur-sweets"
        products={gurAndSweets}
      />

      {/* Cooking Essentials: Pure Oil & Gawa Ghee */}
      <ProductCarouselSection
        title="খাঁটি তেল ও গাওয়া ঘি (Pure Oil & Ghee)"
        viewAllHref="/collections/oil-ghee"
        products={cookingEssentials}
      />

      {/* Spices & Seeds */}
      <ProductCarouselSection
        title="মসলা, চুইঝাল ও ভেষজ পণ্য (Spices & Organic Seeds)"
        viewAllHref="/collections/spices-seeds"
        products={spicesAndSeeds}
      />

      {/* Customer Testimonials Carousel */}
      <TestimonialsSection />
    </div>
  );
}
