import {getCatalog} from '@/lib/catalog-server';
import {HeroSection} from '@/components/HeroSection';
import {FeaturedCategories} from '@/components/FeaturedCategories';
import {TopSellingSection} from '@/components/TopSellingSection';
import {BrandCarousel} from '@/components/BrandCarousel';
import {ProductCarouselSection} from '@/components/ProductCarouselSection';
import {RotiMakerSection} from '@/components/RotiMakerSection';
import {TestimonialsSection} from '@/components/TestimonialsSection';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const titles:Record<string,string>={honey:'খাঁটি প্রাকৃতিক মধু','gur-sweets':'খেজুরের গুড় ও ঐতিহ্যবাহী মিষ্টি',oil:'খাঁটি তেল',ghee:'খাঁটি ঘি ও মাখন',spices:'মসলা, চুইঝাল ও ভেষজ পণ্য','organic-food':'অর্গানিক ফুড, ড্রাই ফ্রুটস ও মৌসুমি ফল'};
export default async function HomePage(){
 const {products,categories,settings}=await getCatalog();
 const appearance=settings.appearance||{};
 const hidden=(appearance.hidden_sections||[]) as string[];
 const order=(appearance.sections?.constructor===Array?appearance.sections:Object.keys(titles)) as string[];
 // A product may appear in Top Selling AND in its own category carousel:
 // only dedupe across the category sections themselves, so a section never
 // goes empty just because its products are top sellers (both ghee products
 // are top sellers, and সরিষার তেল is one too).
 const seen = new Set<number>();
 const topSelling = products.filter(p=>p.isTopSelling || p.featured);
 const sections = order.filter(slug=>!hidden.includes(slug)).map(slug=>{
   const list = products.filter(p=>p.categorySlug===slug||(slug==='organic-food'&&['satkhira-aam','twin-fol','dry-food-mix','kumra-bori','beetroot-powder'].includes(p.slug))).filter(p=>!seen.has(p.id));
   list.forEach(p=>seen.add(p.id));
   return {slug, list};
 }).filter(({list})=>list.length>0);
 return <div className="storefront"><HeroSection/>{!hidden.includes('categories')&&<FeaturedCategories/>}{!hidden.includes('top-selling')&&<TopSellingSection products={products}/>}{sections.map(({slug,list},i)=><ProductCarouselSection key={slug} title={titles[slug]||categories.find(c=>c.slug===slug)?.name||slug} viewAllHref={'/collections/'+slug} products={list} direction={i%2?'right':'left'}/>)}<RotiMakerSection/><BrandCarousel/><TestimonialsSection/></div>;
}
