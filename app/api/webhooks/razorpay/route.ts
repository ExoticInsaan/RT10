import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { razorpay } from "@/lib/razorpay";

// Razorpay calls this URL after a payment. One payment can cover several resources (the cart).
// Access is unlocked ONLY here,
// after the signature is verified. Never because the browser says "paid".
//
// Enable these events in Razorpay Dashboard > Webhooks:
//   payment.captured, payment.failed, refund.processed   (order.paid is also understood)
//
// Answering 500 makes Razorpay retry later, so use it only when WE failed to record something.
// Answering 200 tells Razorpay "got it".

type PaymentEntity = { id: string; order_id: string; amount: number; currency?: string };
type RefundEntity = { id: string; payment_id: string; amount: number };
type WebhookEvent = {
  event: string;
  payload?: { payment?: { entity?: PaymentEntity }; refund?: { entity?: RefundEntity } };
};

const ok = () => NextResponse.json({ ok: true });
const retryLater = (message: string) => NextResponse.json({ error: message }, { status: 500 });

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    // Never verify against an empty secret: anyone could forge that signature.
    console.error("Webhook: RAZORPAY_WEBHOOK_SECRET is not set. Rejecting the request.");
    return retryLater("Webhook is not configured.");
  }

  const rawBody = await request.text(); // signature is over the exact raw body
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(rawBody) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }

  const admin = createAdminClient();
  const pay = event.payload?.payment?.entity;

  // ---- Payment succeeded: unlock the resource -------------------------------------------------
  if (event.event === "payment.captured" || event.event === "order.paid") {
    if (!pay?.id || !pay.order_id) return ok();
    if (pay.currency && pay.currency !== "INR") {
      console.error("Webhook: unexpected currency", pay.currency, pay.id);
      return ok();
    }

    // One order can cover several resources: one purchases row each, all with the same
    // gateway_order_id. The payment must equal the sum of those rows, otherwise it is not ours to unlock.
    const { data: rows, error: readError } = await admin
      .from("purchases")
      .select("amount, status")
      .eq("gateway_order_id", pay.order_id);
    if (readError) {
      console.error("Webhook: could not read order", pay.order_id, readError);
      return retryLater("Could not read order.");
    }
    const expected = (rows ?? []).reduce((sum, r) => sum + r.amount, 0);
    if (!rows?.length || expected !== pay.amount) {
      console.error("Webhook: payment does not match any order", {
        payment: pay.id,
        order: pay.order_id,
        paid: pay.amount,
        expected: rows?.length ? expected : null,
      });
      return ok();
    }
    // Nothing left to unlock: already processed (safe to receive the same event twice).
    if (!rows.some((r) => r.status === "pending" || r.status === "failed")) return ok();

    // A failed attempt may be followed by a successful retry on the same order, so 'failed' rows
    // can still become 'paid'. Rows that are already 'paid' are left alone.
    const { error } = await admin
      .from("purchases")
      .update({ status: "paid", gateway_payment_id: pay.id })
      .eq("gateway_order_id", pay.order_id)
      .in("status", ["pending", "failed"]);

    if (error) {
      if (error.code === "23505" && error.message.includes("one_paid_purchase_per_item")) {
        // The student already owns one of these resources, so this payment is a duplicate.
        // The whole payment is refunded (they can buy the rest again).
        return refundDuplicate(admin, pay);
      }
      console.error("Webhook: could not mark purchase paid", pay.id, error);
      return retryLater("Could not record payment.");
    }
    return ok();
  }

  // ---- Payment attempt failed -----------------------------------------------------------------
  if (event.event === "payment.failed") {
    if (pay?.order_id) {
      const { error } = await admin
        .from("purchases")
        .update({ status: "failed" })
        .eq("gateway_order_id", pay.order_id)
        .eq("status", "pending");
      if (error) {
        console.error("Webhook: could not mark purchase failed", pay.order_id, error);
        return retryLater("Could not record failure.");
      }
    }
    return ok();
  }

  // ---- Money returned: take access away -------------------------------------------------------
  if (event.event === "refund.processed") {
    const refund = event.payload?.refund?.entity;
    if (refund?.payment_id) {
      const { data: rows, error: readError } = await admin
        .from("purchases")
        .select("amount")
        .eq("gateway_payment_id", refund.payment_id)
        .eq("status", "paid");
      if (readError) {
        console.error("Webhook: could not read refunded payment", refund.payment_id, readError);
        return retryLater("Could not record refund.");
      }
      if (rows?.length) {
        const total = rows.reduce((sum, r) => sum + r.amount, 0);
        // refund.amount is this refund only. Ask Razorpay for the running total so two part-refunds add up.
        const payment = await razorpay<{ amount_refunded?: number }>(`/payments/${refund.payment_id}`);
        const refunded = Math.max(refund.amount, payment.ok ? (payment.data.amount_refunded ?? 0) : 0);
        // Only a refund of the full payment removes access; a partial refund keeps it.
        if (refunded >= total) {
          const { error } = await admin
            .from("purchases")
            .update({ status: "refunded" })
            .eq("gateway_payment_id", refund.payment_id)
            .eq("status", "paid");
          if (error) {
            console.error("Webhook: could not mark purchase refunded", refund.payment_id, error);
            return retryLater("Could not record refund.");
          }
        }
      }
    }
    return ok();
  }

  return ok();
}

// The student paid twice for something they already own. Give the second payment back
// and keep a record of it, so the money is never taken without a trace.
async function refundDuplicate(admin: ReturnType<typeof createAdminClient>, pay: PaymentEntity) {
  const existing = await razorpay<{ amount?: number; amount_refunded?: number }>(`/payments/${pay.id}`);
  const alreadyRefunded =
    existing.ok && (existing.data.amount_refunded ?? 0) >= (existing.data.amount ?? pay.amount);

  if (!alreadyRefunded) {
    const refund = await razorpay(`/payments/${pay.id}/refund`, {
      method: "POST",
      body: { notes: { reason: "Duplicate purchase of a resource the student already owns" } },
    });
    if (!refund.ok) {
      console.error("Webhook: DUPLICATE PAYMENT COULD NOT BE REFUNDED. Refund it by hand.", pay.id, refund.data);
      return retryLater("Could not refund duplicate payment.");
    }
  }

  const { error } = await admin
    .from("purchases")
    .update({ status: "refunded", gateway_payment_id: pay.id })
    .eq("gateway_order_id", pay.order_id)
    .in("status", ["pending", "failed"]);
  if (error) {
    console.error("Webhook: refunded a duplicate but could not record it", pay.id, error);
    return retryLater("Could not record refund.");
  }
  console.warn("Webhook: duplicate payment refunded", pay.id);
  return ok();
}
