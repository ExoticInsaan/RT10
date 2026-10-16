import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { razorpay, razorpayConfigured } from "@/lib/razorpay";

// POST /api/checkout  { slug: string }
// The price is ALWAYS read from the database, never from the browser.
//
// Every error carries a `code` so the page can show a clear message:
//   login_required, bad_request, not_found, already_owned, confirming, not_configured, gateway_error, save_failed
const fail = (status: number, code: string, error: string) =>
  NextResponse.json({ code, error }, { status });

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail(401, "login_required", "Please log in first.");

  const { slug } = (await request.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return fail(400, "bad_request", "Missing product.");

  if (!razorpayConfigured()) {
    console.error("Checkout: RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set.");
    return fail(500, "not_configured", "Payments are not available right now. Please try again later.");
  }

  const admin = createAdminClient();

  const { data: product } = await admin
    .from("products")
    .select("id, title, price")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (!product) return fail(404, "not_found", "This resource is not available.");

  const { data: already } = await admin
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", product.id)
    .eq("status", "paid")
    .maybeSingle();
  if (already) return fail(409, "already_owned", "You already own this resource.");

  const amountPaise = Math.round(Number(product.price) * 100);
  const reply = (orderId: string) =>
    NextResponse.json({
      orderId,
      amount: amountPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      name: product.title,
    });

  // A student who clicks Buy twice (or reopens the page) must not get a second order:
  // two open orders can both be paid, which charges them twice. Reuse the open one instead.
  const { data: openOrders } = await admin
    .from("purchases")
    .select("gateway_order_id")
    .eq("user_id", user.id)
    .eq("product_id", product.id)
    .in("status", ["pending", "failed"])
    .eq("amount", amountPaise)
    .order("created_at", { ascending: false })
    .limit(3);

  for (const open of openOrders ?? []) {
    const existing = await razorpay<{ status?: string }>(`/orders/${open.gateway_order_id}`);
    if (!existing.ok) continue;
    if (existing.data.status === "paid") {
      // Money is in, our webhook just has not unlocked it yet. Do NOT let them pay again.
      return fail(
        409,
        "confirming",
        "Your payment was received and is being confirmed. Please check My Library in a minute. Do not pay again.",
      );
    }
    if (existing.data.status === "created" || existing.data.status === "attempted") {
      return reply(open.gateway_order_id);
    }
  }

  const created = await razorpay<{ id?: string }>("/orders", {
    method: "POST",
    body: {
      amount: amountPaise,
      currency: "INR",
      receipt: `${user.id.slice(0, 8)}-${Date.now()}`,
      notes: { user_id: user.id, product_id: product.id },
    },
  });
  if (!created.ok || !created.data.id) {
    console.error("Checkout: Razorpay order failed", created.status, created.data);
    return fail(502, "gateway_error", "Could not start payment. Please try again.");
  }
  const orderId = created.data.id;

  const { error } = await admin.from("purchases").insert({
    user_id: user.id,
    product_id: product.id,
    gateway_order_id: orderId,
    amount: amountPaise,
    status: "pending",
  });
  if (error) {
    console.error("Checkout: could not save purchase", error);
    return fail(500, "save_failed", "Could not save your order. Please try again.");
  }

  return reply(orderId);
}
