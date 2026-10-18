import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://alphabot-api-fvuu.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
