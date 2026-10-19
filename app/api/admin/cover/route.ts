import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { forgetPdf, renderPage } from "@/lib/reader-server";
import { saveCover } from "@/lib/cover-store";

// Admin only. Draws the first page of a resource's PDF (no watermark), stores it in the public
// "covers" bucket, and saves its path on the product. Everyone then sees it as the cover.
export const maxDuration = 30;

const COVER_WIDTH = 640; // wide enough to read the title, small enough to load fast

function no(status: number, code: string, error: string) {
  return NextResponse.json({ code, error }, { status });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return no(401, "login_required", "Please sign in.");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) return no(403, "not_admin", "Only the admin can make covers.");

  const body = (await request.json().catch(() => ({}))) as { productId?: string };
  const id = typeof body.productId === "string" ? body.productId : "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return no(400, "bad_request", "Missing product.");

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return no(503, "not_configured", "The server is missing its Supabase service key.");
  }

  const { data: product } = await admin
    .from("products")
    .select("id, file_path, cover_path")
    .eq("id", id)
    .maybeSingle();
  if (!product?.file_path) return no(404, "no_pdf", "This resource has no PDF yet.");

  let image: Buffer | null;
  try {
    forgetPdf(product.file_path); // use the newest upload, not a cached copy
    image = await renderPage(product.file_path, 1, COVER_WIDTH, ""); // empty email = no watermark
  } catch {
    return no(500, "render_failed", "Could not read the PDF's first page.");
  }
  if (!image) return no(422, "empty_pdf", "The PDF has no pages.");

  const saved = await saveCover(admin, id, image, product.cover_path);
  if ("error" in saved) return no(500, saved.code, saved.error);
  return NextResponse.json({ coverPath: saved.coverPath });
}
