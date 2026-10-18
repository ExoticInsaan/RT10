// Small helpers for Google Analytics 4. Everything here is safe to call when
// analytics is not set up (the calls simply do nothing), and nothing personal is ever sent.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: string, params: Record<string, unknown> = {}) {
  try {
    window.gtag?.("event", event, params);
  } catch {
    // Never let tracking break the shop.
  }
}

type Trackable = { slug: string; title: string; type: string; price: number };

export const itemOf = (p: Trackable) => ({
  item_id: p.slug,
  item_name: p.title,
  item_category: p.type,
  price: p.price,
  quantity: 1,
});

const money = (items: Trackable[]) => items.reduce((sum, p) => sum + p.price, 0);

export const trackViewItem = (p: Trackable) =>
  track("view_item", { currency: "INR", value: p.price, items: [itemOf(p)] });

export const trackAddToCart = (p: Trackable) =>
  track("add_to_cart", { currency: "INR", value: p.price, items: [itemOf(p)] });

export const trackRemoveFromCart = (p: Trackable) =>
  track("remove_from_cart", { currency: "INR", value: p.price, items: [itemOf(p)] });

export const trackBeginCheckout = (items: Trackable[]) =>
  track("begin_checkout", { currency: "INR", value: money(items), items: items.map(itemOf) });

/** A paid order. */
export const trackPurchase = (orderId: string, items: Trackable[]) =>
  track("purchase", { transaction_id: orderId, currency: "INR", value: money(items), items: items.map(itemOf) });
