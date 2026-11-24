import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/wishlist",
        destination: "/my/wishlists",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${process.env.LARAVEL_API_URL || "http://127.0.0.1:8000"}/api/:path*` }];
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
