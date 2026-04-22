import type { NextConfig } from "next";
import path from "path";

const isAndroidExport = process.env.BUILD_TARGET === "android";

const nextConfig: NextConfig = {
  ...(isAndroidExport
    ? {
        output: "export",
        assetPrefix: "./",
        trailingSlash: true,
      }
    : {}),

  turbopack: {
    root: path.join(__dirname),
  },

  images: {
    unoptimized: true,
  },
};

export default nextConfig;