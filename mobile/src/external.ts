import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

/** Open a web page (Terms, Privacy) in the phone's browser tab instead of replacing the app. */
export async function openExternal(url: string) {
  if (Capacitor.isNativePlatform()) await Browser.open({ url });
  else window.open(url, "_blank", "noopener");
}
