import { createAdminClient } from "@/lib/supabase/admin";

// Free preview pages shown on the product page. They come from the optional "free sample" file
// that the admin uploads (a PDF, or pictures that were joined into a PDF). Only published
// resources have a public preview, and only the first few pages are ever served, so a full book
// uploaded as a "sample" by mistake is not given away.
export const MAX_PREVIEW_PAGES = 12;

export async function samplePathFor(slug: string): Promise<string | null> {
  const { data } = await createAdminClient()
    .from("products")
    .select("sample_path")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data?.sample_path ?? null;
}
