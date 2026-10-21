
import type { NextConfig } from "next";

// Keep the proxy target on the Django service. A configurable origin could
// point back to the Vercel app and make every /api request rewrite to itself.
const apiOrigin = "https://alphabot-api-fvuu.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // Next normalizes the wildcard by dropping the incoming trailing
        // slash. Add it explicitly because Django's APPEND_SLASH expects it.
        destination: `${apiOrigin}/api/:path*/`,
      },
    ];
  },
};

export default nextConfig;
