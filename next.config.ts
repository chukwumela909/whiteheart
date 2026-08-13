import type { NextConfig } from "next";
import fs from "fs";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  turbopack: {
    root: fs.realpathSync(__dirname),
  },
};

export default nextConfig;
