import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
      remotePatterns: [
          {
              hostname: "localhost",
              protocol: "http"
          }
      ]
  }
};

export default nextConfig;
