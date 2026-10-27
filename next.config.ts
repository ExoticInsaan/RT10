import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Safe-by-default browser rules for every page.
  // - Nobody can put the site inside another site's frame (stops "clickjacking" and page copying).
  // - Browsers must not guess file types, and only send our address (not the full page link) to other sites.
  // - Camera, microphone and location are switched off; the site never uses them.
  // - HTTPS only for a year.
  // A strict Content-Security-Policy (which scripts may run) is NOT set on purpose: it can easily break
  // Google sign-in and Google Analytics, so it needs testing on a preview first.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
