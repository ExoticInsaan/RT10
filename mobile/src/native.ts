import { Capacitor, registerPlugin } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { TAB_PATHS } from "./components/BottomNav";
import { navigate } from "./shims/router";

export const isNative = Capacitor.isNativePlatform();

/** Java plugin in android/app/src/main/java/online/toppershelf/app/StorySharePlugin.java */
const StoryShare = registerPlugin<{
  available(): Promise<{ instagram: boolean; whatsapp: boolean }>;
  shareImage(o: { uri: string; text?: string; title?: string }): Promise<void>;
}>("StoryShare");


/**
 * Android's WebView ignores `<a download>` on blob links, and the PDF and image tools save files that way.
 * On the phone, a click on such a link writes the file to the app cache and opens the Share sheet (Save to Files, Drive, WhatsApp…).
 */
function handleBlobDownloads() {
  const original = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function patched(this: HTMLAnchorElement) {
    if (this.download && this.href.startsWith("blob:")) {
      void saveAndShare(this.href, this.download);
      return;
    }
    original.call(this);
  };
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function saveAndShare(url: string, filename: string) {
  try {
    const blob = await (await fetch(url)).blob();
    const data = await blobToBase64(blob);
    const saved = await Filesystem.writeFile({ path: filename, data, directory: Directory.Cache });
    await Share.share({ title: filename, url: saved.uri, dialogTitle: "Save or share" });
  } catch {
    /* the person closed the Share sheet, or storage is full: nothing to do */
  }
}

/** Android back button: tabs go to Home, Home and the intro screens close the app, everything else goes back one screen. */
function handleBackButton() {
  void App.addListener("backButton", () => {
    const path = window.location.hash.replace(/^#/, "") || "/";
    if (path === "/home" || path === "/" || path === "/signin") void App.exitApp();
    else if (TAB_PATHS.includes(path)) navigate("/home", true);
    else window.history.back();
  });
}

const bars: [RegExp, string, Style][] = [
  [/^\/(fun|onboard\/2)$|^\/tool\/(decision-wheel|would-you-rather|grow-a-sapling|friendship-score|what-am-i-to-you|how-well-do-you-know-me|how-cooked|excuse-generator|roast-my-timetable|vibe-check)$/, "#6d28d9", Style.Dark],
  [/^\/signin$/, "#102a4c", Style.Dark],
];

/** Colour the Android status bar to match the screen under it. */
export function setStatusBar(path: string) {
  if (!isNative) return;
  const hit = bars.find(([re]) => re.test(path));
  void StatusBar.setBackgroundColor({ color: hit ? hit[1] : "#fffbf7" }).catch(() => {});
  void StatusBar.setStyle({ style: hit ? hit[2] : Style.Light }).catch(() => {});
}

export function initNative() {
  if (!isNative) return;
  handleBlobDownloads();
  handleBackButton();
  // The friend games call this to open the Android share sheet (WhatsApp, Messages, Instagram and so on).
  (window as unknown as { __tsShare?: (o: { title: string; text: string; url: string }) => Promise<void> }).__tsShare = async ({ title, text, url }) => {
    await Share.share({ title, text, url, dialogTitle: "Share with friends" });
  };
  // Story cards: the picture goes to the app cache and the Android share sheet opens with it (WhatsApp, Instagram, Messages…) with Story and Status shortcuts.
  (window as unknown as { __tsShareImage?: (o: { blob: Blob; filename: string; text: string }) => Promise<void> }).__tsShareImage = async ({ blob, filename, text }) => {
    const data = await blobToBase64(blob);
    const saved = await Filesystem.writeFile({ path: filename, data, directory: Directory.Cache });
    // Same Android share dialog as before, plus "Instagram Story" and "WhatsApp Status" in the app row.
    await StoryShare.shareImage({ uri: saved.uri, text, title: "Share your card" });
  };
  void SplashScreen.hide().catch(() => {});
}
