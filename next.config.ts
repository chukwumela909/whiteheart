import type { NextConfig } from "next";
import fs from "fs";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  turbopack: {
    root: fs.realpathSync(__dirname),
  },
  // Model and hero photos rarely change: let browsers keep them for a week instead of
  // checking with the server on every visit, and reuse a stale copy while re-checking.
  async headers() {
    const cacheControl = { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" };
    return [
      { source: "/shoot/:path*", headers: [cacheControl] },
      { source: "/landing/:path*", headers: [cacheControl] },
    ];
  },
};

export default nextConfig;
