import { PRODUCTS } from "@/data/catalog";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { TopSellingSection } from "@/components/TopSellingSection";
import { BrandCarousel } from "@/components/BrandCarousel";
import { ProductCarouselSection } from "@/components/ProductCarouselSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";

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
  const organicFood = PRODUCTS.filter(
    (p) =>
      p.categorySlug === "organic-food" ||
      p.slug === "satkhira-aam" ||
      p.slug === "twin-fol" ||
      p.slug === "dry-food-mix" ||
      p.slug === "kumra-bori" ||
      p.slug === "beetroot-powder"
  );

  return (
    <div className="storefront">
      {/* Hero Slider + Promo Banner */}
      <HeroSection />

      {/* 10 Featured Categories Carousel */}
      <FeaturedCategories />

      {/* 2x2 Top Selling Products Showcase */}
      <TopSellingSection />



      {/* All Natural Honey */}
      <ProductCarouselSection
        title="খাঁটি প্রাকৃতিক মধু"
        viewAllHref="/collections/honey"
        products={naturalHoney}
      />

      {/* Gur & Sweets */}
      <ProductCarouselSection
        title="খেজুরের গুড় ও ঐতিহ্যবাহী মিষ্টি"
        viewAllHref="/collections/gur-sweets"
        products={gurAndSweets}
        direction="right"
      />

      {/* Cooking Essentials: Pure Oil & Gawa Ghee */}
      <ProductCarouselSection
        title="খাঁটি তেল ও গাওয়া ঘি"
        viewAllHref="/collections/oil-ghee"
        products={cookingEssentials}
      />

      {/* Spices & Seeds */}
      <ProductCarouselSection
        title="মসলা, চুইঝাল ও ভেষজ পণ্য"
        viewAllHref="/collections/spices-seeds"
        products={spicesAndSeeds}
        direction="right"
      />

      {/* Organic Food, Dry Fruits & Fresh Seasonal Fruits */}
      <ProductCarouselSection
        title="অর্গানিক ফুড, ড্রাই ফ্রুটস ও মৌসুমি ফল"
        viewAllHref="/collections/organic-food"
        products={organicFood}
      />

      <BrandCarousel />

      {/* Customer Testimonials Carousel */}
      <TestimonialsSection />
    </div>
  );
}
