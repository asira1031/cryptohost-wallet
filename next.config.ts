import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // ✅ Required for Capacitor (static export)
  output: "export",

  // ✅ Keep your existing turbopack config (hindi natin gagalawin)
  turbopack: {
    root: path.join(__dirname),
  },

  // ✅ Optional but recommended for mobile apps (no image optimization issue)
  images: {
    unoptimized: true,
  },

  // ✅ Ensures proper trailing paths for static files
  trailingSlash: true,
};

export default nextConfig;