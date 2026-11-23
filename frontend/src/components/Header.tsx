"use client";
import { useCatalog } from "@/context/CatalogContext";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SITE_ASSETS, formatTaka, type NavItem } from "@/data/catalog";
import { useStore } from "@/context/StoreContext";
import { SafeImage } from "@/components/SafeImage";
import {
  BrandLogoSvg,
  CartIcon,
  ChevronDownIcon,
  CloseIcon,
  HeartIcon,
  MenuLinesIcon,
  PhoneIcon,
  SearchIcon,
  TrackPinIcon,
  UserIcon,
  WhatsAppIcon,
} from "@/components/Icons";

export function Header() {
  const { PRODUCTS, CATEGORIES, settings } = useCatalog();
  const NAV_ITEMS: NavItem[] = [{label:"Home",href:"/"},{label:"All Products",href:"/collections/all-products"},...CATEGORIES.map(c=>({label:c.name,href:"/collections/"+c.slug,subcategories:PRODUCTS.filter(p=>p.categorySlug===c.slug).map(p=>({label:p.name,href:"/products/"+p.slug}))})),{label:"আমাদের সম্পর্কে",href:"/page/about-us"},{label:"যোগাযোগ",href:"/page/contact-us"}];
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, openCart, wishlist, user } = useStore();

  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q))
    ).slice(0, 7);
  }, [query]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    setMoreOpen(false);
    setSearchFocused(false);
  }, [pathname]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    setSearchFocused(false);
    if (trimmed) {
      router.push(`/collections/all-products?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/collections/all-products");
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#032e23] text-emerald-100 text-[11px] sm:text-[12.5px] py-1.5 px-3 sm:px-6 border-b border-emerald-900/60 relative z-[61] overflow-hidden">
        <div className="mx-auto max-w-[1320px] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 truncate">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-medium text-white/95 truncate">
              {String(settings.appearance?.announcement || 'সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি • ১০০% নিরাপদ ও খাঁটি প্রাকৃতিক খাদ্য')}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2.5 sm:gap-4 text-emerald-200 text-[11px] sm:text-[12px] shrink-0">
            <a
              href="tel:+8801313946402"
              className="inline-flex items-center gap-1 hover:text-amber-300 transition-colors font-medium whitespace-nowrap"
            >
              <PhoneIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400" />
              <span>০১৩১৩-৯৪৬৪০২</span>
            </a>
            <span className="text-emerald-700">|</span>
            <a
              href="https://api.whatsapp.com/send/?phone=8801313946402&text=Hello%20Halal%20Sheba,%20I%20want%20to%20order."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-emerald-300 transition-colors font-medium"
            >
              <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-400" />
              <span>WhatsApp অর্ডার</span>
            </a>
          </div>
        </div>
      </div>

      {/* Header Middle (White Bar) */}
      <header className="bg-white border-b border-[#eeeeee] relative z-[60]">
        <div className="mx-auto max-w-[1320px] px-3 sm:px-6 h-[64px] sm:h-[74px] md:h-[82px] flex items-center justify-between gap-2 sm:gap-3 md:gap-6">
          {/* Mobile menu trigger + Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open category menu"
              className="lg:hidden p-1.5 -ml-1 rounded-md text-[#222831] hover:bg-gray-100 cursor-pointer"
            >
              <MenuLinesIcon className="h-6 w-6" />
            </button>

            <Link href="/" className="flex items-center shrink-0">
              <BrandLogoSvg className="h-8 sm:h-11 md:h-13 w-auto" />
            </Link>
          </div>

          {/* Search Bar with Instant Autocomplete */}
          <div ref={searchRef} className="relative flex-1 max-w-[540px] hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={query}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder="Search in..."
                aria-label="Search products"
                className="w-full h-[42px] rounded-md bg-[#f4f5f7] border border-transparent focus:border-[#f48721]/60 focus:bg-white pl-4 pr-11 text-[14px] text-[#222831] placeholder:text-[#6b7280] outline-none transition-colors"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-0 top-0 h-[42px] w-11 flex items-center justify-center text-[#222831] hover:text-[#f48721] transition-colors"
              >
                <SearchIcon className="h-[19px] w-[19px]" />
              </button>
            </form>

            {/* Instant Search Dropdown */}
            {searchFocused && query.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-[46px] rounded-lg bg-white border border-[#e5e7eb] shadow-[0_14px_34px_rgba(0,0,0,0.12)] overflow-hidden z-[90]">
                {searchResults.length > 0 ? (
                  <>
                    <div className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto">
                      {searchResults.map((item) => (
                        <Link
                          key={item.id}
                          href={`/products/${item.slug}`}
                          onClick={() => setSearchFocused(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-[#fff8f1] transition-colors"
                        >
                          <SafeImage
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded border border-gray-100 object-cover shrink-0 bg-white"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] font-medium text-[#222831] truncate">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[13px] font-bold text-[#f48721]">
                                {formatTaka(item.price)}
                              </span>
                              {item.regularPrice && (
                                <span className="text-[12px] text-gray-400 line-through">
                                  {formatTaka(item.regularPrice)}
                                </span>
                              )}
                              <span className="text-[11px] text-gray-500 ml-auto">
                                {item.brand}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full py-2.5 text-center text-[13px] font-semibold text-[#f48721] bg-[#faf8f5] hover:bg-[#fff3e6] border-t border-gray-100 transition-colors"
                    >
                      View all results for &ldquo;{query.trim()}&rdquo;
                    </button>
                  </>
                ) : (
                  <div className="p-5 text-center text-sm text-gray-500">
                    No products matched &ldquo;{query.trim()}&rdquo;. Try searching Honey, Dates, Ghee, or Mustard Oil.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Header Action Icons */}
          <div className="flex items-center gap-2.5 sm:gap-5 shrink-0">
            <Link
              href="/track/order"
              className="hidden md:flex flex-col items-center gap-0.5 text-[#222831] hover:text-[#065f46] transition-colors"
            >
              <TrackPinIcon className="h-[22px] w-[22px]" />
              <span className="text-[11.5px] font-medium whitespace-nowrap">Track Order</span>
            </Link>

            <Link
              href="/login"
              className="hidden sm:flex flex-col items-center gap-0.5 text-[#222831] hover:text-[#065f46] transition-colors"
            >
              <UserIcon className="h-[22px] w-[22px]" />
              <span className="text-[11.5px] font-medium whitespace-nowrap max-w-[68px] truncate">
                {user ? user.name.split(" ")[0] : "Sign In"}
              </span>
            </Link>

            <Link
              href="/my/wishlists"
              className="relative flex items-center justify-center p-1 sm:p-0 text-[#222831] hover:text-[#065f46] transition-colors"
              aria-label="Wishlist"
            >
              <div className="relative">
                <HeartIcon className="h-[21px] w-[21px] sm:h-[22px] sm:w-[22px]" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 min-w-[16px] px-1 rounded-full bg-[#065f46] text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="text-[11.5px] font-medium hidden sm:inline ml-1">Wishlist</span>
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label="Open shopping cart"
              className="relative flex items-center gap-1.5 bg-[#065f46] sm:bg-transparent px-2.5 py-1.5 sm:p-0 rounded-full sm:rounded-none text-white sm:text-[#222831] hover:text-[#065f46] transition-colors cursor-pointer shadow-xs sm:shadow-none shrink-0"
            >
              <div className="relative">
                <CartIcon className="h-[20px] w-[20px] sm:h-[22px] sm:w-[22px] text-white sm:text-[#222831]" />
                <span className="absolute -top-2 -right-2.5 h-[17px] min-w-[17px] px-1 rounded-full bg-[#f48721] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {totalItems}
                </span>
              </div>
              <span className="text-[12px] font-bold sm:hidden text-white">
                কার্ট
              </span>
              <span className="text-[11.5px] font-medium hidden sm:inline">Cart</span>
            </button>

            {/* More Dropdown */}
            <div ref={moreRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className="flex flex-col items-center gap-0.5 text-[#222831] hover:text-[#f48721] transition-colors cursor-pointer"
              >
                <MenuLinesIcon className="h-[22px] w-[22px]" />
                <span className="text-[11.5px] font-medium">More</span>
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-[52px] w-48 rounded-lg bg-white border border-gray-200 shadow-[0_12px_30px_rgba(0,0,0,0.12)] py-1.5 z-[95]">
                  <Link
                    href="/my/wishlists"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] text-[#222831] hover:bg-[#fff8f1] hover:text-[#f48721]"
                  >
                    <HeartIcon className="h-4 w-4 text-[#f48721]" />
                    <span>Wishlists</span>
                  </Link>
                  <Link
                    href="/faq"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] text-[#222831] hover:bg-[#fff8f1] hover:text-[#f48721]"
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#f48721] text-[10px] font-bold text-[#f48721]">
                      ?
                    </span>
                    <span>Faqs</span>
                  </Link>
                  <Link
                    href="/page/about-us"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] text-[#222831] hover:bg-[#fff8f1] hover:text-[#f48721]"
                  >
                    <TrackPinIcon className="h-4 w-4 text-[#f48721]" />
                    <span>About Us</span>
                  </Link>
                  <a
                    href="tel:+8801313946402"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] text-[#222831] hover:bg-[#fff8f1] hover:text-[#f48721]"
                  >
                    <PhoneIcon className="h-4 w-4 text-[#f48721]" />
                    <span>01313-946402</span>
                  </a>
                  <a
                    href="https://api.whatsapp.com/send/?phone=8801313946402&text=Hello%20Halal%20Sheba,%20I%20want%20to%20order."
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] text-[#222831] hover:bg-[#fff8f1] hover:text-[#088d2d]"
                  >
                    <WhatsAppIcon className="h-4 w-4 text-[#088d2d]" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="sm:hidden px-3 pb-3 relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={query}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchFocused(true);
              }}
              placeholder="Search products..."
              className="w-full h-[40px] rounded-lg bg-[#f4f5f7] border border-transparent focus:border-[#065f46] focus:bg-white pl-3.5 pr-10 text-sm text-[#222831] outline-none transition-colors"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-0 top-0 h-[40px] w-10 flex items-center justify-center text-[#222831] hover:text-[#065f46]"
            >
              <SearchIcon className="h-4 w-4" />
            </button>
          </form>

          {/* Instant Search Dropdown on Mobile */}
          {searchFocused && query.trim().length > 0 && (
            <div className="absolute left-3 right-3 top-[46px] rounded-lg bg-white border border-[#e5e7eb] shadow-[0_14px_34px_rgba(0,0,0,0.15)] overflow-hidden z-[90]">
              {searchResults.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug}`}
                        onClick={() => setSearchFocused(false)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-[#fff8f1] transition-colors"
                      >
                        <SafeImage
                          src={item.image}
                          alt={item.name}
                          className="h-10 w-10 rounded border border-gray-100 object-cover shrink-0 bg-white"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[12.5px] font-medium text-[#222831] truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[12px] font-bold text-[#f48721]">
                              {formatTaka(item.price)}
                            </span>
                            {item.regularPrice && (
                              <span className="text-[11px] text-gray-400 line-through">
                                {formatTaka(item.regularPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full py-2 text-center text-[12px] font-semibold text-[#065f46] bg-[#faf8f5] hover:bg-[#e8f8ed] border-t border-gray-100 transition-colors"
                  >
                    View all results for &ldquo;{query.trim()}&rdquo;
                  </button>
                </>
              ) : (
                <div className="p-4 text-center text-xs text-gray-500">
                  No products matched &ldquo;{query.trim()}&rdquo;.
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Sticky Main Navigation Bar */}
      <nav
        aria-label="Main Categories"
        className="sticky top-0 z-50 bg-[#064e3b] text-white shadow-md hidden lg:block"
      >
        <div className="mx-auto max-w-[1320px] px-6 flex items-center justify-between min-h-[50px]">
          <ul className="flex items-center justify-between w-full gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href.split("?")[0]));
              const hasSub = Boolean(item.subcategories && item.subcategories.length > 0);
              return (
                <li
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => hasSub && setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 py-3 px-2 text-[14px] font-medium whitespace-nowrap transition-colors text-white hover:text-amber-300"
                    >
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className={`inline-flex items-center gap-1 py-3 px-2 text-[14px] font-medium whitespace-nowrap transition-colors ${
                        item.highlight || isActive
                          ? "text-amber-300 font-bold"
                          : "text-white hover:text-amber-300"
                      }`}
                    >
                      <span>{item.label}</span>
                      {hasSub && <ChevronDownIcon className="h-3.5 w-3.5 opacity-80" />}
                    </Link>
                  )}

                  {hasSub && openDropdown === item.label && (
                    <div className="absolute left-0 top-full w-56 rounded-b-lg bg-white border border-gray-200 shadow-xl py-2 z-[75]">
                      {item.subcategories!.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className="block px-4 py-2 text-[13.5px] text-[#222831] hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[300px] max-w-[85vw] bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3.5 bg-[#041f1e] text-white">
              <span className="font-bold text-base">Halal Sheba Menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-1 text-white/90 hover:text-[#f48721]"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="divide-y divide-gray-100 py-2">
              {NAV_ITEMS.map((item) =>
                item.external ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-[#222831] hover:bg-[#fff8f1] hover:text-[#f48721]"
                  >
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 text-sm font-medium ${
                      item.highlight ? "text-[#f48721]" : "text-[#222831]"
                    } hover:bg-[#fff8f1]`}
                  >
                    <span>{item.label}</span>
                    {item.subcategories && (
                      <ChevronDownIcon className="h-4 w-4 -rotate-90 text-gray-400" />
                    )}
                  </Link>
                )
              )}
            </div>
            <div className="mt-auto border-t border-gray-200 p-4 space-y-2.5 bg-[#f8fafc]">
              <Link
                href="/track/order"
                className="flex items-center gap-2 text-sm font-medium text-[#222831]"
              >
                <TrackPinIcon className="h-4 w-4 text-[#f48721]" />
                <span>Track Order</span>
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-medium text-[#222831]"
              >
                <UserIcon className="h-4 w-4 text-[#f48721]" />
                <span>{user ? user.name : "Sign In / Register"}</span>
              </Link>
              <a
                href="tel:+8801313946402"
                className="flex items-center gap-2 text-sm font-medium text-[#222831]"
              >
                <PhoneIcon className="h-4 w-4 text-[#f48721]" />
                <span>01313-946402</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
