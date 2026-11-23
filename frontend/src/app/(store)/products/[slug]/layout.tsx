import {getCatalog} from '@/lib/catalog-server';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const {products}=await getCatalog();const p=products.find(p=>p.slug===(slug==='sorishar-tel-5-liter'?'sorishar-tel':slug));return p?{title:p.seoTitle||p.name,description:p.seoDescription||p.shortDescription}:{};}
export default function Layout({children}:{children:React.ReactNode}){return children;}
