// Browser-side helpers for the Razorpay payment window, shared by the single "Buy now" button
// and the cart checkout.

export type RzpSuccess = { razorpay_order_id: string };
export type RzpFailure = { error?: { description?: string } };
export type RzpOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { email?: string };
  theme?: { color: string };
  modal?: { ondismiss?: () => void };
  handler: (response: RzpSuccess) => void;
};
export type RzpInstance = {
  open: () => void;
  on: (event: "payment.failed", cb: (r: RzpFailure) => void) => void;
};
export type RzpCtor = new (o: RzpOptions) => RzpInstance;

export function loadRazorpay(): Promise<RzpCtor | null> {
  const w = window as unknown as { Razorpay?: RzpCtor };
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(w.Razorpay ?? null);
    s.onerror = () => resolve(null);
    document.body.appendChild(s);
  });
}

export const failedPaymentText = (r: RzpFailure) =>
  `Payment failed${r.error?.description ? `: ${r.error.description}` : ""}. If money was deducted, your bank usually returns it in 5 to 7 working days. You can try again.`;
