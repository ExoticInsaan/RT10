import { toolStringsHi } from "./toolStrings.hi";
import { LANG_STORAGE_KEY } from "./index";

/** For text made outside a screen, like phone notifications: reads the saved language and returns the Hindi line if there is one. */
export function tStatic(en: string): string {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY) === "hi" ? toolStringsHi[en] ?? en : en;
  } catch {
    return en;
  }
}
