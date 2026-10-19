import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://")
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "https://toppershelf.online"
).replace(/\/$/, "");

// Rebuild at most once an hour so new products show up quickly.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Public, indexable pages only. Private or noindex pages (/admin, /read,
  // /library, /welcome, /auth, /api) are left out on purpose.
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/browse`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/study-smarter`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/founders`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // One URL per published product. The anon key plus RLS only returns published rows.
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug, created_at")
      .eq("published", true);

    if (error) throw error;

    productPages = (data ?? []).map((p) => ({
      url: `${BASE_URL}/p/${p.slug}`,
      lastModified: p.created_at ? new Date(p.created_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (err) {
    // If the database is unreachable, still serve the static pages.
    console.error("sitemap: could not load products", err);
  }

  return [...staticPages, ...productPages];
}
