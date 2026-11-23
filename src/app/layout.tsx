import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { FloatingWidgets } from "@/components/FloatingWidgets";
import { BottomNav } from "@/components/BottomNav";

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
    <html lang="en" className="overflow-x-hidden">
      <body className="min-h-screen flex flex-col bg-white text-[#252a34] antialiased overflow-x-hidden">
        <StoreProvider>
          <Header />
          <main className="flex-1 bg-[#f8fafc] pb-16 md:pb-0">{children}</main>
          <Footer />
          <CartDrawer />
          <FloatingWidgets />
          <BottomNav />
        </StoreProvider>
      </body>
    </html>
  );
}
