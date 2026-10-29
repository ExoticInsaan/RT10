import { useMemo, useState } from "react";
import { tools } from "@/lib/tools/registry";
import { ArrowIcon, SearchIcon, UserIcon } from "../components/icons";
import { Chip, ShelfTile, Sticker, ToolRow } from "../components/tiles";

const shelf = tools.filter((t) => t.category === "The Shelf");
const funPicks = ["how-cooked", "excuse-generator", "roast-my-timetable", "decision-wheel"].map((id) => tools.find((t) => t.id === id)!);
const tilts = [-2, 1.5, -1, 2];

export default function Home() {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? tools.filter((t) => (t.name + " " + t.description).toLowerCase().includes(s)) : [];
  }, [q]);

  return (
    <div className="hide-scrollbar absolute inset-0 overflow-y-auto overflow-x-hidden pb-[100px]">
      <div className="flex items-center justify-between px-5 pt-3.5">
        <div className="flex items-center gap-[9px]">
          <img src="./logo-mark.png" alt="" className="size-9" />
          <div className="text-[20px] font-extrabold tracking-[-0.02em]">
            Topper<span className="text-[#2563eb]">Shelf</span>
          </div>
        </div>
        <a href="#/settings" aria-label="Settings and account" className="flex size-11 items-center justify-center rounded-full bg-[#e9f4fc] text-[#1d4ed8]">
          <UserIcon />
        </a>
      </div>

      <div className="dots-light mx-5 mt-3.5 box-border overflow-hidden rounded-[28px] bg-navy pt-[22px] pr-4 pb-4 pl-5">
        <div className="flex items-end justify-between gap-1.5">
          <h1 className="m-0 mb-3.5 font-display text-[26px] leading-[1.1] font-normal text-white">
            Useful tools.<br />A few silly ones.<br />All free.
          </h1>
          <img src="./mascot/owl-peek.webp" alt="" aria-hidden="true" className="mr-1 block w-[112px] shrink-0" />
        </div>
        <div className="relative">
          <label htmlFor="q" className="sr-only">Search tools</label>
          <SearchIcon className="absolute top-4 left-4 text-[#5b6675]" />
          <input
            id="q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools"
            className="box-border h-[52px] w-full rounded-2xl border-0 bg-white pr-4 pl-[46px] text-base text-navy outline-none"
          />
        </div>
      </div>

      {q.trim() ? (
        <div className="flex flex-col gap-3 px-5 pt-4">
          {results.length ? results.map((t) => <ToolRow key={t.id} tool={t} />) : <p className="m-0 py-6 text-center text-[15px] text-[#5b6675]">No tools match “{q.trim()}”.</p>}
        </div>
      ) : (
        <>
          <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto px-5 pt-3.5">
            <span className="mr-0.5 text-sm text-[#5b6675]">Popular</span>
            <Chip href="#/tool/cgpa-calculator">CGPA to %</Chip>
            <Chip href="#/tool/image-compressor">Compress an image</Chip>
            <Chip href="#/tool/attendance-calculator">Attendance</Chip>
          </div>

          <div className="flex items-end justify-between px-5 pt-[26px]">
            <h2 className="m-0 font-display text-[30px] leading-none font-normal">The Shelf</h2>
            <a href="#/shelf" className="flex min-h-11 items-center text-sm font-extrabold text-[#1d4ed8]">See all {shelf.length}</a>
          </div>
          <div className="hide-scrollbar flex gap-3.5 overflow-x-auto px-5 pt-1.5 pb-2">
            {shelf.slice(0, 5).map((t) => (
              <ShelfTile key={t.id} tool={t} />
            ))}
          </div>

          <div className="bg-fun-gradient mx-5 mt-[22px] rounded-[28px] py-[22px]">
            <div className="px-5">
              <h2 className="m-0 font-display text-4xl leading-none font-normal">Fun Zone</h2>
              <p className="mt-2 mb-0 text-[15px] leading-[1.45] text-slate-700">Silly tests and small games with a result card made for your story.</p>
            </div>
            <div className="hide-scrollbar flex gap-3.5 overflow-x-auto px-5 pt-5 pb-2.5">
              {funPicks.map((t, i) => (
                <Sticker key={t.id} tool={t} tilt={tilts[i]} size="sm" className="w-[150px] shrink-0 shadow-[0_22px_44px_-18px_rgb(60_8_40/45%)]" />
              ))}
            </div>
            <div className="px-5 pt-2">
              <a href="#/fun" className="flex min-h-[52px] items-center justify-center gap-2 rounded-[26px] bg-navy text-base font-extrabold text-white">
                Open the Fun Zone <ArrowIcon />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
