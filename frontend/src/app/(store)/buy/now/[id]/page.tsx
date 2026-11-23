import { getCatalog } from "@/lib/catalog-server";
import { redirect, notFound } from "next/navigation";


export default async function BuyNowByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { products: PRODUCTS } = await getCatalog();
  const { id } = await params;
  const numId = Number(id);
  const product = PRODUCTS.find((p) => p.id === numId);
  if(!product) notFound();
  redirect(`/checkout?buyNow=${encodeURIComponent(product.slug)}`);
}
