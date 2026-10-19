import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Pages that carry a noindex tag (/admin, /read, /library, /welcome, /login) are NOT blocked
// here on purpose: Google has to be able to open a page to see its noindex tag.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/auth/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
