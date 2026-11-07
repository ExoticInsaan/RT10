import { toolStringsHi } from "./toolStrings.hi";
import { resolveLang } from "./index";

/** For text made outside a screen, like phone notifications: uses the same language the app is showing and returns the Hindi line if there is one. */
export function tStatic(en: string): string {
  return resolveLang() === "hi" ? toolStringsHi[en] ?? en : en;
}
