import { Capacitor, registerPlugin } from "@capacitor/core";

/**
 * Home-screen widget "Days left" (android/.../CountdownWidgetProvider.java). The app hands it the person's countdowns;
 * the widget works out the days left by itself, so it stays right without the app running.
 *   - at launch and on sign-out: components/CountdownWidgetSync.tsx
 *   - when the list changes: the shared Countdown tool announces it with a "toppershelf:countdowns" event (the website ignores it)
 */
export type CountdownItem = { id: string; title: string; date: string };

const CountdownWidget = registerPlugin<{ set(o: { items: { title: string; date: string }[] }): Promise<void> }>("CountdownWidget");

const supported = () => Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("CountdownWidget");

const todayIso = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

/** Send the countdowns to the widget. Only today and later are sent, soonest first, at most 20. An empty list clears it. */
export async function syncCountdownWidget(items: CountdownItem[]) {
  if (!supported()) return;
  const today = todayIso();
  const upcoming = items
    .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.date) && item.date >= today && item.title.trim())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 20)
    .map((item) => ({ title: item.title.trim().slice(0, 60), date: item.date }));
  await CountdownWidget.set({ items: upcoming }).catch(() => {});
}

/** Call once at launch. */
export function initCountdownWidget() {
  if (!supported()) return;
  let queue: Promise<void> = Promise.resolve();
  window.addEventListener("toppershelf:countdowns", (event) => {
    const items = (event as CustomEvent<CountdownItem[]>).detail;
    if (!Array.isArray(items)) return;
    queue = queue.then(() => syncCountdownWidget(items)).catch(() => {});
  });
}
