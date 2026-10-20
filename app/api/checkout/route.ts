import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { razorpay, razorpayConfigured } from "@/lib/razorpay";

// POST /api/checkout  { slugs: string[] }   (a single { slug: string } is accepted too)
// One Razorpay order pays for every resource in the cart. Each resource gets its own `purchases`
// row, and all rows of one order share the same gateway_order_id.
// The price is ALWAYS read from the database, never from the browser.
//
// Every error carries a `code` so the page can show a clear message:
//   login_required, bad_request, too_many, not_found, items_changed, already_owned, confirming,
//   not_configured, gateway_error, save_failed
const MAX_ITEMS = 20;

const fail = (status: number, code: string, error: string, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ code, error, ...extra }, { status });

type OpenRow = { gateway_order_id: string; product_id: string; amount: number };

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail(401, "login_required", "Please log in first.");

  const body = (await request.json().catch(() => ({}))) as { slug?: unknown; slugs?: unknown };
  const asked = Array.isArray(body.slugs) ? body.slugs : body.slug ? [body.slug] : [];
  const slugs = Array.from(
    new Set(asked.filter((s): s is string => typeof s === "string" && s.length > 0 && s.length < 200)),
  );
  if (!slugs.length) return fail(400, "bad_request", "Your cart is empty.");
  if (slugs.length > MAX_ITEMS) {
    return fail(400, "too_many", `You can pay for up to ${MAX_ITEMS} resources at once. Please remove a few.`);
  }

  if (!razorpayConfigured()) {
    console.error("Checkout: RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set.");
    return fail(500, "not_configured", "Payments are not available right now. Please try again later.");
  }

  const admin = createAdminClient();

  const { data: found } = await admin
    .from("products")
    .select("id, slug, title, price")
    .in("slug", slugs)
    .eq("published", true);
  const products = (found ?? []) as { id: string; slug: string; title: string; price: number }[];
  if (!products.length) return fail(404, "not_found", "This resource is not available.");
  if (products.length !== slugs.length) {
    const have = new Set(products.map((p) => p.slug));
    return fail(
      409,
      "items_changed",
      "Some items in your cart are no longer available, so we removed them. Check your total and try again.",
      { unavailable: slugs.filter((s) => !have.has(s)) },
    );
  }
  // Free resources are never paid for. They are added to the library from their own page (/api/claim).
  const freeOnes = products.filter((p) => Number(p.price) <= 0);
  if (freeOnes.length) {
    return fail(
      409,
      "items_changed",
      "Free resources cannot be bought, so we removed them from your cart. Open them from their page to add them to your library.",
      { unavailable: freeOnes.map((p) => p.slug) },
    );
  }
  const ids = products.map((p) => p.id);

  // Never charge for something the student already owns.
  const { data: ownedRows } = await admin
    .from("purchases")
    .select("product_id")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .in("product_id", ids);
  const ownedIds = new Set((ownedRows ?? []).map((r: { product_id: string }) => r.product_id));
  if (ownedIds.size) {
    const owned = products.filter((p) => ownedIds.has(p.id));
    return fail(
      409,
      "already_owned",
      products.length === 1 ? "You already own this resource." : `You already own: ${owned.map((p) => p.title).join(", ")}.`,
      { owned: owned.map((p) => p.slug) },
    );
  }

  const lines = products.map((p) => ({ product: p, amount: Math.round(Number(p.price) * 100) }));
  const amountPaise = lines.reduce((sum, l) => sum + l.amount, 0);
  const wanted = new Set(ids);
  const title = products.length === 1 ? products[0].title : `${products.length} resources`;
  const reply = (orderId: string) =>
    NextResponse.json({
      orderId,
      amount: amountPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      name: title,
    });

  // A student who clicks Pay twice (or reopens the cart) must not get a second order:
  // two open orders can both be paid, which charges them twice. Look at every unfinished order that
  // touches one of these resources, newest first. If any is already paid at Razorpay (our webhook just
  // has not unlocked it yet) stop. If one is for exactly this set, reuse it.
  const { data: touching } = await admin
    .from("purchases")
    .select("gateway_order_id")
    .eq("user_id", user.id)
    .in("product_id", ids)
    .in("status", ["pending", "failed"])
    .order("created_at", { ascending: false })
    .limit(100);
  const orderIds = Array.from(new Set((touching ?? []).map((r: { gateway_order_id: string }) => r.gateway_order_id))).slice(0, 5);

  if (orderIds.length) {
    const { data: orderRows } = await admin
      .from("purchases")
      .select("gateway_order_id, product_id, amount")
      .in("gateway_order_id", orderIds);
    const orders = new Map<string, { products: Set<string>; total: number }>();
    for (const row of (orderRows ?? []) as OpenRow[]) {
      const entry = orders.get(row.gateway_order_id) ?? { products: new Set<string>(), total: 0 };
      entry.products.add(row.product_id);
      entry.total += row.amount;
      orders.set(row.gateway_order_id, entry);
    }

    for (const orderId of orderIds) {
      const existing = await razorpay<{ status?: string }>(`/orders/${orderId}`);
      if (!existing.ok) continue;
      if (existing.data.status === "paid") {
        return fail(
          409,
          "confirming",
          "Your payment was received and is being confirmed. Please check My Library in a minute. Do not pay again.",
        );
      }
      if (existing.data.status === "created" || existing.data.status === "attempted") {
        const entry = orders.get(orderId);
        const sameSet =
          entry && entry.total === amountPaise && entry.products.size === wanted.size && ids.every((id) => entry.products.has(id));
        if (sameSet) return reply(orderId);
      }
    }
  }

  const created = await razorpay<{ id?: string }>("/orders", {
    method: "POST",
    body: {
      amount: amountPaise,
      currency: "INR",
      receipt: `${user.id.slice(0, 8)}-${Date.now()}`,
      notes: { user_id: user.id, items: String(products.length) },
    },
  });
  if (!created.ok || !created.data.id) {
    console.error("Checkout: Razorpay order failed", created.status, created.data);
    return fail(502, "gateway_error", "Could not start payment. Please try again.");
  }
  const orderId = created.data.id;

  const { error } = await admin.from("purchases").insert(
    lines.map((l) => ({
      user_id: user.id,
      product_id: l.product.id,
      gateway_order_id: orderId,
      amount: l.amount,
      status: "pending",
    })),
  );
  if (error) {
    console.error("Checkout: could not save purchase", error);
    return fail(500, "save_failed", "Could not save your order. Please try again.");
  }

  return reply(orderId);
}
