import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/read/<slug>
// Gives a signed-in student who PAID for this resource a short-lived link to its PDF.
// The PDF itself is private; the link works for a few minutes only.
//
// Codes: login_required, not_found, not_owned, file_missing, file_error
const reply = (status: number, body: Record<string, unknown>) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

const LINK_SECONDS = 300;

export async function GET(_request: Request, { params }: RouteContext<"/api/read/[slug]">) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return reply(401, { code: "login_required", error: "Please sign in to read this." });

  const admin = createAdminClient();

  // Looked up without the "published" filter: someone who paid keeps access even if the admin
  // later unpublishes the resource.
  const { data: product } = await admin
    .from("products")
    .select("id, title, file_path")
    .eq("slug", slug)
    .maybeSingle();
  if (!product) return reply(404, { code: "not_found", error: "This resource does not exist." });

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
    if (isAdmin !== true) {
      return reply(403, { code: "not_owned", error: "You have not bought this resource yet." });
    }
  }

  if (!product.file_path) {
    return reply(404, { code: "file_missing", error: "The PDF for this resource is not uploaded yet." });
  }

  const { data: signed, error } = await admin.storage
    .from("notes")
    .createSignedUrl(product.file_path, LINK_SECONDS);
  if (error || !signed?.signedUrl) {
    console.error("Reader: could not sign PDF link", slug, error);
    return reply(500, { code: "file_error", error: "Could not open the PDF. Please try again." });
  }

  return reply(200, { url: signed.signedUrl, title: product.title, email: user.email ?? "" });
}
