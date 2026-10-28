import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { TAB_PATHS } from "./components/BottomNav";
import { navigate } from "./shims/router";

export const isNative = Capacitor.isNativePlatform();

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

async function saveAndShare(url: string, filename: string) {
  try {
    const blob = await (await fetch(url)).blob();
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
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
  void SplashScreen.hide().catch(() => {});
}
