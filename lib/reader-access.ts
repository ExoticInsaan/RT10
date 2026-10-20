import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// One place that decides "may this person read this PDF?". Used by every reader route.
//
// A short memory of recent answers saves two database calls per page (a student opening a
// 50-page PDF asks for 50 pages). The sign-in check itself is never skipped.
const REMEMBER_MS = 60_000;
const remembered = new Map<string, { until: number; filePath: string; title: string; free: boolean }>();

export type Access =
  // free = a free resource: the reader draws its pages without the student's email watermark.
  | { ok: true; filePath: string; title: string; email: string; userId: string; free: boolean }
  | { ok: false; status: number; code: string; error: string };

const no = (status: number, code: string, error: string): Access => ({ ok: false, status, code, error });

export async function authorizeRead(slug: string): Promise<Access> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return no(401, "login_required", "Please sign in to read this.");
  const email = user.email ?? "";

  const key = `${user.id}:${slug}`;
  const hit = remembered.get(key);
  if (hit && hit.until > Date.now()) {
    return { ok: true, filePath: hit.filePath, title: hit.title, email, userId: user.id, free: hit.free };
  }

  const admin = createAdminClient();

  // Looked up without the "published" filter: someone who paid keeps access even if the admin
  // later unpublishes the resource.
  const { data: product } = await admin
    .from("products")
    .select("id, title, file_path, price")
    .eq("slug", slug)
    .maybeSingle();
  if (!product) return no(404, "not_found", "This resource does not exist.");

  const { data: purchase } = await admin
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", product.id)
    .eq("status", "paid")
    .maybeSingle();

  if (!purchase) {
    // Admins may open any PDF to check what they uploaded.
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (isAdmin !== true) return no(403, "not_owned", "You have not bought this resource yet.");
  }

  if (!product.file_path) return no(404, "file_missing", "The PDF for this resource is not uploaded yet.");

  if (remembered.size > 500) remembered.clear();
  const free = Number(product.price) <= 0;
  remembered.set(key, { until: Date.now() + REMEMBER_MS, filePath: product.file_path, title: product.title, free });
  return { ok: true, filePath: product.file_path, title: product.title, email, userId: user.id, free };
}
