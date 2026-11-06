import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LocaleContext, TrContext, fillParams, type Tr } from "@/lib/tools/useTr";
import { toolStringsHi } from "./toolStrings.hi";
import { DEFAULT_LANG, LANG_STORAGE_KEY, resolveLang, translate, type Lang, type TranslationKey } from "./index";

type LanguageCtx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

const Ctx = createContext<LanguageCtx>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key, params) => translate(DEFAULT_LANG, key, params),
});

export const useLanguage = () => useContext(Ctx);

// The app is a static bundle (no server render), so the saved language can be read straight away with no flash of English.
export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(resolveLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      /* storage blocked: the switch still works until the app closes */
    }
  }, []);

  const value = useMemo<LanguageCtx>(() => ({ lang, setLang, t: (key, params) => translate(lang, key, params) }), [lang, setLang]);
  // Lets the shared tool screens (also used by the website) show Hindi inside the app.
  const tr = useMemo<Tr>(() => (en, params) => fillParams((lang === "hi" && toolStringsHi[en]) || en, params), [lang]);

  return (
    <Ctx.Provider value={value}>
      <TrContext.Provider value={tr}>
        <LocaleContext.Provider value={lang === "hi" ? "hi-IN" : "en-IN"}>{children}</LocaleContext.Provider>
      </TrContext.Provider>
    </Ctx.Provider>
  );
}
