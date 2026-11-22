import type { Metadata } from "next";
import { Open_Sans, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { FloatingWidgets } from "@/components/FloatingWidgets";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-open-sans",
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Halal Sheba (হালাল সেবা) | নিরাপদ ও খাঁটি পণ্যের বিশ্বস্ত প্রতিষ্ঠান",
  description:
    "Halal Sheba (হালাল সেবা) - সুন্দরবনের ১০০% খাঁটি চাকের মধু, খেজুরের খাঁটি পাটালি ও বীজগুড়, গাওয়া ঘি, বাটার/মাখন, কোল্ড প্রেসড তেল এবং সাতক্ষীরার খাঁটি চুইঝাল।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} ${notoSansBengali.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-white text-[#252a34] antialiased">
        <StoreProvider>
          <Header />
          <main className="flex-1 bg-[#f8fafc]">{children}</main>
          <Footer />
          <CartDrawer />
          <FloatingWidgets />
        </StoreProvider>
      </body>
    </html>
  );
}
