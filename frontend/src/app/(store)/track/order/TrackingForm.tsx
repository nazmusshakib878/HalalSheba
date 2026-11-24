"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

function formatBdDate(dateStr: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!dateStr) return '—';
  let iso = String(dateStr).trim();
  if (!iso.includes('T') && iso.includes(' ')) iso = iso.replace(' ', 'T');
  if (!iso.endsWith('Z') && !/[+-]\d{2}(?::?\d{2})?$/.test(iso)) iso += 'Z';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleString('bn-BD', {
    timeZone: 'Asia/Dhaka',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options,
  });
}

interface OrderItem {
  id: number;
  name: string;
  variant: string;
  quantity: number;
  price: number;
}

interface TrackedOrder {
  id: number;
  reference: string;
  status: string;
  courier?: string | null;
  tracking_number?: string | null;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  address: string;
  district: string;
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
  items: OrderItem[];
}

interface TrackResponse {
  orders: TrackedOrder[];
  count: number;
  id?: number;
  reference?: string;
  status?: string;
  courier?: string | null;
  tracking_number?: string | null;
  subtotal?: number;
  delivery_charge?: number;
  total?: number;
  address?: string;
  district?: string;
  created_at?: string;
  customer_name?: string;
  customer_phone?: string;
  items?: OrderItem[];
}

const STATUS_STEPS = [
  { key: "new", label: "অর্ডার গৃহীত", desc: "অর্ডার সফলভাবে সিস্টেমে যুক্ত হয়েছে" },
  { key: "confirmed", label: "কনফার্মড", desc: "অর্ডার যাচাই ও নিশ্চিত করা হয়েছে" },
  { key: "processing", label: "প্রসেসিং", desc: "প্যাকিং ও ডেলিভারির জন্য প্রস্তুত হচ্ছে" },
  { key: "shipped", label: "ডেলিভারিতে আছে", desc: "কুরিয়ার সার্ভিসে হস্তান্তর করা হয়েছে" },
  { key: "delivered", label: "ডেলিভারি সম্পন্ন", desc: "পণ্য গ্রাহকের হাতে পৌঁছে দেওয়া হয়েছে" },
];

function getStatusIndex(status: string): number {
  switch (status.toLowerCase()) {
    case "new":
    case "pending":
      return 0;
    case "confirmed":
      return 1;
    case "processing":
    case "packed":
      return 2;
    case "shipped":
    case "out_for_delivery":
      return 3;
    case "delivered":
      return 4;
    default:
      return 0;
  }
}

function getStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "delivered") {
    return { bg: "bg-emerald-100 text-emerald-800 border-emerald-300", label: "ডেলিভারি সম্পন্ন" };
  }
  if (s === "shipped" || s === "out_for_delivery") {
    return { bg: "bg-purple-100 text-purple-800 border-purple-300", label: "ডেলিভারিতে আছে" };
  }
  if (s === "processing" || s === "packed") {
    return { bg: "bg-blue-100 text-blue-800 border-blue-300", label: "প্যাকিং চলছে" };
  }
  if (s === "confirmed") {
    return { bg: "bg-emerald-100 text-emerald-800 border-emerald-300", label: "অর্ডার কনফার্মড" };
  }
  if (s === "cancelled") {
    return { bg: "bg-red-100 text-red-800 border-red-300", label: "বাতিল করা হয়েছে" };
  }
  if (s === "returned" || s === "refunded") {
    return { bg: "bg-orange-100 text-orange-800 border-orange-300", label: "ফেরত / রিফান্ড" };
  }
  return { bg: "bg-amber-100 text-amber-800 border-amber-300", label: "অর্ডার গৃহীত (নতুন)" };
}

export function TrackingForm() {
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() && !reference.trim()) {
      setError("অনুগ্রহ করে মোবাইল নম্বর অথবা অর্ডার নম্বর লিখুন।");
      return;
    }

    setBusy(true);
    setError("");
    setOrders([]);
    setSelectedIndex(0);

    try {
      const data = await api<TrackResponse>("track", {
        method: "POST",
        body: JSON.stringify({
          phone: phone.trim() || undefined,
          reference: reference.trim() || undefined,
        }),
      });

      const list = data.orders && data.orders.length > 0 ? data.orders : [data as unknown as TrackedOrder];
      setOrders(list);
      setHasSearched(true);
    } catch (err) {
      setError((err as Error).message || "অর্ডারটি পাওয়া যায়নি। অনুগ্রহ করে সঠিক তথ্য দিন।");
      setHasSearched(true);
    } finally {
      setBusy(false);
    }
  };

  const currentOrder = orders[selectedIndex];
  const stepIndex = currentOrder ? getStatusIndex(currentOrder.status) : 0;
  const isCancelled = currentOrder && ["cancelled", "returned", "refunded"].includes(currentOrder.status.toLowerCase());

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 mb-1">
            📦 লাইভ অর্ডার ট্র্যাকিং
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#222831]">
            Track Your Order
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto">
            অর্ডারের রেফারেন্স নম্বর ভুলে গেছেন? কোনো সমস্যা নেই! শুধুমাত্র আপনার{" "}
            <span className="font-semibold text-emerald-700">মোবাইল নম্বর</span> লিখেই আপনার অর্ডারের বর্তমান অবস্থা দেখুন।
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-7 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                মোবাইল নম্বর (Phone Number) <span className="text-[#f48721]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  📞
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: 01716333670"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-[#f48721] focus:ring-2 focus:ring-[#f48721]/20 outline-none text-base transition-all"
                />
              </div>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                ✓ শুধু মোবাইল নম্বর দিয়েই অর্ডার খুঁজে পাওয়া যাবে
              </p>
            </div>

            <div className="pt-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                অর্ডার নম্বর বা রেফারেন্স (Order ID / Reference — ঐচ্ছিক)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  #
                </span>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="যেমন: 10 বা রেফারেন্স কোড (যদি জানা থাকে)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#f48721] focus:ring-1 focus:ring-[#f48721] outline-none text-sm text-gray-700 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer text-base"
            >
              {busy ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>অনুসন্ধান করা হচ্ছে…</span>
                </>
              ) : (
                <>
                  <span>অর্ডার ট্র্যাক করুন</span>
                  <span>→</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
                <span className="text-base shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>

        {/* Results Section */}
        {orders.length > 0 && currentOrder && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Multiple Orders Selector */}
            {orders.length > 1 && (
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  আপনার {orders.length}টি অর্ডার পাওয়া গেছে (অর্ডার সিলেক্ট করুন):
                </p>
                <div className="flex flex-wrap gap-2">
                  {orders.map((ord, idx) => {
                    const badge = getStatusBadge(ord.status);
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={ord.id || ord.reference}
                        onClick={() => setSelectedIndex(idx)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all text-left flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                            : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                        }`}
                      >
                        <span className="font-bold">অর্ডার #{ord.id || ord.reference.slice(0, 8)}</span>
                        <span>•</span>
                        <span>৳{(ord.total / 100).toLocaleString("en-IN")}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            isSelected ? "bg-white/20 text-white" : badge.bg
                          }`}
                        >
                          {badge.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Order Card */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
              {/* Card Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded uppercase">
                      Order #{currentOrder.id || currentOrder.reference.slice(0, 8)}
                    </span>
                    <span className="text-xs text-emerald-200">
                      {formatBdDate(currentOrder.created_at, { month: 'long' })}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black mt-1">
                    মোট প্রদেয়: ৳{(currentOrder.total / 100).toLocaleString("en-IN")} BDT
                  </h2>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      getStatusBadge(currentOrder.status).bg
                    }`}
                  >
                    {getStatusBadge(currentOrder.status).label}
                  </span>
                  <button
                    onClick={() => handleCopy(currentOrder.reference)}
                    className="text-[11px] text-emerald-200 hover:text-white underline cursor-pointer"
                  >
                    {copied ? "✓ কপি হয়েছে!" : "রেফারেন্স কোড কপি করুন"}
                  </button>
                </div>
              </div>

              {/* Status Stepper (if not cancelled) */}
              {!isCancelled ? (
                <div className="p-5 sm:p-7 border-b border-gray-100 bg-gray-50/50">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                    অর্ডার প্রগ্রেস (Live Status)
                  </p>
                  <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200 -z-0 hidden sm:block">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-500"
                        style={{ width: `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-2">
                      {STATUS_STEPS.map((step, idx) => {
                        const isDone = idx <= stepIndex;
                        const isCurrent = idx === stepIndex;
                        return (
                          <div
                            key={step.key}
                            className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-2 sm:p-0 rounded-lg ${
                              isCurrent ? "bg-emerald-50 sm:bg-transparent" : ""
                            }`}
                          >
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-all ${
                                isDone
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-gray-200 text-gray-500"
                              } ${isCurrent ? "ring-4 ring-emerald-200 scale-110" : ""}`}
                            >
                              {isDone ? "✓" : idx + 1}
                            </div>
                            <div className="sm:mt-1">
                              <p
                                className={`text-xs font-bold ${
                                  isCurrent
                                    ? "text-emerald-800"
                                    : isDone
                                    ? "text-gray-800"
                                    : "text-gray-400"
                                }`}
                              >
                                {step.label}
                              </p>
                              <p className="text-[10px] text-gray-500 hidden sm:block">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-red-50 border-b border-red-200 text-red-800 text-sm font-semibold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>এই অর্ডারটি বাতিল বা ফেরত সম্পন্ন হয়েছে। বিস্তারিত জানতে সাপোর্টে যোগাযোগ করুন।</span>
                </div>
              )}

              {/* Order Info & Delivery Details */}
              <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Delivery Information */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    শিপিং ও ডেলিভারি তথ্য
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="text-gray-400 font-medium">গ্রাহকের নাম:</span>{" "}
                      <span className="font-semibold text-gray-900">
                        {currentOrder.customer_name || "সম্মানিত গ্রাহক"}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-400 font-medium">মোবাইল নম্বর:</span>{" "}
                      <span className="font-semibold text-gray-900 font-mono">
                        {currentOrder.customer_phone || phone}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-400 font-medium">ঠিকানা:</span>{" "}
                      <span>{currentOrder.address}</span>
                    </p>
                    <p>
                      <span className="text-gray-400 font-medium">জেলা:</span>{" "}
                      <span className="font-medium text-emerald-800">{currentOrder.district}</span>
                    </p>
                    <div className="pt-2 border-t border-gray-200 text-xs">
                      <span className="text-gray-500">কুরিয়ার স্ট্যাটাস:</span>{" "}
                      <span className="font-semibold text-gray-800">
                        {currentOrder.courier
                          ? `${currentOrder.courier} ${currentOrder.tracking_number ? `(#${currentOrder.tracking_number})` : ""}`
                          : "হ্যান্ডওভারের অপেক্ষায় / কুরিয়ার প্রক্রিয়াধীন"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Payment Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    পেমেন্ট ও হিসাব বিবরণী
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">পণ্য সাবটোটাল:</span>
                      <span className="font-medium">৳{(currentOrder.subtotal / 100).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">ডেলিভারি চার্জ:</span>
                      <span className="font-medium">৳{(currentOrder.delivery_charge / 100).toLocaleString("en-IN")}</span>
                    </div>
                    {currentOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>ছাড় (Discount):</span>
                        <span>-৳{(currentOrder.discount / 100).toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-base text-[#222831]">
                      <span>সর্বমোট প্রদেয়:</span>
                      <span className="text-emerald-700">
                        ৳{(currentOrder.total / 100).toLocaleString("en-IN")} BDT
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 pt-1">
                      পেমেন্ট পদ্ধতি:{" "}
                      <span className="font-semibold text-gray-800 uppercase">
                        {currentOrder.payment_method === "cod" ? "ক্যাশ অন ডেলিভারি (COD)" : currentOrder.payment_method}
                      </span>{" "}
                      ({currentOrder.payment_status === "paid" ? "পরিশোধিত" : "বকেয়া"})
                    </p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              {currentOrder.items && currentOrder.items.length > 0 && (
                <div className="px-5 sm:px-7 pb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    অর্ডারকৃত পণ্যসমূহ ({currentOrder.items.length}টি আইটেম)
                  </h3>
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                    {currentOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-white flex items-center justify-between text-sm gap-3 hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            সাইজ / ওজন: <span className="font-medium text-gray-700">{item.variant}</span> | পরিমাণ:{" "}
                            <span className="font-medium text-gray-700">{item.quantity}টি</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-700">
                            ৳{((item.price * item.quantity) / 100).toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            ৳{(item.price / 100).toLocaleString("en-IN")} x {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Support & Action Footer */}
              <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span>📞 যেকোনো সাহায্যে কল করুন:</span>
                  <a
                    href="tel:01716333670"
                    className="font-bold text-emerald-700 hover:underline font-mono text-sm"
                  >
                    01716-333670
                  </a>
                </div>

                <Link
                  href="/"
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:border-gray-400 font-semibold text-gray-700 transition-colors"
                >
                  ← শপিং চালিয়ে যান
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Empty Search Suggestion */}
        {!hasSearched && (
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 text-xs text-emerald-900 flex items-start gap-2.5">
            <span className="text-base shrink-0">💡</span>
            <div>
              <p className="font-bold mb-0.5">সহজ ট্র্যাকিং সুবিধা:</p>
              <p className="text-emerald-800/90 leading-relaxed">
                চেকআউট করার সময় যে মোবাইল নম্বর দিয়েছেন, সেই নম্বরটি উপরের বক্সে লিখে{" "}
                <span className="font-semibold">"অর্ডার ট্র্যাক করুন"</span> বাটনে চাপ দিন। আপনার অর্ডারের বর্তমান অবস্থা, পণ্য বিবরণ এবং কুরিয়ার স্ট্যাটাস সাথে সাথে দেখতে পাবেন।
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
