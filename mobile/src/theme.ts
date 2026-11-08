import { useSyncExternalStore } from "react";

/**
 * Light and dark mode. The person picks System (follow the phone), Light or Dark in Settings > Appearance.
 * The choice is kept on the phone. The page is coloured before the first paint by the small script in index.html;
 * this file keeps it in step afterwards.
 */
export type ThemeChoice = "system" | "light" | "dark";
export type Theme = "light" | "dark";

const KEY = "ts-theme";
const PAGE_COLOUR: Record<Theme, string> = { light: "#fffbf7", dark: "#0f1623" };
const listeners = new Set<() => void>();

const prefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

export function getChoice(): ThemeChoice {
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(choice: ThemeChoice = getChoice()): Theme {
  return choice === "system" ? (prefersDark() ? "dark" : "light") : choice;
}

function apply() {
  const theme = resolveTheme();
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", PAGE_COLOUR[theme]);
  listeners.forEach((listener) => listener());
}

export function setChoice(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    /* storage blocked: the choice lasts until the app closes */
  }
  apply();
}

/** Call once when the app starts. */
export function initTheme() {
  apply();
  // While nobody has chosen, keep following the phone (for example when it switches to dark at sunset).
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (getChoice() === "system") apply();
  });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The colours being shown right now. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"), () => "light");
}

/** What the person picked (System, Light or Dark). */
export function useThemeChoice(): ThemeChoice {
  return useSyncExternalStore(subscribe, getChoice, () => "system");
}
