
import type { NextConfig } from "next";

// Keep the proxy target on the Django service. A configurable origin could
// point back to the Vercel app and make every /api request rewrite to itself.
const apiOrigin = "https://alphabot-api-fvuu.onrender.com";

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
