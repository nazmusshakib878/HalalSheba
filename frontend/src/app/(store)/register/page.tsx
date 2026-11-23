"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";

// Key & User Outline Icon for the Header (matches user reference)
function CreateAccountHeaderIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a7 7 0 00-7 7h9" />
      <circle cx="18" cy="17" r="2.5" strokeWidth={1.8} />
      <path d="M19.8 18.8L21.5 20.5M20.5 19.5L21.5 18.5" strokeLinecap="round" strokeWidth={1.8} />
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

// User Icon
function UserIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

// Envelope / Email Icon
function MailIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

// Lock / Password Icon
function LockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" />
    </svg>
  );
}

// Map Pin / Address Icon
function MapPinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// Eye Icon for password toggle
function EyeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
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

export default function RegisterPage() {
  const router = useRouter();
  const { user, signIn, showToast } = useStore();

  // Left Side (Mobile OTP) State
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Right Side (Full Registration) State
  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState("");

  // Handle Mobile OTP submit
  const handleMobileOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.trim()) {
      showToast("Please enter your mobile phone number", "info");
      return;
    }
    if (!otpSent) {
      setOtpSent(true);
      showToast(`OTP code sent to ${mobileNumber.trim()} (Demo code: 1234)`);
      return;
    }
    if (!otpCode.trim()) {
      showToast("Please enter the 4-digit OTP code", "info");
      return;
    }
    signIn(`Customer (${mobileNumber.slice(-4)})`, mobileNumber);
    showToast("Signed up and logged in successfully!");
    router.push("/checkout");
  };

  // Handle Full Registration submit
  const handleFullRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast("Please enter your full name", "info");
      return;
    }
    if (!emailOrPhone.trim()) {
      showToast("Please enter your email or phone number", "info");
      return;
    }
    if (!password.trim()) {
      showToast("Please enter a password", "info");
      return;
    }

    const isPhone = /^01[0-9]{9}$/.test(emailOrPhone.trim());
    const phoneVal = isPhone ? emailOrPhone.trim() : "01700000000";
    const emailVal = isPhone ? "" : emailOrPhone.trim();

    signIn(fullName.trim(), phoneVal, emailVal, address.trim());
    showToast("Account created successfully! Welcome to Halal Sheba.");
    router.push("/checkout");
  };

  // Handle Google Login Demo
  const handleGoogleSignup = () => {
    signIn("Google User", "01711223344", "user@gmail.com", "");
    showToast("Signed in with Google successfully!");
    router.push("/checkout");
  };

  // If already logged in, show info card
  if (user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-2xl bg-white border border-gray-100 p-8 shadow-sm space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-[#fef4ea] text-[#f48721] flex items-center justify-center text-3xl font-bold">
            ✓
          </div>
          <h1 className="text-xl font-bold text-gray-800">You are already registered & logged in!</h1>
          <p className="text-sm text-gray-500">
            Logged in as <span className="font-semibold text-gray-800">{user.name}</span> ({user.phone})
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/checkout"
              className="rounded-lg bg-[#f48721] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#df7412] transition-colors"
            >
              Go to Checkout
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Browse Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#f8fafc]">
      {/* Main Centered Card Container */}
      <div className="w-full max-w-[940px] rounded-2xl bg-white border border-gray-100 shadow-sm p-6 sm:p-10">
        {/* Top Header matching reference */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-[#f48721] flex items-center justify-center text-white shadow-2xs mb-3">
            <CreateAccountHeaderIcon className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#1f2937] tracking-tight">
            Create New Account
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Register to get started
          </p>
        </div>

        {/* 2-Side Containers with Center OR Divider */}
        <div className="flex flex-col md:flex-row items-stretch gap-5 sm:gap-6">
          {/* Left Box: Signup With Mobile Number */}
          <div className="flex-1 rounded-xl bg-[#f8f9fa] border border-gray-100 p-5 sm:p-6 flex flex-col justify-between min-h-[300px]">
            <div>
              <h2 className="text-[14.5px] font-bold text-gray-800 mb-4">
                Signup With Mobile Number
              </h2>
              <form id="mobile-otp-form" onSubmit={handleMobileOtp} className="space-y-4">
                <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 focus-within:border-[#f48721] focus-within:ring-1 focus-within:ring-[#f48721]/30 transition-all">
                  <PhoneIcon className="h-4 w-4 text-[#f48721] shrink-0 mr-3" />
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
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
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
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
                form="mobile-otp-form"
                className="w-full rounded-lg bg-[#f48721] hover:bg-[#df7412] text-white py-2.5 px-4 text-sm font-bold transition-all shadow-2xs cursor-pointer tracking-wide"
              >
                {otpSent ? "Verify & Register" : "Send OTP"}
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

          {/* Right Box: Register a new account */}
          <div className="flex-1 rounded-xl bg-[#f8f9fa] border border-gray-100 p-5 sm:p-6 flex flex-col justify-between min-h-[300px]">
            <div>
              <h2 className="text-[14.5px] font-bold text-gray-800 mb-3.5">
                Register a new account
              </h2>
              <form id="full-register-form" onSubmit={handleFullRegister} className="space-y-3">
                {/* 1. Full Name */}
                <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 focus-within:border-[#f48721] focus-within:ring-1 focus-within:ring-[#f48721]/30 transition-all">
                  <UserIcon className="h-4 w-4 text-[#f48721] shrink-0 mr-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                  />
                </div>

                {/* 2. Email or Phone Number */}
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

                {/* 3. Password */}
                <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 focus-within:border-[#f48721] focus-within:ring-1 focus-within:ring-[#f48721]/30 transition-all">
                  <LockIcon className="h-4 w-4 text-[#f48721] shrink-0 mr-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer ml-1"
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>

                {/* 4. Address */}
                <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 focus-within:border-[#f48721] focus-within:ring-1 focus-within:ring-[#f48721]/30 transition-all">
                  <MapPinIcon className="h-4 w-4 text-[#f48721] shrink-0 mr-3" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address"
                    className="w-full text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                  />
                </div>
              </form>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                form="full-register-form"
                className="w-full rounded-lg bg-[#f48721] hover:bg-[#df7412] text-white py-2.5 px-4 text-sm font-bold transition-all shadow-2xs cursor-pointer tracking-wide"
              >
                Register account
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Or signup with Google & Sign in link */}
        <div className="mt-8 flex flex-col items-center text-center space-y-4">
          {/* Divider: or signup with */}
          <div className="w-full flex items-center justify-center gap-3">
            <div className="h-[1px] bg-gray-200 flex-1 max-w-[140px]" />
            <span className="text-xs text-gray-500 font-medium select-none">or signup with</span>
            <div className="h-[1px] bg-gray-200 flex-1 max-w-[140px]" />
          </div>

          {/* Google Icon Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            aria-label="Sign up with Google"
            className="h-10 w-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:shadow-xs transition-all cursor-pointer"
          >
            <GoogleIcon className="h-5 w-5" />
          </button>

          {/* Already have an account? Sign in */}
          <p className="text-xs sm:text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-[#f48721] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
