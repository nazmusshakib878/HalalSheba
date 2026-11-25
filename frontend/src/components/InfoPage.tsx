import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { notFound } from "next/navigation";
import { STATIC_PAGES } from "@/data/catalog";

const links = [["about-us", "আমাদের গল্প"], ["contact-us", "যোগাযোগ"], ["how-to-order", "অর্ডার করার নিয়ম"], ["shipping", "ডেলিভারি তথ্য"], ["refund-policy", "রিফান্ড পলিসি"]];

export function InfoPage({ slug, content }: { slug: string; content?: {title:string;body:string} }) {
  const page = content ? {title:content.title, subtitle:STATIC_PAGES[slug]?.subtitle||'', body:content.body.split('\n\n')} : STATIC_PAGES[slug];
  if (!page) notFound();
  const about = slug === "about-us";
  return <div className="info-page"><div className="info-container">
    <nav className="info-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">{page.title}</span></nav>
    <header className={`info-hero ${about ? "info-hero-about" : ""}`}>
      <div className="info-hero-copy"><p className="store-eyebrow">HALAL SHEBA / {about ? "OUR STORY" : "CUSTOMER CARE"}</p><h1>{about ? <>দেশের স্বাদ,<br /><span>ঘরে ঘরে।</span></> : page.title}</h1><p className="info-subtitle">{page.subtitle}</p>{about && <Link href="/collections/all-products" className="store-primary-link">আমাদের সংগ্রহ দেখুন ↗</Link>}</div>
      {about && <div className="info-hero-image"><SafeImage src="/images/products/gawa-ghee.jpg" alt="হালাল সেবার গাওয়া ঘি" fetchPriority="high" /><span>দেশজ স্বাদের প্রতি ভালোবাসা</span></div>}
    </header>
    <div className="info-content-layout">
      <article className="info-article"><p className="store-eyebrow">{about ? "ROOTED IN EVERYDAY GOODNESS" : "HERE TO HELP"}</p><h2>{about ? "আমাদের গল্প" : page.title}</h2><div className="info-prose">{page.body.map((text, i) => <p key={i}>{text}</p>)}</div>
      {slug === "contact-us" && <div className="info-contact-actions"><a href="tel:+8801313946402" className="store-primary-link">কল করুন ↗</a><a href="mailto:halalsheba25@gmail.com" className="store-text-link">ইমেইল করুন →</a></div>}
      {about && <div className="info-values"><div><span>01 / COLLECTION</span><h3>চেনা স্বাদের সমাহার</h3><p>মধু, ঘি, গুড় ও প্রতিদিনের রান্নার পছন্দের উপকরণ।</p></div><div><span>02 / CONNECTION</span><h3>পাশে আছি আমরা</h3><p>পণ্য বেছে নিতে কিংবা অর্ডারের তথ্য জানতে সরাসরি কথা বলুন।</p></div></div>}</article>
      <aside className="info-sidebar" aria-label="Helpful information"><div className="info-side-nav"><p className="store-eyebrow">EXPLORE HALAL SHEBA</p>{links.map(([path, title]) => <Link key={path} href={`/page/${path}`} aria-current={slug === path ? "page" : undefined}>{title}<span aria-hidden="true">↗</span></Link>)}</div><div className="info-help"><p className="store-eyebrow">A CONVERSATION AWAY</p><h3>সাহায্য লাগবে?</h3><p>অর্ডার বা পণ্য সম্পর্কে জানতে আমাদের কল করুন।</p><a href="tel:+8801313946402">01313-946402 ↗</a></div></aside>
    </div>
    <section className="info-bottom-cta"><div><p className="store-eyebrow">BRING GOODNESS HOME</p><h2>আপনার পছন্দের স্বাদ খুঁজে নিন।</h2></div><Link href="/collections/all-products" className="store-primary-link">পণ্য দেখুন ↗</Link></section>
  </div></div>;
}
