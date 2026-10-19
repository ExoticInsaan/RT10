import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The old Study Smarter page was removed. Send anyone (and Google) who still has the old link to the study guides.
  async redirects() {
    return [{ source: "/study-smarter", destination: "/blog", permanent: true }];
  },
  // The reader draws PDF pages on the server. These packages must be loaded as-is from
  // node_modules (not bundled), and the files they read at run time must ship with the deploy.
  serverExternalPackages: ["pdfjs-dist", "@napi-rs/canvas"],
  outputFileTracingIncludes: {
    "/api/read/**": [
      "./lib/fonts/**/*",
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
      "./node_modules/pdfjs-dist/standard_fonts/**/*",
    ],
    "/api/admin/**": [
      "./lib/fonts/**/*",
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
      "./node_modules/pdfjs-dist/standard_fonts/**/*",
    ],
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
