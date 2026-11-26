import type { NextConfig } from "next";
import fs from "fs";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  turbopack: {
    root: fs.realpathSync(__dirname),
  },
  // The built-in resizer (/_next/image) may fetch the store's product photos from Supabase.
  // Each upload gets a unique file name, so a resized copy can be kept for a month.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "evzecjzuvqzpzjrclnny.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
    minimumCacheTTL: 2678400,
  },
  // Model and hero photos rarely change: let browsers keep them for a week instead of
  // checking with the server on every visit, and reuse a stale copy while re-checking.
  async headers() {
    const cacheControl = { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" };
    return [
      { source: "/shoot/:path*", headers: [cacheControl] },
      { source: "/landing/:path*", headers: [cacheControl] },
      // Font files never change under the same name
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default nextConfig;
