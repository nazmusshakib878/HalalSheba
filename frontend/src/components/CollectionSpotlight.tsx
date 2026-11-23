import Link from "next/link";

export function CollectionSpotlight() {
  return (
    <section className="collection-spotlight-wrap" aria-labelledby="spotlight-title">
      <div className="collection-spotlight">
        <div className="collection-spotlight-photo">
          <img src="/images/products/gawa-ghee.jpg" alt="হালাল সেবার গাওয়া ঘি ও পরিবেশনের বাটি" loading="lazy" />
        </div>
        <div className="collection-spotlight-copy">
          <p className="store-eyebrow">THE EVERYDAY COLLECTION</p>
          <h2 id="spotlight-title">চেনা রান্নায়,<br />একটু বিশেষ ছোঁয়া।</h2>
          <p>গরম ভাতে এক চামচ ঘি। প্রিয় রান্নায় সরিষার তেল। ছোট ছোট স্বাদেই জমে ওঠে পরিবারের খাবার টেবিল।</p>
          <Link href="/collections/oil-ghee" className="store-primary-link">ঘি ও তেলের সংগ্রহ <span aria-hidden="true">↗</span></Link>
          <span className="collection-signature">HALAL SHEBA <span> / </span> ঘরের স্বাদ, ঘরে ঘরে</span>
        </div>
      </div>
    </section>
  );
}
