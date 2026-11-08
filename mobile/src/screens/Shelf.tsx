import { useMemo, useState } from "react";
import { tools } from "@/lib/tools/registry";
import { SearchIcon } from "../components/icons";
import { ToolRow } from "../components/tiles";
import { useLanguage } from "../i18n/LanguageProvider";
import { matchesTool, useToolText } from "../i18n/toolText";

const shelf = tools.filter((t) => t.category === "The Shelf");

export default function Shelf() {
  const [q, setQ] = useState("");
  const { t: tr } = useLanguage();
  const text = useToolText();
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? shelf.filter((t) => matchesTool(t, text(t), s)) : shelf;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, tr]);

  return (
    <div className="hide-scrollbar absolute inset-0 overflow-y-auto overflow-x-hidden pb-[100px]">
      <div className="px-5 pt-5">
        <h1 className="m-0 font-display text-[40px] leading-none font-normal">{tr("shelf.title")}</h1>
        <p className="mt-2 mb-0 text-[15px] leading-[1.45] text-sub">{tr("shelf.subtitle")}</p>
      </div>
      <div className="relative mx-5 mt-4">
        <label htmlFor="q" className="sr-only">{tr("shelf.searchLabel")}</label>
        <SearchIcon className="absolute top-4 left-4 text-sub" />
        <input
          id="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tr("shelf.placeholder")}
          className="box-border h-[52px] w-full rounded-2xl border-[1.5px] border-line bg-card pr-4 pl-[46px] text-base text-navy outline-none"
        />
      </div>
      <div className="flex flex-col gap-3 px-5 pt-[18px]">
        {list.map((t) => (
          <ToolRow key={t.id} tool={t} />
        ))}
        {!list.length && <p className="m-0 py-6 text-center text-[15px] text-sub">{tr("common.noMatch", { q: q.trim() })}</p>}
      </div>
    </div>
  );
}
