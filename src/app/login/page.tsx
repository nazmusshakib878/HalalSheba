"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { formatTakaDecimals } from "@/data/catalog";

// User Login Icon
function LoginHeaderIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 19a6 6 0 0112 0" />
    </svg>
  );
}

// Smartphone Icon
function PhoneIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <circle cx="12" cy="18" r="0.8" fill="currentColor" />
      <line x1="10" y1="5" x2="14" y2="5" strokeLinecap="round" />
    </svg>
  );
}

// Mail Icon
function MailIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

// Lock Icon
function LockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" />
    </svg>
  );
}

// Google Official 4-color G Icon
function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, signIn, signOut, orders, showToast } = useStore();

  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      showToast("Please enter your mobile phone number", "info");
      return;
    }
    if (!otpSent) {
      setOtpSent(true);
      showToast(`OTP sent to ${phone.trim()} (Demo code: 1234)`);
      return;
    }
    if (!otp.trim()) {
      showToast("Please enter the verification code", "info");
      return;
    }
    signIn(`Customer (${phone.slice(-4)})`, phone);
    showToast("Signed in successfully!");
    router.push("/checkout");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      showToast("Please enter your email or phone number", "info");
      return;
    }
    if (!password.trim()) {
      showToast("Please enter your password", "info");
      return;
    }
    const isPhone = /^01[0-9]{9}$/.test(emailOrPhone.trim());
    const phoneVal = isPhone ? emailOrPhone.trim() : "01700000000";
    signIn(emailOrPhone.split("@")[0] || "Halal Sheba Customer", phoneVal);
    showToast("Signed in successfully!");
    router.push("/checkout");
  };

  const handleGoogleLogin = () => {
    signIn("Google User", "01711223344", "user@gmail.com", "");
    showToast("Signed in with Google successfully!");
    router.push("/checkout");
  };

  if (user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <div className="rounded-xl bg-white border border-gray-200 p-6 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#f48721] font-bold">
              Customer Account
            </p>
            <h1 className="text-2xl font-bold text-[#222831] mt-0.5">
              Welcome, {user.name}
            </h1>
            <p className="text-sm text-gray-500">Phone: {user.phone}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/checkout"
              className="rounded-md bg-[#f48721] px-4 py-2 text-sm font-semibold text-white hover:bg-[#df7412]"
            >
              Go to Checkout
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-[#222831] hover:border-[#f48721] hover:text-[#f48721] cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-xs">
          <h2 className="text-lg font-bold text-[#222831] mb-4">
            Recent Orders ({orders.length})
          </h2>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No recent orders found.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="py-3 flex flex-wrap items-center justify-between gap-3 text-sm"
                >
                  <div>
                    <span className="font-bold text-[#f48721]">{order.orderId}</span>
                    <span className="text-gray-500 ml-2">
                      • {order.items.length} items
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#222831]">
                      {formatTakaDecimals(order.total)} BDT
                    </span>
                    <Link
                      href={`/track/order?id=${encodeURIComponent(order.orderId)}`}
                      className="rounded bg-[#041f1e] px-3 py-1 text-xs font-semibold text-white hover:bg-[#08312f]"
                    >
                      Track
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#f8fafc]">
      {/* Centered Sign In Card Container */}
      <div className="w-full max-w-[940px] rounded-2xl bg-white border border-gray-100 shadow-sm p-6 sm:p-10">
        {/* Top Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-[#f48721] flex items-center justify-center text-white shadow-2xs mb-3">
            <LoginHeaderIcon className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#1f2937] tracking-tight">
            Sign In to Account
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Access your orders, saved cart and profile
          </p>
        </div>

        {/* 2-Side Containers with Center OR Divider */}
        <div className="flex flex-col md:flex-row items-stretch gap-5 sm:gap-6">
          {/* Left Box: Login With Mobile OTP */}
          <div className="flex-1 rounded-xl bg-[#f8f9fa] border border-gray-100 p-5 sm:p-6 flex flex-col justify-between min-h-[260px]">
            <div>
              <h2 className="text-[14.5px] font-bold text-gray-800 mb-4">
                Login With Mobile Number
              </h2>
              <form id="mobile-login-form" onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 focus-within:border-[#f48721] focus-within:ring-1 focus-within:ring-[#f48721]/30 transition-all">
                  <PhoneIcon className="h-4 w-4 text-[#f48721] shrink-0 mr-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01*********"
                    className="w-full text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                  />
                </div>

                {otpSent && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-xs font-medium text-gray-600">
                      Enter 4-Digit OTP (Demo: enter 1234)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#f48721]"
                    />
                  </div>
                )}
              </form>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                form="mobile-login-form"
                className="w-full rounded-lg bg-[#f48721] hover:bg-[#df7412] text-white py-2.5 px-4 text-sm font-bold transition-all shadow-2xs cursor-pointer tracking-wide"
              >
                {otpSent ? "Verify & Sign In" : "Send OTP"}
              </button>
            </div>
          </div>

          {/* Center Divider: Vertical on Desktop */}
          <div className="hidden md:flex flex-col items-center justify-center relative w-6 self-stretch">
            <div className="w-[1px] bg-gray-200 h-full" />
            <div className="absolute top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400 select-none shadow-2xs">
              OR
            </div>
          </div>

          {/* Center Divider: Horizontal on Mobile */}
          <div className="md:hidden flex items-center justify-center relative my-2">
            <div className="h-[1px] bg-gray-200 w-full" />
            <div className="absolute left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400 select-none shadow-2xs">
              OR
            </div>
          </div>

          {/* Right Box: Login with Password */}
          <div className="flex-1 rounded-xl bg-[#f8f9fa] border border-gray-100 p-5 sm:p-6 flex flex-col justify-between min-h-[260px]">
            <div>
              <h2 className="text-[14.5px] font-bold text-gray-800 mb-4">
                Login With Password
              </h2>
              <form id="password-login-form" onSubmit={handlePasswordSubmit} className="space-y-3.5">
                <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 focus-within:border-[#f48721] focus-within:ring-1 focus-within:ring-[#f48721]/30 transition-all">
                  <MailIcon className="h-4 w-4 text-[#f48721] shrink-0 mr-3" />
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Email or Phone Number"
                    className="w-full text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                  />
                </div>

                <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 focus-within:border-[#f48721] focus-within:ring-1 focus-within:ring-[#f48721]/30 transition-all">
                  <LockIcon className="h-4 w-4 text-[#f48721] shrink-0 mr-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                  />
                </div>
              </form>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                form="password-login-form"
                className="w-full rounded-lg bg-[#f48721] hover:bg-[#df7412] text-white py-2.5 px-4 text-sm font-bold transition-all shadow-2xs cursor-pointer tracking-wide"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 flex flex-col items-center text-center space-y-4">
          <div className="w-full flex items-center justify-center gap-3">
            <div className="h-[1px] bg-gray-200 flex-1 max-w-[140px]" />
            <span className="text-xs text-gray-500 font-medium select-none">or login with</span>
            <div className="h-[1px] bg-gray-200 flex-1 max-w-[140px]" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            aria-label="Sign in with Google"
            className="h-10 w-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:shadow-xs transition-all cursor-pointer"
          >
            <GoogleIcon className="h-5 w-5" />
          </button>

          <p className="text-xs sm:text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#f48721] font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
