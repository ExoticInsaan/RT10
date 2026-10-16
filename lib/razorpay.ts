// Small helper for calling the Razorpay API from server code.
// RAZORPAY_API_URL exists only so tests can point at a fake server; leave it unset in production.
const BASE = process.env.RAZORPAY_API_URL ?? "https://api.razorpay.com/v1";

export function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export async function razorpay<T = Record<string, unknown>>(
  path: string,
  options: { method?: "GET" | "POST"; body?: unknown } = {},
): Promise<{ ok: boolean; status: number; data: T }> {
  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");
  const res = await fetch(`${BASE}${path}`, {
    method: options.method ?? "GET",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}
