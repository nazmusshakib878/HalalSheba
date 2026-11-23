import { PRODUCTS } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";

export function TopSellingSection() {
  const topSelling = PRODUCTS.filter((product) => product.isTopSelling);

  return (
    <section className="mx-auto max-w-[1320px] px-3 sm:px-6 pb-8 sm:pb-11">
      <h2 className="text-center text-xl sm:text-2xl font-semibold text-slate-800 mb-5">
        Featured Products
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {topSelling.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
