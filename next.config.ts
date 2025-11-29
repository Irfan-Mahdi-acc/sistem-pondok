import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  },
  images: {
    unoptimized: true, // Disable image optimization for VPS compatibility
  },
};

export default nextConfig;
