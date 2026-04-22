import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  ...(isDev
    ? {}
    : {
        output: "export",
        assetPrefix: "./",
        trailingSlash: true,
      }),

  turbopack: {
    root: path.join(__dirname),
  },

  images: {
    unoptimized: true,
  },
};

export default nextConfig;