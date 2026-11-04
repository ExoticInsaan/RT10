import { tools } from "@/lib/tools/registry";
import { FAVOURITES_KEY, RECENT_KEY } from "@/components/tools/ui";
import { useStoredList } from "@/lib/tools/useStoredList";
import { ShelfTile, Sticker } from "../components/tiles";
import { useLanguage } from "../i18n/LanguageProvider";

const shelf = tools.filter((t) => t.category === "The Shelf");
const byId = (id: string) => tools.find((t) => t.id === id)!;
const funPicks = ["how-cooked", "excuse-generator"].map(byId);

export default function MyShelf() {
  const { t: tr } = useLanguage();
  const [favs] = useStoredList(FAVOURITES_KEY);
  const [recent] = useStoredList(RECENT_KEY);
  const favTools = favs.map((id) => tools.find((t) => t.id === id)).filter(Boolean) as typeof tools;
  const recentTools = recent.filter((id) => !favs.includes(id)).map((id) => tools.find((t) => t.id === id)).filter(Boolean) as typeof tools;
  const empty = !favTools.length && !recentTools.length;

  return (
    <div className="hide-scrollbar absolute inset-0 overflow-y-auto overflow-x-hidden pb-[100px]">
      <div className="px-5 pt-5">
        <h1 className="m-0 font-display text-[40px] leading-none font-normal">{tr("myShelf.title")}</h1>
        <p className="mt-2 mb-0 text-[15px] leading-[1.45] text-[#5b6675]">{tr("myShelf.subtitle")}</p>
      </div>

      {empty ? (
        <div className="mx-5 mt-5 box-border rounded-3xl border border-line bg-white p-5">
          <h2 className="m-0 text-[19px] font-extrabold tracking-[-0.01em]">{tr("myShelf.emptyTitle")}</h2>
          <p className="mt-2 mb-0 text-sm leading-[1.55] text-[#5b6675]">
            {tr("myShelf.emptyBody")}
          </p>
        </div>
      ) : (
        <>
          {favTools.length > 0 && <Row title={tr("myShelf.favourites")} items={favTools} />}
          {recentTools.length > 0 && <Row title={tr("myShelf.recent")} items={recentTools} />}
        </>
      )}

      {empty && (
        <>
          <div className="flex items-center justify-between px-5 pt-6">
            <h2 className="m-0 text-[22px] font-extrabold tracking-[-0.01em]">{tr("myShelf.popularShelf")}</h2>
            <a href="#/shelf" className="flex min-h-11 items-center text-sm font-extrabold text-[#1d4ed8]">{tr("common.seeAll")}</a>
          </div>
          <div className="hide-scrollbar flex gap-3.5 overflow-x-auto px-5 pt-1 pb-2">
            {shelf.slice(0, 3).map((t) => (
              <ShelfTile key={t.id} tool={t} />
            ))}
          </div>
        </>
      )}

      <div className="bg-fun-field mx-5 mt-[22px] rounded-[28px] py-[22px] text-white">
        <div className="px-5">
          <h2 className="m-0 text-[22px] font-extrabold tracking-[-0.01em]">{tr("myShelf.popularFun")}</h2>
          <p className="mt-1.5 mb-0 text-sm leading-normal">{tr("myShelf.popularFunBlurb")}</p>
        </div>
        <div className="grid grid-cols-2 gap-3.5 px-5 pt-[18px] pb-1.5">
          {funPicks.map((t, i) => (
            <Sticker key={t.id} tool={t} tilt={i ? 1.5 : -2} size="sm" />
          ))}
        </div>
        <div className="px-5 pt-1.5">
          <a href="#/fun" className="inline-flex min-h-11 items-center text-sm font-extrabold text-white underline">{tr("myShelf.seeAllTen")}</a>
        </div>
      </div>
    </div>
  );
}

function Row({ title, items }: { title: string; items: typeof tools }) {
  return (
    <>
      <h2 className="m-0 px-5 pt-6 text-[22px] font-extrabold tracking-[-0.01em]">{title}</h2>
      <div className="hide-scrollbar flex gap-3.5 overflow-x-auto px-5 pt-2 pb-2">
        {items.map((t) =>
          t.category === "Fun Zone" ? <Sticker key={t.id} tool={t} tilt={0} size="sm" className="w-[150px] shrink-0" /> : <ShelfTile key={t.id} tool={t} />,
        )}
      </div>
    </>
  );
}
