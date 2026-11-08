import { useLanguage } from "../i18n/LanguageProvider";
import type { TranslationKey } from "../i18n";
import { GridIcon, HeartIcon, HomeIcon, SparkIcon } from "./icons";

const tabs: { path: string; label: TranslationKey; Icon: typeof HomeIcon; active: string }[] = [
  { path: "/home", label: "tabs.home", Icon: HomeIcon, active: "bg-blue-soft text-link" },
  { path: "/shelf", label: "tabs.shelf", Icon: GridIcon, active: "bg-blue-soft text-link" },
  { path: "/fun", label: "tabs.fun", Icon: SparkIcon, active: "bg-[#f3e8ff] text-[#6b21a8]" },
  { path: "/my-shelf", label: "tabs.myShelf", Icon: HeartIcon, active: "bg-blue-soft text-link" },
];

export const TAB_PATHS = tabs.map((t) => t.path);

export default function BottomNav({ path }: { path: string }) {
  const { t } = useLanguage();
  return (
    <nav
      aria-label={t("tabs.navLabel")}
      className="absolute inset-x-0 bottom-0 box-border grid grid-cols-4 gap-1 border-t border-line bg-ivory px-2.5 pt-2 pb-[max(14px,env(safe-area-inset-bottom))]"
    >
      {tabs.map(({ path: to, label, Icon, active }) => {
        const on = path === to;
        return (
          <a
            key={to}
            href={"#" + to}
            aria-current={on ? "page" : undefined}
            className={`flex h-14 flex-col items-center justify-center gap-[3px] rounded-2xl text-[11px] font-bold ${on ? active : "text-sub"}`}
          >
            <Icon />
            {t(label)}
          </a>
        );
      })}
    </nav>
  );
}
