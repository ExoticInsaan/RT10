import { NextResponse } from "next/server";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { saveCover } from "@/lib/cover-store";

// Admin only. Takes a picture the admin pasted, dropped or chose, turns it into a small WebP cover, and
// uses it instead of the PDF's first page. (The admin page shrinks big pictures before sending them.)
export const maxDuration = 30;

const COVER_WIDTH = 640;
const MAX_BYTES = 4 * 1024 * 1024; // hosting limits a request to about 4.5 MB
const MAX_PIXELS = 40_000_000;
const OK_TYPES = ["image/png", "image/jpeg", "image/webp"];

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
  if (isAdmin !== true) return no(403, "not_admin", "Only the admin can set covers.");

  const form = await request.formData().catch(() => null);
  const id = typeof form?.get("productId") === "string" ? (form!.get("productId") as string) : "";
  const file = form?.get("image");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return no(400, "bad_request", "Missing product.");
  if (!(file instanceof File)) return no(400, "bad_request", "Missing picture.");
  if (!OK_TYPES.includes(file.type)) return no(415, "bad_type", "Use a PNG, JPG or WebP picture.");
  if (file.size > MAX_BYTES) return no(413, "too_big", "The picture is too large. Use one under 4 MB.");

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return no(503, "not_configured", "The server is missing its Supabase service key.");
  }

  const { data: product } = await admin.from("products").select("id, cover_path").eq("id", id).maybeSingle();
  if (!product) return no(404, "not_found", "That resource does not exist.");

  let image: Buffer;
  try {
    const source = await loadImage(Buffer.from(await file.arrayBuffer()));
    if (!source.width || !source.height || source.width * source.height > MAX_PIXELS) {
      return no(422, "bad_image", "That picture is too large or cannot be read.");
    }
    const scale = Math.min(1, COVER_WIDTH / source.width);
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff"; // see-through pictures get a white background
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(source, 0, 0, width, height);
    image = canvas.toBuffer("image/webp", 82);
  } catch {
    return no(422, "bad_image", "Could not read that picture.");
  }

  const saved = await saveCover(admin, id, image, product.cover_path);
  if ("error" in saved) return no(500, saved.code, saved.error);
  return NextResponse.json({ coverPath: saved.coverPath });
}
