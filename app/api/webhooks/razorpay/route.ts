import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Razorpay calls this URL after a payment. Access is unlocked ONLY here,
// after the signature is verified. Never because the browser says "paid".
export async function POST(request: Request) {
  const rawBody = await request.text(); // signature is over the exact raw body
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET ?? "")
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    payload?: { payment?: { entity?: { id: string; order_id: string; amount: number } } };
  };

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const pay = event.payload?.payment?.entity;
    if (pay?.order_id) {
      const admin = createAdminClient();
      // Safe to receive twice: only a pending row with the matching amount is updated,
      // and gateway_payment_id has a unique constraint.
      await admin
        .from("purchases")
        .update({ status: "paid", gateway_payment_id: pay.id })
        .eq("gateway_order_id", pay.order_id)
        .eq("amount", pay.amount)
        .eq("status", "pending");
    }
  }

  // Always answer 200 for valid signatures so Razorpay stops retrying.
  return NextResponse.json({ ok: true });
}
