import { InfoPage } from "@/components/InfoPage";

export default async function StaticInfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let content;
  try {
    const r=await fetch(`${process.env.LARAVEL_API_URL||'http://127.0.0.1:8000'}/api/pages/${encodeURIComponent(slug)}`,{cache:'no-store'});
    if(r.ok)content=await r.json();
  } catch { /* Existing information remains available during maintenance. */ }
  return <InfoPage slug={slug} content={content} />;
}
