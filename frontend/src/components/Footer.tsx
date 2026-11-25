"use client";

import React, { useState } from "react";
import Link from "next/link";
import {useCatalog} from '@/context/CatalogContext';
import { SITE_ASSETS } from "@/data/catalog";
import { BrandLogoSvg, MailIcon, PhoneIcon, TrackPinIcon } from "@/components/Icons";

export function Footer() {
  const {settings}=useCatalog();
  const [logoError, setLogoError] = useState(false);
  const [payImgError, setPayImgError] = useState(false);

  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-6 text-[#4b5563]">
      {!!settings.appearance?.footer && <p className="text-center px-4 pb-6">{String(settings.appearance.footer)}</p>}
      <div className="mx-auto max-w-[1320px] px-3 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-10">
          {/* Column 1: Brand Info & Contact */}
          <div className="lg:col-span-4 space-y-4 pr-0 lg:pr-6">
            <Link href="/" className="inline-block">
              <BrandLogoSvg />
            </Link>

            <p className="text-[14px] leading-relaxed text-[#555555]">
              Halal Sheba (হালাল সেবা) — হালাল ও খাঁটি পণ্যের এক বিশ্বস্ত প্রতিষ্ঠান। ১০০% প্রাকৃতিক ও স্বাস্থ্যকর খাবার সরাসরি আপনার ঘরে।
            </p>

            <ul className="space-y-2.5 text-[14px] text-[#4b5563]">
              <li className="flex items-start gap-2.5">
                <TrackPinIcon className="h-4 w-4 text-[#f48721] shrink-0 mt-1" />
                <span>Thanaghata, Satkhira, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <PhoneIcon className="h-4 w-4 text-[#f48721] shrink-0" />
                <a href="tel:+8801313946402" className="hover:text-[#f48721]">
                  01313-946402
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MailIcon className="h-4 w-4 text-[#f48721] shrink-0" />
                <a
                  href="mailto:halalsheba25@gmail.com"
                  className="hover:text-[#f48721]"
                >
                  halalsheba25@gmail.com
                </a>
              </li>
            </ul>

            {/* Social Media Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.facebook.com/HalalSheba/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="h-9 w-9 rounded-full bg-[#fdf4ec] text-[#f48721] hover:bg-[#f48721] hover:text-white flex items-center justify-center transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Information */}
          <div className="lg:col-span-2">
            <h3 className="text-[16px] font-semibold text-[#222831] mb-4">
              Information
            </h3>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <Link href="/page/about-us" className="hover:text-[#f48721]">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/page/contact-us" className="hover:text-[#f48721]">
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="/page/company-information" className="hover:text-[#f48721]">
                  Company Information
                </Link>
              </li>
              <li>
                <Link href="/page/stories" className="hover:text-[#f48721]">
                  Halal Sheba Stories
                </Link>
              </li>
              <li>
                <Link href="/page/terms" className="hover:text-[#f48721]">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/page/privacy" className="hover:text-[#f48721]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/page/careers" className="hover:text-[#f48721]">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-[#f48721] font-medium text-emerald-800">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Shop By */}
          <div className="lg:col-span-2">
            <h3 className="text-[16px] font-semibold text-[#222831] mb-4">
              Shop By
            </h3>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <Link href="/collections/oil-ghee" className="hover:text-[#f48721]">
                  Oil &amp; Ghee
                </Link>
              </li>
              <li>
                <Link href="/collections/honey" className="hover:text-[#f48721]">
                  Honey
                </Link>
              </li>
              <li>
                <Link href="/collections/spices" className="hover:text-[#f48721]">
                  Spices
                </Link>
              </li>
              <li>
                <Link href="/collections/nuts-seeds" className="hover:text-[#f48721]">
                  Nuts &amp; Seeds
                </Link>
              </li>
              <li>
                <Link href="/collections/functional-food" className="hover:text-[#f48721]">
                  Functional Food
                </Link>
              </li>
              <li>
                <Link href="/collections/gur-sweets" className="hover:text-[#f48721]">
                  Gur &amp; Sweets
                </Link>
              </li>
              <li>
                <Link href="/collections/organic-food" className="hover:text-[#f48721]">
                  Organic Food
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="lg:col-span-2">
            <h3 className="text-[16px] font-semibold text-[#222831] mb-4">
              Support
            </h3>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <Link href="/page/support" className="hover:text-[#f48721]">
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="/page/how-to-order" className="hover:text-[#f48721]">
                  How to Order
                </Link>
              </li>
              <li>
                <Link href="/track/order" className="hover:text-[#f48721]">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/page/payment" className="hover:text-[#f48721]">
                  Payment
                </Link>
              </li>
              <li>
                <Link href="/page/shipping" className="hover:text-[#f48721]">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#f48721]">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Consumer Policy */}
          <div className="lg:col-span-2">
            <h3 className="text-[16px] font-semibold text-[#222831] mb-4">
              Consumer Policy
            </h3>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <Link href="/page/happy-return" className="hover:text-[#f48721]">
                  Happy Return
                </Link>
              </li>
              <li>
                <Link href="/page/refund-policy" className="hover:text-[#f48721]">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/page/exchange" className="hover:text-[#f48721]">
                  Exchange
                </Link>
              </li>
              <li>
                <Link href="/page/cancellation" className="hover:text-[#f48721]">
                  Cancellation
                </Link>
              </li>
              <li>
                <Link href="/page/pre-order" className="hover:text-[#f48721]">
                  Pre-Order
                </Link>
              </li>
              <li>
                <Link href="/page/extra-discount" className="hover:text-[#f48721]">
                  Extra Discount
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright + Pay With Row */}
        <div className="border-t border-gray-200 pt-5 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="text-[13px] sm:text-[13.5px] text-[#6b7280] text-center lg:text-left flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span>Copyright &copy; 2026 Halal Sheba (হালাল সেবা). All rights reserved.</span>
            <span className="hidden sm:inline text-gray-300">•</span>
            <Link href="/admin/login" className="text-gray-400 hover:text-emerald-700 transition-colors text-xs">
              Admin Portal
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-2 sm:gap-3 max-w-full">
            <span className="text-xs sm:text-sm font-semibold text-[#222831] shrink-0">
              Pay With
            </span>
            {payImgError ? (
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-bold text-[#222831]">
                {["VISA", "Mastercard", "AMEX", "bKash", "Nagad", "Rocket", "SSLCOMMERZ"].map(
                  (label) => (
                    <span
                      key={label}
                      className="rounded border border-gray-200 bg-white px-2.5 py-1 shadow-2xs"
                    >
                      {label}
                    </span>
                  )
                )}
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={SITE_ASSETS.paymentGateway}
                alt="Pay With VISA, Mastercard, American Express, bKash, Nagad, Rocket, SSLCOMMERZ"
                referrerPolicy="no-referrer"
                onError={() => setPayImgError(true)}
                className="max-h-[32px] sm:max-h-[40px] max-w-full object-contain"
              />
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
