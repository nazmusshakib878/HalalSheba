"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PRODUCTS, formatTakaDecimals } from "@/data/catalog";
import { CustomerOrder, useStore } from "@/context/StoreContext";
import { SafeImage } from "@/components/SafeImage";

// Bangladesh Districts
const DISTRICTS = [
  "Dhaka",
  "Satkhira",
  "Chattogram",
  "Gazipur",
  "Narayanganj",
  "Khulna",
  "Rajshahi",
  "Sylhet",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Cumilla",
  "Bogura",
  "Jessore",
  "Kushtia",
  "Faridpur",
  "Pabna",
  "Tangail",
  "Cox's Bazar",
  "Feni",
  "Noakhali",
  "Brahmanbaria",
  "Dinajpur",
  "Jamalpur",
  "Sirajganj",
  "Naogaon",
  "Manikganj",
  "Munshiganj",
  "Narsingdi",
  "Bagerhat",
  "Chuadanga",
  "Jhenaidah",
  "Magura",
  "Meherpur",
  "Narail",
  "Other Districts",
];

// District Thanas / Upazilas mapping (common examples)
const THANAS: Record<string, string[]> = {
  Dhaka: ["Dhanmondi", "Gulshan", "Banani", "Mirpur", "Uttara", "Mohammadpur", "Badda", "Motijheel", "Rampura", "Khilgaon", "Jatrabari", "Mohakhali", "Tejgaon", "Old Dhaka"],
  Satkhira: ["Satkhira Sadar", "Kalaroa", "Tala", "Debhata", "Kaliganj", "Assasuni", "Shyamnagar"],
  Chattogram: ["Kotwali", "Panchlaish", "Halishahar", "Pahartali", "Bakalia", "Double Mooring", "Hathazari", "Sitakunda"],
  Khulna: ["Khulna Sadar", "Sonadanga", "Khalishpur", "Daulatpur", "Khan Jahan Ali", "Rupsha", "Dumuria"],
  Gazipur: ["Gazipur Sadar", "Tongi", "Kaliakair", "Kapasia", "Sreepur", "Kaliganj"],
};

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function CashIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" />
      <path d="M6 12h.01M18 12h.01" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

function CardPaymentIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" />
      <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" />
      <circle cx="6" cy="15" r="1" fill="currentColor" />
      <circle cx="9" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}

function BkashIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <path d="M4 14l16-8 16 12-14 4L4 14z" fill="#E2136E" />
      <path d="M22 22l14-4 8 16-16-6-6-6z" fill="#C50058" />
      <path d="M28 28l16 6-12 10-10-8 6-8z" fill="#E2136E" />
      <path d="M22 36l10 8-16 2 6-10z" fill="#9B0044" />
    </svg>
  );
}

function CheckoutInner() {
  const searchParams = useSearchParams();
  const buyNowSlug = searchParams.get("buyNow");
  const buyNowQty = Math.max(1, Number(searchParams.get("qty") || "1") || 1);

  const { cart, clearCart, placeOrder, user, showToast, updateQuantity, removeFromCart } = useStore();

  const buyNowProduct = useMemo(
    () => (buyNowSlug ? PRODUCTS.find((p) => p.slug === buyNowSlug) : undefined),
    [buyNowSlug]
  );

  const [buyNowCount, setBuyNowCount] = useState(buyNowQty);

  const checkoutItems = useMemo(() => {
    if (buyNowProduct) {
      return [
        {
          productId: buyNowProduct.id,
          slug: buyNowProduct.slug,
          name: buyNowProduct.name,
          price: buyNowProduct.price,
          regularPrice: buyNowProduct.regularPrice,
          image: buyNowProduct.image,
          weight: buyNowProduct.weight,
          quantity: buyNowCount,
        },
      ];
    }
    return cart;
  }, [buyNowProduct, buyNowCount, cart]);

  // Form State
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState(user?.address || "");
  const [district, setDistrict] = useState("Dhaka");
  const [thana, setThana] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online" | "bkash">("cod");

  // Coupon Accordion
  const [couponOpen, setCouponOpen] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  // Terms agreement checkbox
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Completed Order state
  const [completedOrder, setCompletedOrder] = useState<CustomerOrder | null>(null);

  // Delivery Charge calculation
  const deliveryCost = useMemo(() => {
    if (district.toLowerCase() === "dhaka") return 60;
    return 120;
  }, [district]);

  // Subtotal calculation
  const subtotal = useMemo(() => {
    return checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [checkoutItems]);

  // Discount calculation
  const discount = useMemo(() => {
    if (appliedPromo === "HALAL10" || appliedPromo === "HALALBAZAR10") {
      return Math.round(subtotal * 0.1);
    }
    if (appliedPromo === "HONEY200" && subtotal >= 1000) {
      return 200;
    }
    return 0;
  }, [appliedPromo, subtotal]);

  const total = Math.max(0, subtotal + deliveryCost - discount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === "HALAL10" || code === "HALALBAZAR10" || code === "HONEY200") {
      setAppliedPromo(code);
      showToast(`Coupon "${code}" applied successfully!`);
    } else {
      showToast("Try coupon HALAL10 (10% off) or HONEY200 (৳200 off ৳1000+)", "info");
    }
  };

  const handleItemQtyChange = (productId: number, newQty: number) => {
    if (buyNowProduct) {
      if (newQty <= 0) return;
      setBuyNowCount(newQty);
    } else {
      updateQuantity(productId, newQty);
    }
  };

  const handleItemRemove = (productId: number) => {
    if (buyNowProduct) {
      window.location.href = "/";
    } else {
      removeFromCart(productId);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0) {
      showToast("Your cart is empty!", "info");
      return;
    }
    if (!customerName.trim()) {
      showToast("Please enter your full name", "info");
      return;
    }
    if (!phone.trim()) {
      showToast("Please enter your mobile phone number", "info");
      return;
    }
    if (!address.trim()) {
      showToast("Please enter your complete delivery address", "info");
      return;
    }
    if (!agreedTerms) {
      showToast("Please agree to the terms and privacy policy", "info");
      return;
    }

    const area = district.toLowerCase() === "dhaka" ? "inside-dhaka" : "outside-dhaka";

    const order = placeOrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      area,
      address: `${address.trim()}${thana ? ", " + thana : ""}, ${district}`,
      note: note.trim() || undefined,
      paymentMethod: paymentMethod === "online" ? "sslcommerz" : paymentMethod,
      items: checkoutItems,
      subtotal,
      deliveryCharge: deliveryCost,
      discount,
      total,
    });

    if (!buyNowProduct) {
      clearCart();
    }
    setCompletedOrder(order);
    showToast(`Order ${order.orderId} placed successfully!`);
  };

  if (completedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-xl bg-white border border-gray-200 p-8 text-center shadow-sm space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-[#e7f6ec] text-[#088d2d] flex items-center justify-center text-3xl font-bold">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-[#222831]">
            Thank You! Your Order Has Been Placed
          </h1>
          <p className="text-sm text-gray-600">
            Your order reference is{" "}
            <span className="font-bold text-[#f48721] text-base">
              {completedOrder.orderId}
            </span>
            . Our team will verify and dispatch your parcel shortly.
          </p>

          <div className="rounded-lg bg-[#f8fafc] border border-gray-200 p-4 text-left text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer:</span>
              <span className="font-semibold text-[#222831]">
                {completedOrder.customerName} ({completedOrder.phone})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Address:</span>
              <span className="font-semibold text-[#222831] text-right">
                {completedOrder.address}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment:</span>
              <span className="font-semibold uppercase text-[#222831]">
                {completedOrder.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : completedOrder.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-1.5">
              <span className="text-gray-500">Total Payable:</span>
              <span className="font-bold text-[#f48721]">
                {formatTakaDecimals(completedOrder.total)} BDT
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              href={`/track/order?id=${encodeURIComponent(completedOrder.orderId)}`}
              className="rounded-md bg-[#041f1e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#08312f]"
            >
              Track This Order
            </Link>
            <Link
              href="/"
              className="rounded-md bg-[#f48721] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#df7412]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 text-center">
        <div className="rounded-xl bg-white border border-gray-200 p-8 shadow-xs">
          <h1 className="text-xl font-bold text-[#222831]">
            Your cart is empty
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Add pure honey, ghee, mustard oil, or dates before proceeding to checkout.
          </p>
          <Link
            href="/collections/all-products"
            className="mt-5 inline-block rounded-md bg-[#f48721] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#df7412]"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const availableThanas = THANAS[district] || [];

  return (
    <div className="mx-auto max-w-[1240px] px-3 sm:px-6 py-6 font-sans">
      {/* Centered Title & Breadcrumb */}
      <div className="text-center mb-6">
        <h1 className="text-[26px] sm:text-[28px] font-bold text-[#1f2937] tracking-tight">
          Checkout
        </h1>
        <nav className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1.5">
          <Link href="/" className="hover:text-[#f48721]">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-[#f48721] font-medium">Checkout</span>
        </nav>
      </div>

      {/* Top Banner: Login / Register Prompt */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <span className="text-[13.5px] text-gray-700 font-medium">
          Have any account? please login or register
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded bg-[#f48721] hover:bg-[#df7412] px-4 py-1.5 text-xs font-semibold text-white transition-colors shadow-2xs"
          >
            Register
          </Link>
        </div>
      </div>

      {/* Main 2-Column Checkout Form */}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (col-span-7): Order Review, Shipping Address, Billing Address */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Order Review */}
          <div className="space-y-3">
            <h2 className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
              <span className="text-[#f48721] font-black text-lg">|</span>
              <span>Order review</span>
            </h2>

            <div className="space-y-2.5">
              {checkoutItems.map((item) => (
                <div
                  key={item.productId}
                  className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-md border border-gray-200 bg-[#fef4ea] p-1 shrink-0 overflow-hidden">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-semibold text-gray-800 truncate">
                        {item.name}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <span>Qty:</span>
                          <div className="inline-flex items-center rounded border border-gray-200 bg-gray-50">
                            <button
                              type="button"
                              onClick={() => handleItemQtyChange(item.productId, item.quantity - 1)}
                              className="h-6 w-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer text-xs"
                            >
                              -
                            </button>
                            <span className="px-2 font-bold text-gray-800 text-xs">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleItemQtyChange(item.productId, item.quantity + 1)}
                              className="h-6 w-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <span className="font-bold text-gray-800">
                          ৳{formatTakaDecimals(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Red Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleItemRemove(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer shrink-0"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="space-y-3 pt-2">
            <h2 className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
              <span className="text-[#f48721] font-black text-lg">|</span>
              <span>Shipping Address</span>
            </h2>

            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 space-y-3.5 shadow-2xs">
              {/* Row 1: Name and Phone with Bangladesh Prefix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your Full Name *"
                  className="w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#f48721] transition-colors"
                />

                <div className="relative flex items-center rounded-md border border-gray-300 bg-white focus-within:border-[#f48721] transition-colors">
                  <div className="flex items-center gap-1 px-3 border-r border-gray-200 text-xs font-semibold text-gray-600 shrink-0 select-none bg-gray-50/80 h-full rounded-l-md">
                    <span>🇧🇩</span>
                    <span>88</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017********"
                    className="w-full px-3 py-2.5 text-sm outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Row 2: Email (Optional) */}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com (Optional)"
                  className="w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#f48721] transition-colors"
                />
              </div>

              {/* Row 3: Street Address */}
              <div>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ex: House no. / building / street / area"
                  className="w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#f48721] transition-colors"
                />
              </div>

              {/* Row 4: Select District & Select Thana */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="relative">
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setThana("");
                    }}
                    className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-[#f48721] transition-colors cursor-pointer"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d} {d === "Dhaka" ? "(Delivery ৳60)" : "(Delivery ৳120)"}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    ▼
                  </span>
                </div>

                <div className="relative">
                  {availableThanas.length > 0 ? (
                    <select
                      value={thana}
                      onChange={(e) => setThana(e.target.value)}
                      className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-[#f48721] transition-colors cursor-pointer"
                    >
                      <option value="">Select Thana (Optional)</option>
                      {availableThanas.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={thana}
                      onChange={(e) => setThana(e.target.value)}
                      placeholder="Select Thana / Area (Optional)"
                      className="w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#f48721]"
                    />
                  )}
                  {availableThanas.length > 0 && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                      ▼
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Billing Address */}
          <div className="space-y-3 pt-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between shadow-2xs">
              <h2 className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
                <span className="text-[#f48721] font-black text-lg">|</span>
                <span>Billing Address</span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-600 font-medium select-none">
                <span className="h-4 w-4 rounded-full border-2 border-[#f48721] flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#f48721]" />
                </span>
                <span>Same as shipping address</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (col-span-5): Payment Method, Coupon, Price Breakdown, Notes, Place Order */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Payment Method Card */}
          <div className="space-y-3">
            <h2 className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
              <span className="text-[#f48721] font-black text-lg">|</span>
              <span>Payment method</span>
            </h2>

            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 space-y-3 shadow-2xs">
              {/* Payment Option Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Option 1: Cash On Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    paymentMethod === "cod"
                      ? "border-[#f48721] bg-[#fffaf5] shadow-xs ring-1 ring-[#f48721]"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <CashIcon className="h-5 w-5" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-bold text-gray-800">
                      Cash On Delivery
                    </span>
                  </div>
                  {paymentMethod === "cod" && (
                    <span className="h-4 w-4 rounded-full bg-[#f48721] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      ✓
                    </span>
                  )}
                </button>

                {/* Option 2: Online Payment */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("online")}
                  className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    paymentMethod === "online"
                      ? "border-[#f48721] bg-[#fffaf5] shadow-xs ring-1 ring-[#f48721]"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <CardPaymentIcon className="h-5 w-5" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-bold text-gray-800">
                      Online Payment
                    </span>
                  </div>
                  {paymentMethod === "online" && (
                    <span className="h-4 w-4 rounded-full bg-[#f48721] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      ✓
                    </span>
                  )}
                </button>
              </div>

              {/* Option 3: bKash (full width or row below) */}
              <button
                type="button"
                onClick={() => setPaymentMethod("bkash")}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  paymentMethod === "bkash"
                    ? "border-[#f48721] bg-[#fffaf5] shadow-xs ring-1 ring-[#f48721]"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-md bg-pink-50 flex items-center justify-center shrink-0 p-1">
                    <BkashIcon className="h-6 w-6" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-bold text-gray-800">
                    bKash
                  </span>
                </div>
                {paymentMethod === "bkash" && (
                  <span className="h-4 w-4 rounded-full bg-[#f48721] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    ✓
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 2. Coupon or Gift Voucher Accordion */}
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setCouponOpen((v) => !v)}
              className="w-full flex items-center justify-between p-4 text-left font-medium text-xs sm:text-[13.5px] text-gray-800 hover:bg-gray-50/60 transition-colors cursor-pointer select-none"
            >
              <span>Have any coupon or gift voucher?</span>
              <span className="text-gray-400 text-xs font-bold">
                {couponOpen ? "▲" : "▼"}
              </span>
            </button>

            {couponOpen && (
              <div className="px-4 pb-4 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon"
                    className="flex-1 rounded-md border border-gray-300 px-3.5 py-2 text-sm outline-none focus:border-[#f48721]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="rounded-md bg-[#f48721] hover:bg-[#df7412] px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer shrink-0"
                  >
                    Apply coupon
                  </button>
                </div>
                {appliedPromo && (
                  <p className="mt-2 text-xs font-semibold text-emerald-600">
                    ✓ Code &ldquo;{appliedPromo}&rdquo; active (-৳{discount})
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 3. Cost Breakdown Box */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 space-y-2.5 shadow-2xs text-[13.5px]">
            <div className="flex items-center justify-between text-gray-700">
              <span>Sub total</span>
              <span className="font-medium text-gray-900">{formatTakaDecimals(subtotal)} BDT</span>
            </div>
            <div className="flex items-center justify-between text-gray-700">
              <span>Delivery cost</span>
              <span className="font-medium text-gray-900">{deliveryCost} BDT</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-emerald-700 font-semibold">
                <span>Discount</span>
                <span>-{formatTakaDecimals(discount)} BDT</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-base font-bold text-gray-900">
              <span>Total</span>
              <span>{formatTakaDecimals(total)}BDT</span>
            </div>
          </div>

          {/* 4. Special Notes (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span className="text-[#f48721] font-bold">|</span>
                <span>Special notes (Optional)</span>
              </h3>
              <span className="text-[11px] text-gray-400">{note.length} / 50 characters</span>
            </div>
            <textarea
              rows={3}
              maxLength={50}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Call before delivery"
              className="w-full rounded-md border border-gray-300 bg-white p-3 text-xs sm:text-sm outline-none focus:border-[#f48721] transition-colors resize-none"
            />
          </div>

          {/* 5. Terms & Policy Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#f48721] cursor-pointer"
            />
            <label htmlFor="terms-checkbox" className="text-xs text-gray-600 cursor-pointer leading-relaxed">
              I have read and agree to the{" "}
              <Link href="/page/happy-return" className="text-[#f48721] hover:underline">
                Terms and Conditions
              </Link>
              ,{" "}
              <Link href="/page/refund-policy" className="text-[#f48721] hover:underline">
                Privacy Policy
              </Link>{" "}
              &amp;{" "}
              <Link href="/page/refund-policy" className="text-[#f48721] hover:underline">
                Refund and Return Policy
              </Link>
              .
            </label>
          </div>

          {/* 6. Big Full-Width PLACE ORDER Button */}
          <button
            type="submit"
            className="w-full rounded-md bg-[#f48721] hover:bg-[#df7412] py-3.5 px-6 text-sm sm:text-base font-bold text-white shadow-md hover:shadow-lg transition-all tracking-wider uppercase cursor-pointer"
          >
            PLACE ORDER
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1240px] p-8 text-center">Loading checkout...</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
