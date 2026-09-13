import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Firebase App Hosting (@apphosting/adapter-nextjs) expects standalone output.
  output: "standalone",
};

export default nextConfig;
