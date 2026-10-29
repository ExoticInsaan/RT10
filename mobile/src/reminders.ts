import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { navigate } from "./shims/router";

/*
 * Reminders for the Android app. Each reminder becomes a notification scheduled with Android's own alarm service,
 * so it appears at the chosen time even when the app is closed (and again after the phone restarts: the plugin restores them).
 * The website keeps its own in-page alerts; this file is only used by the app.
 */
export type ReminderItem = { id: string; title: string; note: string; at: number; fired: boolean };

const CHANNEL = "toppershelf_reminders";
const KIND = "reminder";

export const remindersSupported = () => Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("LocalNotifications");

/** The same reminder always gets the same number, so saving it again replaces it instead of adding a second alert. */
export function notificationId(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return (Math.abs(hash) % 2_000_000_000) + 1;
}

let channelReady = false;
async function ensureChannel() {
  if (channelReady) return;
  await LocalNotifications.createChannel({
    id: CHANNEL,
    name: "Reminders",
    description: "Alerts for the reminders you set",
    importance: 5,
    visibility: 1,
    vibration: true,
  }).catch(() => {});
  channelReady = true;
}

/** Ask Android for permission to show notifications (Android 13+ shows a prompt). Returns true when allowed. */
export async function allowReminders(): Promise<boolean> {
  if (!remindersSupported()) return false;
  try {
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display === "prompt" || perm.display === "prompt-with-rationale") perm = await LocalNotifications.requestPermissions();
    return perm.display === "granted";
  } catch {
    return false;
  }
}

export async function remindersAllowed(): Promise<boolean> {
  if (!remindersSupported()) return false;
  try {
    return (await LocalNotifications.checkPermissions()).display === "granted";
  } catch {
    return false;
  }
}

/**
 * Makes the phone's scheduled alerts match the list: upcoming reminders are scheduled, deleted or finished ones are cancelled.
 * Safe to call as often as needed.
 */
export async function syncReminders(items: ReminderItem[]) {
  if (!remindersSupported() || !(await remindersAllowed())) return;
  try {
    await ensureChannel();
    const now = Date.now();
    const upcoming = items.filter((i) => !i.fired && i.at > now + 1000);
    const wanted = new Set(upcoming.map((i) => notificationId(i.id)));

    const { notifications } = await LocalNotifications.getPending();
    const stale = notifications.filter((n) => n.extra?.kind === KIND && !wanted.has(n.id)).map((n) => ({ id: n.id }));
    if (stale.length) await LocalNotifications.cancel({ notifications: stale });

    if (upcoming.length) {
      await LocalNotifications.schedule({
        notifications: upcoming.map((i) => ({
          id: notificationId(i.id),
          title: i.title,
          body: i.note || "Reminder from TopperShelf",
          channelId: CHANNEL,
          smallIcon: "ic_stat_toppershelf",
          iconColor: "#2563eb",
          schedule: { at: new Date(i.at), allowWhileIdle: true },
          extra: { kind: KIND, path: "/tool/reminder" },
        })),
      });
    }
  } catch {
    /* scheduling failed (for example the person turned notifications off): the list still saves */
  }
}

/** Cancels every reminder alert on this phone (used when the person signs out). */
export async function cancelAllReminders() {
  if (!remindersSupported()) return;
  try {
    const { notifications } = await LocalNotifications.getPending();
    const mine = notifications.filter((n) => n.extra?.kind === KIND).map((n) => ({ id: n.id }));
    if (mine.length) await LocalNotifications.cancel({ notifications: mine });
  } catch {
    /* nothing scheduled */
  }
}

/** Tapping a reminder notification opens the Reminder screen. Call once at launch. */
export function initReminders() {
  if (!remindersSupported()) return;
  void LocalNotifications.addListener("localNotificationActionPerformed", (event) => {
    const path = event.notification.extra?.path;
    if (typeof path === "string" && path.startsWith("/")) navigate(path);
  });
}
