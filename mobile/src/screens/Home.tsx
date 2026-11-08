import { useMemo, useState } from "react";
import { tools } from "@/lib/tools/registry";
import { ArrowIcon, SearchIcon, UserIcon } from "../components/icons";
import { Chip, ShelfTile, Sticker, ToolRow } from "../components/tiles";
import { useLanguage } from "../i18n/LanguageProvider";
import { matchesTool, useToolText } from "../i18n/toolText";

const shelf = tools.filter((t) => t.category === "The Shelf");
const funPicks = ["how-cooked", "excuse-generator", "roast-my-timetable", "decision-wheel"].map((id) => tools.find((t) => t.id === id)!);
const tilts = [-2, 1.5, -1, 2];

export default function Home() {
  const [q, setQ] = useState("");
  const { t: tr } = useLanguage();
  const text = useToolText();
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? tools.filter((t) => matchesTool(t, text(t), s)) : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, tr]);

  return (
    <div className="hide-scrollbar absolute inset-0 overflow-y-auto overflow-x-hidden pb-[100px]">
      <div className="flex items-center justify-between px-5 pt-3.5">
        <div className="flex items-center gap-[9px]">
          <img src="./logo-mark.png" alt="" className="size-9" />
          <div className="text-[20px] font-extrabold tracking-[-0.02em]">
            Topper<span className="text-link2">Shelf</span>
          </div>
        </div>
        <a href="#/settings" aria-label={tr("home.settingsAria")} className="flex size-11 items-center justify-center rounded-full bg-blue-soft text-link">
          <UserIcon />
        </a>
      </div>

      <div className="dots-light mx-5 mt-3.5 box-border overflow-hidden rounded-[28px] bg-deep pt-[22px] pr-4 pb-4 pl-5">
        <div className="flex items-end justify-between gap-1.5">
          <h1 className="m-0 mb-3.5 font-display text-[26px] leading-[1.1] font-normal text-white">
            {tr("home.hero1")}<br />{tr("home.hero2")}<br />{tr("home.hero3")}
          </h1>
          <img src="./mascot/owl-peek.webp" alt="" aria-hidden="true" className="mr-1 block w-[112px] shrink-0" />
        </div>
        <div className="relative">
          <label htmlFor="q" className="sr-only">{tr("home.searchLabel")}</label>
          <SearchIcon className="absolute top-4 left-4 text-sub" />
          <input
            id="q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tr("home.search")}
            className="box-border h-[52px] w-full rounded-2xl border-0 bg-card pr-4 pl-[46px] text-base text-navy outline-none"
          />
        </div>
      </div>

      {q.trim() ? (
        <div className="flex flex-col gap-3 px-5 pt-4">
          {results.length ? results.map((t) => <ToolRow key={t.id} tool={t} />) : <p className="m-0 py-6 text-center text-[15px] text-sub">{tr("common.noMatch", { q: q.trim() })}</p>}
        </div>
      ) : (
        <>
          <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto px-5 pt-3.5">
            <span className="mr-0.5 text-sm text-sub">{tr("home.popular")}</span>
            <Chip href="#/tool/cgpa-calculator">{tr("home.chipCgpa")}</Chip>
            <Chip href="#/tool/image-compressor">{tr("home.chipImage")}</Chip>
            <Chip href="#/tool/attendance-calculator">{tr("home.chipAttendance")}</Chip>
          </div>

          <div className="flex items-end justify-between px-5 pt-[26px]">
            <h2 className="m-0 font-display text-[30px] leading-none font-normal">{tr("home.shelfTitle")}</h2>
            <a href="#/shelf" className="flex min-h-11 items-center text-sm font-extrabold text-link">{tr("home.seeAllN", { n: shelf.length })}</a>
          </div>
          <div className="hide-scrollbar flex gap-3.5 overflow-x-auto px-5 pt-1.5 pb-2">
            {shelf.slice(0, 5).map((t) => (
              <ShelfTile key={t.id} tool={t} />
            ))}
          </div>

          <div className="light-island bg-fun-gradient mx-5 mt-[22px] rounded-[28px] py-[22px]">
            <div className="px-5">
              <h2 className="m-0 font-display text-4xl leading-none font-normal">{tr("home.funTitle")}</h2>
              <p className="mt-2 mb-0 text-[15px] leading-[1.45] text-slate-700">{tr("home.funBlurb")}</p>
            </div>
            <div className="hide-scrollbar flex gap-3.5 overflow-x-auto px-5 pt-5 pb-2.5">
              {funPicks.map((t, i) => (
                <Sticker key={t.id} tool={t} tilt={tilts[i]} size="sm" className="w-[150px] shrink-0 shadow-[0_22px_44px_-18px_rgb(60_8_40/45%)]" />
              ))}
            </div>
            <div className="px-5 pt-2">
              <a href="#/fun" className="flex min-h-[52px] items-center justify-center gap-2 rounded-[26px] bg-deep text-base font-extrabold text-white">
                {tr("home.funOpen")} <ArrowIcon />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
