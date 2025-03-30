import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: "*",
                protocol: "http",
            },
            {
                hostname: "localhost",
                protocol: "http",
            },
        ],
    },
    reactStrictMode: false,
};

export default nextConfig;
