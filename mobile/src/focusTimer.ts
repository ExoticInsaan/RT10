import { LocalNotifications } from "@capacitor/local-notifications";
import { allowReminders, remindersSupported } from "./reminders";

/*
 * Focus Timer in the Android app: while the timer runs there is exactly one phone notification scheduled for its end time,
 * so the person is told even with the screen locked or the app closed.
 *
 * - The shared Focus Timer announces every start and stop with a "toppershelf:focus-timer" event ({ endAt, phase }).
 * - There is only ever one timer, so it always uses the same notification id: starting again replaces the old alert,
 *   and pause, skip, reset or leaving the screen cancels it. Nothing can pile up.
 * - Android's alarm service holds the alert; the app does no work while waiting.
 * - Calls run one after another, in the order they were made, so a quick Start then Pause cannot leave a stray alert.
 */
const TIMER_ID = 2_100_000_001; // outside the range reminders use (1 to 2,000,000,000)
const CHANNEL = "toppershelf_timer";

type Phase = "focus" | "short" | "long";
type Detail = { endAt: number | null; phase: Phase };

let channelReady = false;
async function ensureChannel() {
  if (channelReady) return;
  await LocalNotifications.createChannel({
    id: CHANNEL,
    name: "Focus timer",
    description: "Tells you when a focus session or break ends",
    importance: 5,
    visibility: 1,
    vibration: true,
  }).catch(() => {});
  channelReady = true;
}

async function apply({ endAt, phase }: Detail) {
  if (endAt !== null && endAt > Date.now() + 1000) {
    if (!(await allowReminders())) return; // notifications are off: the timer still works, it just cannot alert in the background
    if (endAt <= Date.now() + 1000) return; // the person stopped it or it ended while the permission box was open
    await ensureChannel();
    await LocalNotifications.schedule({
      notifications: [
        {
          id: TIMER_ID,
          title: phase === "focus" ? "Focus session done" : "Break's over",
          body: phase === "focus" ? "Take a break." : "Back to it.",
          channelId: CHANNEL,
          smallIcon: "ic_stat_toppershelf",
          iconColor: "#2563eb",
          schedule: { at: new Date(endAt), allowWhileIdle: true },
          extra: { kind: "focus-timer", path: "/tool/focus-timer" },
        },
      ],
    });
    return;
  }
  // Stopped, skipped, finished or closed: remove the waiting alert and any that is still in the notification shade.
  await LocalNotifications.cancel({ notifications: [{ id: TIMER_ID }] });
  await LocalNotifications.removeDeliveredNotificationsById({ ids: [TIMER_ID] }).catch(() => {});
}

/** Call once at launch. */
export function initFocusTimer() {
  if (!remindersSupported()) return;
  let queue: Promise<void> = Promise.resolve();
  window.addEventListener("toppershelf:focus-timer", (event) => {
    const detail = (event as CustomEvent<Detail>).detail;
    if (!detail) return;
    queue = queue.then(() => apply(detail)).catch(() => {});
  });
}
