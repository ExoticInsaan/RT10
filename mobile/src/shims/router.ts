import { useSyncExternalStore } from "react";

/** A tiny hash router: the app is a static bundle, so routes live after the # (works inside Capacitor with no server). */
const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const read = () => window.location.hash.replace(/^#/, "") || "/";

export function usePath() {
  return useSyncExternalStore(subscribe, read, () => "/");
}
export function navigate(to: string, replace = false) {
  if (replace) window.location.replace("#" + to);
  else window.location.hash = to;
}
export function back() {
  window.history.back();
}
