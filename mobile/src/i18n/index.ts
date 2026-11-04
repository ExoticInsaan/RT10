import en from "./en.json";
import hi from "./hi.json";

export type Lang = "en" | "hi";
export type Messages = typeof en;

export const LANGS: Lang[] = ["en", "hi"];
export const DEFAULT_LANG: Lang = "en";
export const LANG_STORAGE_KEY = "toppershelf-app-lang";

// English is the source of truth. hi.json is typed as the same shape, so a missing Hindi key is a type error.
const dictionaries: Record<Lang, Messages> = { en, hi };

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "hi";
}

// Every dotted key that exists in the English file, e.g. "nav.home". A wrong key is a type error.
type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type Paths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : Join<K, Paths<T[K]>>;
}[keyof T & string];
export type TranslationKey = Paths<Messages>;

function lookup(messages: unknown, key: string): string | undefined {
  let node: unknown = messages;
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && part in node) node = (node as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof node === "string" ? node : undefined;
}

// Falls back to English, then to the key itself, so a missing Hindi line never shows a blank.
export function translate(lang: Lang, key: TranslationKey, params?: Record<string, string | number>): string {
  const text = lookup(dictionaries[lang], key) ?? lookup(dictionaries.en, key) ?? key;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, name: string) => (name in params ? String(params[name]) : `{${name}}`));
}
