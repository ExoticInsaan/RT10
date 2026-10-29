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

/** Where a download was saved. Sent to the "Saved" message (components/SavedToast.tsx). */
export type SavedFile = { uri: string; name: string; folder: "Downloads" | "Pictures"; mimeType: string };
export const SAVED_EVENT = "ts-saved";

/** Our own Android plugin (android/app/src/main/java/online/toppershelf/app/DownloadsPlugin.java). */
const Downloads = registerPlugin<{
  save(o: { data: string; filename: string; mimeType: string }): Promise<Omit<SavedFile, "mimeType">>;
  open(o: { uri: string; mimeType: string }): Promise<void>;
  share(o: { uri: string; mimeType: string }): Promise<void>;
}>("Downloads");

export const openSaved = (f: SavedFile) => Downloads.open({ uri: f.uri, mimeType: f.mimeType });
export const shareSaved = (f: SavedFile) => Downloads.share({ uri: f.uri, mimeType: f.mimeType });

const MIME: Record<string, string> = {
  pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif",
  txt: "text/plain", csv: "text/csv", json: "application/json", zip: "application/zip",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};
const mimeFor = (blob: Blob, filename: string) => blob.type || MIME[filename.split(".").pop()?.toLowerCase() ?? ""] || "application/octet-stream";

/**
 * Android's WebView ignores `<a download>` on blob links, and the PDF and image tools save files that way.
 * On the phone, a click on such a link saves the file to the phone (Downloads, or Pictures for images) and shows a
 * "Saved" message with Open and Share. On Android 9 and older, or if saving fails, it opens the Share sheet instead.
 */
function handleBlobDownloads() {
  const original = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function patched(this: HTMLAnchorElement) {
    if (this.download && this.href.startsWith("blob:")) {
      void saveDownload(this.href, this.download);
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

async function saveDownload(url: string, filename: string) {
  try {
    const blob = await (await fetch(url)).blob();
    const data = await blobToBase64(blob);
    const mimeType = mimeFor(blob, filename);
    try {
      const saved = await Downloads.save({ data, filename, mimeType });
      window.dispatchEvent(new CustomEvent<SavedFile>(SAVED_EVENT, { detail: { ...saved, mimeType } }));
      return;
    } catch {
      /* Android 9 or older, or the phone refused: use the Share sheet below */
    }
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

/** Our Android plugin (SystemUiPlugin.java): colours the strips behind the status bar and the navigation keys. */
const SystemUi = registerPlugin<{ setBars(o: { top: string; bottom: string }): Promise<void> }>("SystemUi");

// [screens, colour behind the status bar, colour behind the navigation bar, status bar icon style]
const bars: [RegExp, string, string, Style][] = [
  [/^\/(fun|onboard\/2)$|^\/tool\/(decision-wheel|would-you-rather|grow-a-sapling|friendship-score|what-am-i-to-you|how-well-do-you-know-me|how-cooked|excuse-generator|roast-my-timetable|vibe-check)$/, "#6d28d9", "#f97316", Style.Dark],
  [/^\/signin$/, "#102a4c", "#102a4c", Style.Dark],
];

/** Colour the strips behind the phone's own status bar and navigation bar to match the screen between them. */
export function setStatusBar(path: string) {
  if (!isNative) return;
  const hit = bars.find(([re]) => re.test(path));
  const [top, bottom, style] = hit ? [hit[1], hit[2], hit[3]] : ["#fffbf7", "#fffbf7", Style.Light];
  void SystemUi.setBars({ top, bottom }).catch(() => {});
  void StatusBar.setBackgroundColor({ color: top }).catch(() => {});
  void StatusBar.setStyle({ style }).catch(() => {});
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
