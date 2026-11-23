import { StoreProvider } from '@/context/StoreContext';
import { CatalogProvider } from '@/context/CatalogContext';
import { getCatalog } from '@/lib/catalog-server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { FloatingWidgets } from '@/components/FloatingWidgets';
import { BottomNav } from '@/components/BottomNav';
import { StoreAppearance } from '@/components/StoreAppearance';

export async function generateMetadata() {
  const { settings } = await getCatalog();
  return {
    title: settings.appearance?.seo_title ? String(settings.appearance.seo_title) : undefined,
    description: settings.appearance?.seo_description ? String(settings.appearance.seo_description) : undefined,
  };
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const data = await getCatalog();
  const isUnavailable = data.unavailable && (!data.products || data.products.length === 0);

  return (
    <CatalogProvider data={data}>
      <StoreAppearance />
      <StoreProvider>
        <Header />
        <main className="flex-1 bg-[#f8fafc] pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
          {isUnavailable ? (
            <div className="p-12 text-center">দোকানের তথ্য লোড করা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।</div>
          ) : (
            children
          )}
        </main>
        <Footer />
        <CartDrawer />
        <FloatingWidgets />
        <BottomNav />
      </StoreProvider>
    </CatalogProvider>
  );
}
