"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CustomerOrder, useStore } from "@/context/StoreContext";
import { formatTakaDecimals } from "@/data/catalog";
import { SafeImage } from "@/components/SafeImage";

// 3D Isometric Cardboard Box Icon matching reference screenshot
function ParcelBoxIcon({ className = "h-14 w-14" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      {/* Top Left Flap */}
      <polygon points="32,8 10,19 22,25 44,14" fill="#D99B61" />
      {/* Top Right Flap */}
      <polygon points="32,8 44,14 54,19 42,25" fill="#BF7F44" />
      {/* Seam Tape Top */}
      <polygon points="28,10 36,14 36,22 28,18" fill="#F48721" opacity="0.9" />
      {/* Left Face */}
      <polygon points="10,19 32,30 32,56 10,45" fill="#C9884B" />
      {/* Right Face */}
      <polygon points="32,30 54,19 54,45 32,56" fill="#A86A32" />
      {/* Center Vertical Tape */}
      <polygon points="30,30 34,30 34,56 30,56" fill="#F48721" opacity="0.9" />
      {/* Bottom subtle shadow */}
      <ellipse cx="32" cy="58" rx="20" ry="3.5" fill="#000000" opacity="0.08" />
    </svg>
  );
}

const STATUS_STEPS: CustomerOrder["status"][] = [
  "Order Placed",
  "Confirmed",
  "Packed",
  "Out for Delivery",
  "Delivered",
];

function TrackOrderInner() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const { findOrder, orders } = useStore();

  const [searchInput, setSearchInput] = useState(initialId);
  const [matchedOrder, setMatchedOrder] = useState<CustomerOrder | undefined>(() =>
    initialId ? findOrder(initialId) : undefined
  );
  const [hasSearched, setHasSearched] = useState(Boolean(initialId));

  useEffect(() => {
    if (initialId) {
      setSearchInput(initialId);
      setMatchedOrder(findOrder(initialId));
      setHasSearched(true);
    }
  }, [initialId, findOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const result = findOrder(searchInput.trim());
    setMatchedOrder(result);
  };

  const activeStepIdx = matchedOrder ? STATUS_STEPS.indexOf(matchedOrder.status) : 0;

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-8 sm:py-12 min-h-[75vh]">
      {/* Top Header Row matching user's screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-4 border-b border-gray-100">
        <div>
          <span className="text-xs font-bold text-[#f48721] tracking-wider uppercase block mb-1">
            + LIVE ORDER TRACKING
          </span>
          <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time updates on your shipment progress
          </p>
        </div>

        {/* Search Input & Button */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full md:w-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter order number..."
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#f48721] transition-colors w-full md:w-64 placeholder-gray-400"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#f48721] hover:bg-[#df7412] px-6 py-2.5 text-sm font-bold text-white transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Content Area */}
      {matchedOrder ? (
        /* Order Found: Show detailed tracking progress card */
        <div className="rounded-2xl bg-white border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Order Tracking Reference
              </span>
              <h2 className="text-2xl font-bold text-[#f48721] mt-0.5">
                {matchedOrder.orderId}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block mb-1">Current Status</span>
              <span className="inline-block rounded-full bg-[#e7f6ec] px-3.5 py-1 text-xs font-bold text-[#088d2d]">
                ● {matchedOrder.status}
              </span>
            </div>
          </div>

          {/* 5-step progress tracker */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {STATUS_STEPS.map((step, idx) => {
              const done = idx <= activeStepIdx;
              return (
                <div
                  key={step}
                  className={`rounded-xl border p-3.5 text-center transition-all ${
                    done
                      ? "border-[#f48721] bg-[#fffaf5] shadow-2xs"
                      : "border-gray-200 bg-gray-50/70"
                  }`}
                >
                  <div
                    className={`mx-auto mb-2 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      done
                        ? "bg-[#f48721] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {done ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      done ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Delivery & Items Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Delivery Info */}
            <div className="rounded-xl bg-[#f8fafc] border border-gray-100 p-5 space-y-2 text-sm">
              <h3 className="font-bold text-gray-800 text-base mb-3 border-b border-gray-200 pb-2">
                Shipping Destination
              </h3>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer Name:</span>
                <span className="font-semibold text-gray-800">{matchedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="font-semibold text-gray-800">{matchedOrder.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Address:</span>
                <span className="font-semibold text-gray-800 text-right max-w-[240px]">
                  {matchedOrder.address}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-500">Payment:</span>
                <span className="font-semibold uppercase text-gray-800">
                  {matchedOrder.paymentMethod === "cod"
                    ? "Cash On Delivery"
                    : matchedOrder.paymentMethod}
                </span>
              </div>
            </div>

            {/* Items Summary */}
            <div className="rounded-xl bg-[#f8fafc] border border-gray-100 p-5 space-y-2.5 text-sm">
              <h3 className="font-bold text-gray-800 text-base mb-3 border-b border-gray-200 pb-2">
                Parcel Contents
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {matchedOrder.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-8 w-8 rounded border border-gray-200 bg-white p-0.5 shrink-0 overflow-hidden">
                        <SafeImage
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <span className="font-medium text-gray-800 truncate">
                        {item.name} × {item.quantity}
                      </span>
                    </div>
                    <span className="font-bold text-gray-800 shrink-0 ml-2">
                      ৳{formatTakaDecimals(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 font-bold text-base">
                <span>Total Amount</span>
                <span className="text-[#f48721]">
                  ৳{formatTakaDecimals(matchedOrder.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Order Not Found (or Initial Empty State): Centered Card exactly matching screenshot */
        <div className="flex justify-center items-center py-6 sm:py-12">
          <div className="w-full max-w-[480px] rounded-2xl bg-white border border-gray-100 shadow-sm p-8 sm:p-12 text-center flex flex-col items-center">
            {/* 3D Parcel Box Icon */}
            <div className="mb-4">
              <ParcelBoxIcon className="h-16 w-16" />
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-[22px] font-bold text-gray-900 mb-2">
              Order Not Found
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6 max-w-xs">
              We couldn&apos;t find an order with that number. Please double-check and try again.
            </p>

            {/* Back to Shopping Button */}
            <Link
              href="/collections/all-products"
              className="rounded-lg bg-[#f48721] hover:bg-[#df7412] px-8 py-2.5 text-sm font-bold text-white transition-all shadow-2xs hover:shadow-xs cursor-pointer tracking-wide"
            >
              Back to Shopping
            </Link>
          </div>
        </div>
      )}

      {/* Suggested Recent Orders demo chips */}
      {orders.length > 0 && (
        <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
          <span>Demo orders available to test:</span>
          {orders.map((o) => (
            <button
              key={o.orderId}
              type="button"
              onClick={() => {
                setSearchInput(o.orderId);
                setMatchedOrder(o);
                setHasSearched(true);
              }}
              className="rounded-md bg-white border border-gray-200 px-2.5 py-1 font-semibold text-gray-700 hover:border-[#f48721] hover:text-[#f48721] transition-colors cursor-pointer shadow-2xs"
            >
              {o.orderId}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1240px] p-8 text-center">Loading tracker...</div>}>
      <TrackOrderInner />
    </Suspense>
  );
}
