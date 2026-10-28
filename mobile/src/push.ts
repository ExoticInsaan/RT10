import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { navigate } from "./shims/router";

/*
 * Push notifications (Firebase Cloud Messaging). You send them from the Firebase console → Messaging → New campaign.
 * Optional data on a notification: "path" opens a screen when it is tapped, e.g. /tool/cgpa-calculator, /fun, /shelf.
 */
const KEY = "toppershelf-push-on";
const CHANNEL = "toppershelf_default";

export const pushSupported = () => Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("PushNotifications");

export const pushWanted = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};
const remember = (on: boolean) => {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* storage blocked: the choice is asked again next time */
  }
};

let wired = false;
async function wire() {
  if (wired) return;
  wired = true;
  await PushNotifications.createChannel({ id: CHANNEL, name: "TopperShelf updates", description: "News about new tools and games", importance: 4 }).catch(() => {});
  await PushNotifications.addListener("pushNotificationActionPerformed", (event) => {
    const path = event.notification.data?.path;
    if (typeof path === "string" && path.startsWith("/")) navigate(path);
  });
}

/** Ask Android for permission and register this phone for notifications. Returns a short message when it cannot. */
export async function enablePush(): Promise<string | null> {
  if (!pushSupported()) return "Notifications work in the Android app.";
  try {
    await wire();
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") perm = await PushNotifications.requestPermissions();
    if (perm.receive !== "granted") {
      remember(false);
      return "Notifications are blocked. Turn them on in Android Settings → Apps → TopperShelf → Notifications.";
    }
    await PushNotifications.register();
    remember(true);
    return null;
  } catch {
    return "Could not turn notifications on right now.";
  }
}

export async function disablePush() {
  remember(false);
  if (!pushSupported()) return;
  try {
    await PushNotifications.unregister();
  } catch {
    /* already off */
  }
}

/** On launch: if the person already said yes, make sure this phone is still registered (the token can change). */
export async function restorePush() {
  if (!pushSupported() || !pushWanted()) return;
  void enablePush();
}
