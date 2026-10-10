import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/checkout  { slug: string }
// The price is ALWAYS read from the database, never from the browser.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  const { slug } = (await request.json().catch(() => ({}))) as { slug?: string };
  if (!slug) {
    return NextResponse.json({ error: "Missing product." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: product } = await admin
    .from("products")
    .select("id, title, price")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const { data: already } = await admin
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", product.id)
    .eq("status", "paid")
    .maybeSingle();
  if (already) {
    return NextResponse.json({ error: "You already own this item." }, { status: 409 });
  }

  const amountPaise = Math.round(Number(product.price) * 100);
  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: `${user.id.slice(0, 8)}-${Date.now()}`,
      notes: { user_id: user.id, product_id: product.id },
    }),
  });
  if (!res.ok) {
    return NextResponse.json({ error: "Could not start payment." }, { status: 502 });
  }
  const order = (await res.json()) as { id: string };

  const { error } = await admin.from("purchases").insert({
    user_id: user.id,
    product_id: product.id,
    gateway_order_id: order.id,
    amount: amountPaise,
    status: "pending",
  });
  if (error) {
    return NextResponse.json({ error: "Could not save order." }, { status: 500 });
  }

  return NextResponse.json({
    orderId: order.id,
    amount: amountPaise,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
    name: product.title,
  });
}
