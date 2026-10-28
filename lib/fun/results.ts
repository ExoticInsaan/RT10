import { SITE_URL } from "@/lib/site";

/** Pages that rebuild a solo Fun Zone result for anyone who opens the link (same name, same result). */
export type ResultKind = "cooked" | "vibe" | "excuse" | "roast";

export function resultLink(kind: ResultKind, params: Record<string, string | number>) {
  const qs = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
  return `${SITE_URL}/fun/${kind}?${qs}`;
}
