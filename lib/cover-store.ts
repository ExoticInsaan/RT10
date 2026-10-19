import type { createAdminClient } from "@/lib/supabase/admin";

type Admin = ReturnType<typeof createAdminClient>;

/**
 * Stores a finished cover picture (WebP) in the public "covers" bucket, points the product at it, and
 * removes the old one. A new file name each time means browsers and the CDN never show an old cover.
 */
export async function saveCover(
  admin: Admin,
  productId: string,
  image: Buffer,
  oldPath: string | null,
): Promise<{ coverPath: string } | { code: string; error: string }> {
  const coverPath = `${productId}-${Date.now()}.webp`;
  const { error: upErr } = await admin.storage.from("covers").upload(coverPath, image, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });
  if (upErr) return { code: "upload_failed", error: `Could not save the cover: ${upErr.message}` };

  const { error: dbErr } = await admin.from("products").update({ cover_path: coverPath }).eq("id", productId);
  if (dbErr) {
    await admin.storage.from("covers").remove([coverPath]);
    return { code: "save_failed", error: `Could not save the cover: ${dbErr.message}` };
  }

  if (oldPath) await admin.storage.from("covers").remove([oldPath]);
  return { coverPath };
}
