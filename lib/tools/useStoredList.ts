"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const EVENT = "toppershelf:stored-list";
const EMPTY = "[]";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback); // another tab changed it
  window.addEventListener(EVENT, callback); // this tab changed it
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function parse(raw: string): string[] {
  try {
    const saved = JSON.parse(raw);
    return Array.isArray(saved) ? saved.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * A list of ids saved in this browser (favourite tools, recently used tools).
 * The server and the first paint see an empty list, then the saved list appears, so there is no hydration mismatch.
 * Later this can be backed by the signed-in account (Supabase) without changing the callers.
 */
export function useStoredList(key: string) {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key) ?? EMPTY;
      } catch {
        return EMPTY; // storage blocked
      }
    },
    () => EMPTY,
  );
  const items = useMemo(() => parse(raw), [raw]);

  const setItems = useCallback(
    (update: string[] | ((current: string[]) => string[])) => {
      let current = EMPTY;
      try {
        current = localStorage.getItem(key) ?? EMPTY;
      } catch {
        /* storage blocked: nothing saved */
      }
      const base = parse(current);
      const next = typeof update === "function" ? update(base) : update;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* storage full or blocked: skip saving */
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [key],
  );

  return [items, setItems] as const;
}
