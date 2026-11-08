import { useLanguage } from "../i18n/LanguageProvider";
import { LANGS } from "../i18n";

const names = { en: "language.english", hi: "language.hindi" } as const;

// Two-option pill, sized for thumbs (44px tall) and styled like the rest of the app.
export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useLanguage();
  return (
    <div role="group" aria-label={t("language.label")} className="inline-flex shrink-0 rounded-full border border-line bg-ivory p-1">
      {LANGS.map((code) => {
        const on = code === lang;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={on}
            onClick={() => setLang(code)}
            className={`min-h-10 ${compact ? "min-w-[60px]" : "min-w-[72px]"} cursor-pointer rounded-full border-0 px-3 text-sm font-bold transition-colors ${on ? "bg-deep text-white" : "bg-transparent text-navy"}`}
          >
            {t(names[code])}
          </button>
        );
      })}
    </div>
  );
}
