"use client";

import { useEffect, useState, type RefObject } from "react";

const KEY = "__ludoFs";

/**
 * Full-screen play. While `active` is true the element in `ref` is shown full screen: the browser's real full
 * screen where it allows it, otherwise the element simply covers the whole page. Returns true while that is on,
 * so the caller can switch its layout.
 *
 * It starts once when `active` turns true (not again after the player has backed out) and takes one history
 * entry, so the phone's back key, the browser's back button and a Back button inside the game all just return
 * the player to the normal page. Pressing Esc or the system back gesture on a real full screen does the same.
 * It never starts on its own page load: browsers only allow full screen right after a tap, and the Start tap
 * that makes `active` true is that tap.
 */
export function useImmersive(ref: RefObject<HTMLElement | null>, active: boolean): boolean {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!active) return;
    let entered = false;
    let prevOverflow = "";

    // Back to the normal page. `popped` is true when the history entry has already been taken off by the back key.
    const exit = (popped: boolean) => {
      if (!entered) return;
      entered = false;
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.body.style.overflow = prevOverflow;
      setOn(false);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      const state = window.history.state as Record<string, unknown> | null;
      if (!popped && state?.[KEY]) window.history.back();
    };
    const onPop = () => exit(true);
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) exit(false);
    };

    // Next.js patches pushState, so this entry keeps the router's own state and the URL stays the same.
    // The timeout means a development double-mount only enters once.
    const timer = window.setTimeout(() => {
      entered = true;
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      window.history.pushState({ [KEY]: 1 }, "");
      window.addEventListener("popstate", onPop);
      setOn(true);
      const el = ref.current;
      if (el && typeof el.requestFullscreen === "function") {
        el.requestFullscreen({ navigationUI: "hide" })
          .then(() => {
            if (entered) document.addEventListener("fullscreenchange", onFullscreenChange);
          })
          .catch(() => {
            // iPhone Safari and some in-app browsers refuse: the covering layout is the full screen there.
          });
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
      exit(false);
    };
  }, [active, ref]);

  return on;
}
