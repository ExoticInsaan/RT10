import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/claim  { slug: string }
// Adds a FREE resource to the signed-in student's library. It saves a purchases row with status
// 'paid' and amount 0, so the reader and My Library treat it like any other resource they own.
// Whether it is free is always read from the database, never from the browser.
//
// Codes: login_required, bad_request, not_found, not_free, already_owned, save_failed
const fail = (status: number, code: string, error: string) => NextResponse.json({ code, error }, { status });

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail(401, "login_required", "Please sign in first.");

  const body = (await request.json().catch(() => ({}))) as { slug?: unknown };
  const slug = typeof body.slug === "string" ? body.slug : "";
  if (!slug || slug.length > 200) return fail(400, "bad_request", "Missing resource.");

  const admin = createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select("id, price")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!product) return fail(404, "not_found", "This resource is not available.");
  if (Number(product.price) > 0) return fail(409, "not_free", "This resource is not free.");

  const { data: owned } = await admin
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", product.id)
    .eq("status", "paid")
    .maybeSingle();
  if (owned) return fail(409, "already_owned", "This is already in your library.");

  const { error } = await admin.from("purchases").insert({
    user_id: user.id,
    product_id: product.id,
    gateway_order_id: `free-${crypto.randomUUID()}`,
    amount: 0,
    status: "paid",
  });
  if (error) {
    // Two quick clicks: the second hits the "one paid purchase per item" rule. The first one worked.
    if (error.code === "23505") return fail(409, "already_owned", "This is already in your library.");
    console.error("Claim: could not save free resource", error);
    return fail(500, "save_failed", "Could not add it to your library. Please try again.");
  }
  return NextResponse.json({ ok: true });
}
