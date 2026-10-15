import { cacheLife } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { PRODUCT_COLUMNS, toProduct, type Product } from "@/lib/product-types";

export type { Product };

// Every published resource, newest first. Cached for a minute, which is why the admin page says
// a new resource shows on the site "within about a minute".
export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 3600 });

  try {
    const { data, error } = await createPublicClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toProduct);
  } catch (err) {
    // Show an empty shop instead of crashing; the next refresh (within a minute) tries again.
    console.error("Could not load products:", err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}
