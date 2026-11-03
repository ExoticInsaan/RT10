import { createClient } from "@/lib/supabase/client";

/**
 * Anonymous "tool opened" counting, shared by the website and the Android app (see supabase/migrations/0009).
 * Only the tool name, website or app, and signed in or not are sent. No account, device or IP details.
 * It never throws and never makes a page wait: if tracking fails (offline, table not set up yet) nothing happens.
 */
type GlobalWithExtras = {
  Capacitor?: { isNativePlatform?: () => boolean };
  gtag?: (...args: unknown[]) => void;
};

export function trackToolOpen(toolId: string, signedIn: boolean) {
  try {
    if (typeof window === "undefined") return;
    // Once per tool per visit, so refreshing or flicking between screens does not inflate the numbers.
    // The signed-in state is part of the key so "opened, then signed in and opened again" is counted as it happened.
    const key = `tp-open-${toolId}-${signedIn ? "in" : "out"}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const g = window as unknown as GlobalWithExtras;
    const platform = g.Capacitor?.isNativePlatform?.() ? "app" : "web";

    // Google Analytics (website only; the function exists only when analytics is switched on).
    g.gtag?.("event", "tool_open", { tool_id: toolId, signed_in: signedIn });

    void createClient()
      .from("tool_events")
      .insert({ tool_id: toolId, event: "open", platform, signed_in: signedIn })
      .then(
        () => undefined,
        () => undefined,
      );
  } catch {
    /* tracking must never break a page */
  }
}
