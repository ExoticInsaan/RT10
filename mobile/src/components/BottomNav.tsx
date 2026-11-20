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
      className="absolute inset-x-0 bottom-0 box-border grid grid-cols-4 gap-1 border-t border-line bg-ivory px-2.5 pt-2 pb-[max(14px,env(safe-area-inset-bottom))] tab:hidden"
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

/**
 * Tablets, foldables and phones turned sideways (600px and wider): the tabs move to a slim rail on the left, so the
 * content gets the full height and the width. Phones keep the bottom bar above.
 */
export function NavRail({ path }: { path: string }) {
  const { t } = useLanguage();
  return (
    <nav
      aria-label={t("tabs.navLabel")}
      className="hide-scrollbar z-20 hidden h-full w-[92px] shrink-0 flex-col items-center gap-2 overflow-y-auto border-r border-line bg-ivory pt-[max(16px,env(safe-area-inset-top))] pb-[max(16px,env(safe-area-inset-bottom))] pl-[env(safe-area-inset-left)] tab:flex"
    >
      <img src="./logo-mark.png" alt="" aria-hidden="true" className="mb-3 size-10 shrink-0" />
      {tabs.map(({ path: to, label, Icon, active }) => {
        const on = path === to;
        return (
          <a
            key={to}
            href={"#" + to}
            aria-current={on ? "page" : undefined}
            className={`flex min-h-[68px] w-[76px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold ${on ? active : "text-sub"}`}
          >
            <Icon />
            {t(label)}
          </a>
        );
      })}
    </nav>
  );
}
