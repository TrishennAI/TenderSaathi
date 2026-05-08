import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Playwright / dev tooling hits 127.0.0.1 while Next prints LAN URL; avoids HMR cross-origin noise.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
