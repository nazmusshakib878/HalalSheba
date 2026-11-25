"use client";
import { useCatalog } from "@/context/CatalogContext";

import {api} from "@/lib/api";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import { formatTaka } from "@/data/catalog";
import { useStore } from "@/context/StoreContext";
import { SafeImage } from "@/components/SafeImage";
import { ProductCard } from "@/components/ProductCard";
import {
  CartIcon,
  HeartIcon,
  PhoneIcon,
  StarIcon,
  WhatsAppIcon,
} from "@/components/Icons";

export default function ProductDetailPage() {
  const { PRODUCTS, CATEGORIES } = useCatalog();
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted } =
    useStore();
  const [variantIndex,setVariantIndex]=useState(0);
  const base=PRODUCTS.find(p=>p.slug===(params?.slug==='sorishar-tel-5-liter'?'sorishar-tel':params?.slug));
  if(!base) notFound();
  const selected=base.variants?.[variantIndex] || base.variants?.[0];
  const product={...base,variantId:selected?.id,price:selected?.price??base.price,regularPrice:selected?.regularPrice,weight:selected?.name??base.weight,image:selected?.image||base.image,inStock:true};

  const images =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];

  const [selectedImage, setSelectedImage] = useState(0);
  useEffect(() => {
    setSelectedImage(0);
    setVariantIndex(params?.slug === "sorishar-tel-5-liter" ? 1 : 0);
  }, [params?.slug]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">(
    "description"
  );

  // Review form state
  const [reviews,setReviews]=useState<{id:string;productSlug:string;author:string;rating:number;comment:string;createdAt:string}[]>([]);
  const [reviewReference,setReviewReference]=useState("");
  const [reviewPhone,setReviewPhone]=useState("");
  const [reviewMessage,setReviewMessage]=useState("");
  useEffect(()=>{api<{id:number;author:string;rating:number;comment:string;created_at:string}[]>(`products/${base.id}/reviews`).then(rows=>setReviews(rows.map(r=>({...r,id:String(r.id),productSlug:base.slug,createdAt:r.created_at})))).catch(()=>{});},[base.id,base.slug]);
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const productReviews = useMemo(
    () => reviews.filter((r) => r.productSlug === product.slug),
    [reviews, product.slug]
  );

  const averageRating = useMemo(() => {
    if (productReviews.length === 0) return 0;
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / productReviews.length).toFixed(1));
  }, [productReviews]);

  const relatedProducts = useMemo(() => {
    return PRODUCTS.filter(
      (p) => p.id !== product.id && p.categorySlug === product.categorySlug
    ).slice(0, 5);
  }, [product.id, product.categorySlug]);

  const wishlistProduct = product.slug === "chui-jhal" ? { ...product, id: 19 } : product;
  const wishlisted = isWishlisted(wishlistProduct.id);

  const whatsappUrl = `https://api.whatsapp.com/send/?phone=8801313946402&text=${encodeURIComponent(
    `Hello Halal Sheba, I want to order: ${product.name} / ${product.weight || "Standard"} (Unit price: ${formatTaka(product.price)}, Qty: ${quantity}, Line total: ${formatTaka(product.price * quantity)})`
  )}`;

  const handleReviewSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    setReviewMessage("");
    try {
      const r = await api<{message:string}>('reviews', {
        method: 'POST',
        body: JSON.stringify({
          product_id: base.id,
          reference: reviewReference.trim() || undefined,
          phone: reviewPhone.trim(),
          author: reviewerName.trim(),
          rating,
          comment: comment.trim(),
        }),
      });
      setReviewMessage(r.message);
      setComment('');
      api<{id:number;author:string;rating:number;comment:string;created_at:string}[]>(`products/${base.id}/reviews`)
        .then(rows => setReviews(rows.map(rw => ({ ...rw, id: String(rw.id), productSlug: base.slug, createdAt: rw.created_at }))))
        .catch(() => {});
    } catch(err) {
      setReviewMessage((err as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-[1320px] px-3 sm:px-6 py-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-[13px] text-gray-500 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-[#f48721]">
          Home
        </Link>
        <span>&gt;</span>
        <Link
          href={`/collections/${product.categorySlug}`}
          className="hover:text-[#f48721]"
        >
          {product.category}
        </Link>
        <span>&gt;</span>
        <span className="text-[#222831] font-medium">{product.name}</span>
      </nav>

      {/* Main Product Panel */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.05)] grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Gallery */}
        <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
          {/* Vertical Thumbnails */}
          <div className="flex sm:flex-col gap-2.5 overflow-x-auto">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedImage(idx);
                  const vi=base.variants?.findIndex(v=>v.image===imgUrl)??-1;
                  if(vi>=0)setVariantIndex(vi);
                }}
                className={`h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl border-2 bg-[#fef4ea] overflow-hidden p-1 cursor-pointer transition-all ${
                  selectedImage === idx
                    ? "border-[#f48721] ring-2 ring-orange-100 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <SafeImage
                  src={imgUrl}
                  alt={`${product.name} view ${idx + 1}`}
                  className="h-full w-full object-contain"
                />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="relative flex-1 rounded-2xl border border-amber-100/60 bg-[#fef4ea] aspect-square flex items-center justify-center p-2 sm:p-4 overflow-hidden shadow-2xs">
            <SafeImage
              src={images[selectedImage] || product.image}
              alt={product.name}
              className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>

        {/* Right Info & Purchase Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <Link
                href={`/brand/${encodeURIComponent(product.brand)}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-3.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span>Brand:</span>
                <span className="text-[#f48721]">{product.brand}</span>
              </Link>

              <span className="text-xs font-bold text-[#16a34a] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                {product.inStock ? "In Stock • Ready to Ship" : "Out of Stock"}
              </span>
            </div>

            <h1 className="text-[22px] sm:text-[28px] font-black text-[#0f172a] leading-snug">
              {product.name}
            </h1>

            {/* Rating summary — no stars at all until a real review exists */}
            <div className="flex items-center gap-2">
              {productReviews.length > 0 ? (
                <>
                  <div className="flex items-center text-[#d97706]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className="h-4 w-4"
                        filled={i < Math.round(averageRating)}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("reviews")}
                    className="text-xs text-slate-500 hover:text-[#065f46] cursor-pointer"
                  >
                    ({productReviews.length} Customer{" "}
                    {productReviews.length === 1 ? "Review" : "Reviews"})
                  </button>
                </>
              ) : (
                <span className="text-xs text-slate-500">No reviews yet</span>
              )}
            </div>

            {/* Price Block */}
            <div className="flex items-baseline gap-3 flex-wrap py-3 border-y border-slate-100">
              <span className="text-[32px] font-black text-[#f48721]">
              {formatTaka(product.price)}
              </span>
              {product.regularPrice && (
                <span className="text-[20px] text-slate-400 line-through font-medium">
                  {formatTaka(product.regularPrice)}
                </span>
              )}
            </div>

            <p className="text-[15px] leading-relaxed text-slate-600">
              {product.shortDescription}
            </p>

            {!!base.variants?.length && <div className="space-y-2 pt-1"><span className="text-xs font-bold text-slate-700">প্যাক / সাইজ নির্বাচন করুন:</span><div className="flex flex-wrap gap-2">{base.variants.map((v,i)=><button key={v.id} type="button" aria-pressed={selected?.id===v.id} onClick={()=>{setVariantIndex(i);setSelectedImage(Math.max(0,images.indexOf(v.image||base.image)));}} className={"rounded-lg border px-3.5 py-2 text-xs font-bold "+(selected?.id===v.id?"border-orange-500 text-orange-500 bg-orange-50":"border-slate-200")}>{v.name} · {formatTaka(v.price)}{v.available===0?' — স্টক নেই':''}</button>)}</div></div>}

            {/* Quick specs */}
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-xs border border-slate-100">
              <div>
                <span className="text-slate-500 block mb-0.5">Net Weight / Pack</span>
                <span className="font-bold text-slate-800 text-[13px]">
                  {product.weight || "Standard Pack"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Origin</span>
                <span className="font-bold text-slate-800 text-[13px]">
                  {product.origin}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-sm font-bold text-slate-700">
                Quantity:
              </span>
              <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-10 w-10 flex items-center justify-center text-lg font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  -
                </button>
                <span className="h-10 min-w-[48px] flex items-center justify-center text-sm font-black text-slate-900 border-x border-slate-300">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-10 w-10 flex items-center justify-center text-lg font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => toggleWishlist(wishlistProduct)}
                className={`inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-colors ${
                  wishlisted ? "text-[#f48721]" : "text-slate-500 hover:text-[#f48721]"
                }`}
              >
                <HeartIcon className="h-4 w-4" filled={wishlisted} />
                <span>{wishlisted ? "Saved in Wishlist" : "Add to Wishlist"}</span>
              </button>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                
                onClick={() => addToCart(product, quantity, true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#065f46] bg-white py-3.5 px-5 text-[15px] font-bold text-[#065f46] hover:bg-emerald-50 transition-all shadow-xs cursor-pointer"
              >
                <CartIcon className="h-5 w-5 text-[#065f46]" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/checkout?buyNow=${encodeURIComponent(product.slug)}&variant=${selected?.id}&qty=${quantity}`
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f48721] hover:bg-[#ea580c] py-3.5 px-5 text-[16px] font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Buy Now</span>
              </button>
            </div>

            {/* WhatsApp & Hotline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] py-3 px-4 text-sm font-bold text-white shadow-xs transition-colors"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>Order on WhatsApp</span>
              </a>

              <a
                href="tel:+8801313946402"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e293b] hover:bg-[#0f172a] py-3 px-4 text-sm font-bold text-white shadow-xs transition-colors"
              >
                <PhoneIcon className="h-4 w-4 text-amber-400" />
                <span>Call for Order: 01313-946402</span>
              </a>
            </div>
          </div>

          {/* Trust Bar */}
          <div className="grid grid-cols-3 gap-3 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <span className="font-bold text-[#064e3b] block text-[13px] mb-0.5">100% Pure</span>
              Lab-Verified Quality
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <span className="font-bold text-[#064e3b] block text-[13px] mb-0.5">Cash on Delivery</span>
              Pay at Your Doorstep
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <span className="font-bold text-[#064e3b] block text-[13px] mb-0.5">Happy Return</span>
              48-Hour Easy Return
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description & Reviews */}
      <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === "description"
                ? "border-[#065f46] text-[#065f46] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === "reviews"
                ? "border-[#065f46] text-[#065f46] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Customer Reviews ({productReviews.length})
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === "description" ? (
            <div className="space-y-5 max-w-4xl">
              <h2 className="text-lg font-bold text-slate-900">
                {product.name} সম্পর্কে
              </h2>
              {product.descriptionSections ? (
                <div className="space-y-6">
                  {product.descriptionSections.map((section) => (
                    <section key={section.heading} className="space-y-2">
                      <h3 className="text-base font-bold text-slate-900">{section.heading}</h3>
                      {section.paragraphs.map((paragraph, idx) => (
                        <p key={idx} className="text-sm leading-7 text-slate-600">{paragraph}</p>
                      ))}
                    </section>
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-slate-600">{product.shortDescription}</p>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2.5">
                      {product.slug === "kalojira-modhu" ? "🍯 কালোজিরা ফুলের RAW মধুর বৈশিষ্ট্য" : "পণ্যের বৈশিষ্ট্য"}
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
                      {product.highlights.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                </>
              )}

              <div className="overflow-x-auto pt-2">
                <table className="w-full max-w-xl text-sm border border-slate-200 rounded-xl overflow-hidden">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="bg-slate-50 px-4 py-3 font-semibold text-slate-800 w-40">
                        ব্র্যান্ড
                      </td>
                      <td className="px-4 py-3 text-slate-600">{product.brand}</td>
                    </tr>
                    <tr>
                      <td className="bg-slate-50 px-4 py-3 font-semibold text-slate-800">
                        ক্যাটাগরি
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {product.category}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-50 px-4 py-3 font-semibold text-slate-800">
                        প্যাকের ওজন
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {product.weight || "Standard"}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-50 px-4 py-3 font-semibold text-slate-800">
                        উৎপত্তি ও সংরক্ষণ
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {product.origin} — Store in a cool, dry place away from direct sunlight.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Review Summary & List */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-5 rounded-xl bg-slate-50 p-5 border border-slate-100">
                  <div className="text-center px-3">
                    <span className="block text-3xl font-extrabold text-[#065f46]">
                      {averageRating}
                    </span>
                    <div className="flex items-center justify-center text-[#d97706] mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className="h-3.5 w-3.5"
                          filled={i < Math.round(averageRating)}
                        />
                      ))}
                    </div>
                    <span className="block text-xs text-gray-500 mt-1">
                      {productReviews.length}{" "}reviews
                    </span>
                  </div>
                  <div className="flex-1 space-y-1.5 text-xs">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = productReviews.filter(
                        (r) => r.rating === star
                      ).length;
                      const pct =
                        productReviews.length > 0
                          ? (count / productReviews.length) * 100
                          : star === 5
                          ? 100
                          : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="w-8 font-medium">{star} ★</span>
                          <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className="h-full bg-[#f48721]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-5 text-right text-gray-500">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {productReviews.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No customer reviews yet. Be the first to review{' '}{product.name}!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {productReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="rounded-lg border border-gray-200 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-[#222831]">
                            {rev.author}
                          </span>
                          <span className="text-xs text-gray-400">
                            {rev.createdAt}
                          </span>
                        </div>
                        <div className="flex items-center text-[#f48721] my-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon
                              key={i}
                              className="h-3.5 w-3.5"
                              filled={i < rev.rating}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-[#4b5563]">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Review Form */}
              <form
                onSubmit={handleReviewSubmit}
                className="lg:col-span-5 rounded-xl border border-gray-200 p-5 bg-[#f8fafc] space-y-4 h-fit"
              >
                <h3 className="text-base font-bold text-[#222831]">
                  Write a Review
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-[#222831] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#f48721]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#222831] mb-1">
                    Rating
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#f48721]"
                  >
                    <option value={5}>5 Stars — Excellent</option>
                    <option value={4}>4 Stars — Good</option>
                    <option value={3}>3 Stars — Average</option>
                    <option value={2}>2 Stars — Fair</option>
                    <option value={1}>1 Star — Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#222831] mb-1">
                    Your Review
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with purity, taste, and packaging..."
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#f48721]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#222831] mb-1">
                    Order Phone Number <span className="text-[#f48721]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={reviewPhone}
                    onChange={(e) => setReviewPhone(e.target.value)}
                    placeholder="অর্ডারে ব্যবহৃত মোবাইল নম্বর (e.g. 01716333670)"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#f48721]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Order Reference / ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={reviewReference}
                    onChange={(e) => setReviewReference(e.target.value)}
                    placeholder="অর্ডার রেফারেন্স বা আইডি (যদি থাকে)"
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#f48721]"
                  />
                </div>
                {reviewMessage && (
                  <div className={`p-3 rounded-lg text-xs font-semibold ${reviewMessage.includes('ধন্যবাদ') || reviewMessage.includes('সফল') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {reviewMessage}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full rounded-md bg-[#f48721] hover:bg-[#df7412] py-2.5 text-sm font-bold text-white transition-colors cursor-pointer"
                >
                  Submit Review
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-2">
          <div className="flex items-center justify-between mb-5 border-b border-gray-200 pb-2.5">
            <h2 className="text-[20px] font-semibold text-[#222831]">
              Related Products
            </h2>
            <Link
              href={`/collections/${product.categorySlug}`}
              className="text-xs font-bold uppercase text-[#f48721] hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
