import type { MetadataRoute } from "next";
import { readyTools } from "@/lib/tools/registry";
import { SITE_URL } from "@/lib/site";

// Public, indexable pages only. Private or noindex pages (/login, /auth, /api) are left out on purpose.
// Only tools marked `ready: true` in lib/tools/registry.ts are listed,
// so Google never sees "coming soon" pages.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/the-shelf`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/fun`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/founders`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/delete-account`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const toolPages: MetadataRoute.Sitemap = readyTools().map((tool) => ({
    url: `${SITE_URL}/tool/${tool.id}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // The two sections (/the-shelf and /fun) are listed with the static pages above.
  return [...staticPages, ...toolPages];
}
