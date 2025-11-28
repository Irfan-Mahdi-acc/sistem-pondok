import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
};

export default nextConfig;
