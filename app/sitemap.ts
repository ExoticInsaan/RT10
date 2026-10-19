import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { posts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

// Public, indexable pages only. Private or noindex pages (/admin, /read, /library, /welcome,
// /login, /auth, /api) are left out on purpose.
// getProducts() is already cached for a minute, so new resources show up here quickly.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/browse`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: new Date("2026-10-20"), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/founders`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/refund`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const products = await getProducts();
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/p/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...productPages];
}
