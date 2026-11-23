import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="overflow-x-hidden" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Filter out browser extension attribute noise and hydration warnings
                  if (typeof console !== 'undefined' && console.error) {
                    const origError = console.error;
                    console.error = function(...args) {
                      const msg = args.map(a => String(a || '')).join(' ');
                      if (msg.includes('bis_skin_checked') || msg.includes('hydrated but some attributes') || msg.includes('didn\\'t match the client')) return;
                      origError.apply(console, args);
                    };
                  }
                  window.addEventListener('error', function(e) {
                    if (e && e.message && (e.message.includes('bis_skin_checked') || e.message.includes('hydration') || e.message.includes('hydrated'))) {
                      e.stopImmediatePropagation();
                      e.preventDefault();
                    }
                  }, true);
                  const clean = () => {
                    document.querySelectorAll('[bis_skin_checked]').forEach(el => el.removeAttribute('bis_skin_checked'));
                  };
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', clean);
                  } else {
                    clean();
                  }
                  new MutationObserver((mutations) => {
                    for (const m of mutations) {
                      if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked' && m.target && m.target.removeAttribute) {
                        m.target.removeAttribute('bis_skin_checked');
                      }
                    }
                  }).observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['bis_skin_checked'] });
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="min-h-screen flex flex-col bg-white text-[#252a34] antialiased overflow-x-hidden"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
