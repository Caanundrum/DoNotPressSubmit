import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Firebase Hosting (Nick deploys separately).
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
