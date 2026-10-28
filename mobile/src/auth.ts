import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { createClient } from "./shims/supabase-client";

/** Deep link Google sends the person back to. Add it to Supabase → Authentication → URL Configuration → Redirect URLs. */
export const REDIRECT = "online.toppershelf.app://auth";

/** Start "Continue with Google". On Android it opens a secure browser tab and returns through the deep link; in a normal browser it redirects. */
export async function signInWithGoogle(): Promise<string | null> {
  try {
    const supabase = createClient();
    if (!Capacitor.isNativePlatform()) {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
      return error ? error.message : null;
    }
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: REDIRECT, skipBrowserRedirect: true } });
    if (error || !data?.url) return error?.message ?? "Could not start Google sign-in.";
    await Browser.open({ url: data.url });
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : "Sign-in is not available right now.";
  }
}

/** Finish sign-in when Android hands the app the deep link after Google. Returns a function that stops listening. */
export function listenForOAuthReturn(onSignedIn: () => void): () => void {
  if (!Capacitor.isNativePlatform()) return () => {};
  let handle: { remove: () => Promise<void> } | null = null;
  let stopped = false;
  App.addListener("appUrlOpen", async ({ url }) => {
    if (!url.startsWith(REDIRECT)) return;
    try {
      await Browser.close();
    } catch {
      /* already closed */
    }
    const code = new URL(url).searchParams.get("code");
    if (!code) return;
    const { error } = await createClient().auth.exchangeCodeForSession(code);
    if (!error) onSignedIn();
  }).then((h) => {
    if (stopped) void h.remove();
    else handle = h;
  });
  return () => {
    stopped = true;
    void handle?.remove();
  };
}
