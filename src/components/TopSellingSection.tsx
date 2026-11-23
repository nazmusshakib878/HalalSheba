import Link from "next/link";
import { PRODUCTS } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";

export function TopSellingSection() {
  const topSelling = PRODUCTS.filter((product) => product.isTopSelling);

  return (
    <section className="mx-auto max-w-[1320px] px-3 sm:px-6 pb-8 sm:pb-11">
      <div className="store-section-heading"><div><p className="store-eyebrow">A LITTLE GOODNESS, EVERY DAY</p><h2>আপনার জন্য বাছাই করা</h2></div><Link href="/collections/all-products">সব পণ্য ↗</Link></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {topSelling.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
