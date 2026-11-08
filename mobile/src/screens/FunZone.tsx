import { tools } from "@/lib/tools/registry";
import { funGameIds } from "@/components/fun/ids";
import { Sticker } from "../components/tiles";
import { useLanguage } from "../i18n/LanguageProvider";

const games = tools.filter((t) => funGameIds.includes(t.id));
const tilts = [-2.5, 1.5, -1, 2, -1.5, 2.5, -2, 1, -1, 1.5];

export default function FunZone() {
  const { t } = useLanguage();
  return (
    <div className="light-island bg-fun-field hide-scrollbar absolute inset-0 overflow-y-auto overflow-x-hidden pb-[104px]">
      <div className="px-5 pt-[22px] text-white">
        <h1 className="m-0 font-display text-[60px] leading-none font-normal tracking-[-0.01em]">{t("fun.title")}</h1>
        <p className="mt-3 mb-0 text-base leading-normal">{t("fun.blurb")}</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-extrabold text-navy">
          <span className="size-2 rounded-full bg-lime-500" aria-hidden="true" />
          {t("fun.count", { n: games.length })}
        </div>
      </div>
      <h2 className="mx-5 mt-7 mb-4 text-2xl font-extrabold tracking-[-0.01em] text-white">{t("fun.pick")}</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-[22px] px-5">
        {games.map((t, i) => (
          <Sticker key={t.id} tool={t} tilt={tilts[i % tilts.length]} play />
        ))}
      </div>
    </div>
  );
}
