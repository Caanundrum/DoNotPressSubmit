import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Firebase App Hosting (@apphosting/adapter-nextjs) expects standalone output.
  output: "standalone",
  // Allow 127.0.0.1 ↔ localhost during cloud-agent / puppeteer QA.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
