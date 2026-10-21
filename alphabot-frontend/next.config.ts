
import type { NextConfig } from "next";

const apiOrigin = (
  process.env.ALPHABOT_API_URL ||
  "https://alphabot-api-fvuu.onrender.com"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
