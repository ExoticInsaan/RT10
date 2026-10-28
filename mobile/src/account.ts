import { createClient } from "./shims/supabase-client";

/**
 * Delete the signed-in person's account and everything saved in it.
 * Runs the `delete-account` Supabase function (supabase/functions/delete-account), which checks who is asking,
 * removes their saved tool data and deletes the login. Returns a message when it did not work.
 */
export async function deleteMyAccount(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { error } = await supabase.functions.invoke("delete-account", { method: "POST" });
    if (error) return "We could not delete your account right now. Please try again, or email support@toppershelf.online.";
    await supabase.auth.signOut({ scope: "local" }).catch(() => {});
    return null;
  } catch {
    return "We could not reach the server. Check your internet connection and try again.";
  }
}

/** Remove what the app keeps on this phone (favourites, recent tools, saved tool choices). Keeps the intro-seen and notification choices. */
export function clearLocalData() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("toppershelf") && key !== "toppershelf-push-on" && !key.includes("onboard")) localStorage.removeItem(key);
    }
  } catch {
    /* storage blocked: nothing to clear */
  }
}
