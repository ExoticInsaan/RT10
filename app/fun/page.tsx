import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FunSticker from "@/components/tools/FunSticker";
import ShareCard from "@/components/tools/ShareCard";
import { runFunTool } from "@/lib/tools/fun";
import { tools, type Tool } from "@/lib/tools/registry";

export const metadata: Metadata = {
  title: "Fun Zone",
  description:
    "Free silly tools to play and share: How Cooked Are You?, Excuse Generator, Roast My Timetable, Instant Vibe Check, and more on the way.",
  alternates: { canonical: "/fun" },
};

// Small, alternating tilts so the stickers look hand-placed rather than gridded.
const playTilts = [-2.5, 1.5, -1, 2];
const soonTilts = [1.5, -2, 1, -1.5, 2, -1];

/** The three stickers piled up beside the heading on wide screens: [tool id, tilt, position]. */
const pile: [string, number, string][] = [
  ["decision-wheel", -10, "left-0 top-8"],
  ["vibe-check", 8, "right-0 top-0"],
  ["how-cooked", -3, "left-1/2 top-24 -translate-x-1/2"],
];

export default function FunZonePage() {
  const fun = tools.filter((tool) => tool.category === "Fun Zone");
  const ready = fun.filter((tool) => tool.ready);
  const soon = fun.filter((tool) => !tool.ready);
  const byId = (id: string) => fun.find((tool) => tool.id === id) as Tool;
  const sample = runFunTool("how-cooked", "Alex", 0)!;

  return (
    <div className="fun-field overflow-hidden pb-24">
      <section className="container-app grid gap-10 pb-12 pt-12 sm:pt-16 lg:grid-cols-[1fr_24rem] lg:items-center">
        <div>
          <h1 className="m-0 font-display text-6xl font-normal leading-none tracking-tight text-white sm:text-7xl lg:text-8xl">
            Fun Zone
          </h1>
          <p className="mb-0 mt-5 max-w-xl text-base leading-7 text-white/90 sm:text-lg">
            Small games and silly tests to play on your own or send to friends. Every result comes with a card sized for your
            story.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-navy">
              <span className="size-2 rounded-full bg-lime-500" aria-hidden="true" />
              {ready.length} ready to play
            </span>
            <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-white ring-1 ring-white/40">
              {soon.length} more on the way
            </span>
          </div>
        </div>
        <div className="relative hidden h-80 lg:block" aria-hidden="true">
          {pile.map(([id, tilt, position]) => {
            const tool = byId(id);
            return (
              <div
                key={id}
                className={`absolute size-44 rounded-[2rem] bg-white p-2.5 shadow-[0_24px_48px_-16px_rgb(60_8_40/0.55)] ${position}`}
                style={{ rotate: `${tilt}deg` }}
              >
                <div className="relative size-full overflow-hidden rounded-[1.5rem]" style={{ backgroundColor: tool.imageBg }}>
                  <Image src={tool.image!} alt="" fill sizes="11rem" className="scale-[1.04] object-cover" priority />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-app" aria-labelledby="play-now">
        <h2 id="play-now" className="mb-6 mt-0 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Ready to play
        </h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4">
          {ready.map((tool, index) => (
            <FunSticker key={tool.id} tool={tool} tilt={playTilts[index % playTilts.length]} big />
          ))}
        </div>
      </section>

      {soon.length > 0 && (
        <section className="container-app mt-16" aria-labelledby="coming-soon">
          <h2 id="coming-soon" className="mb-2 mt-0 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Coming soon
          </h2>
          <p className="mb-6 mt-0 text-sm text-white/85">Being built now. Each one opens here as soon as it works.</p>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {soon.map((tool, index) => (
              <FunSticker key={tool.id} tool={tool} tilt={soonTilts[index % soonTilts.length]} />
            ))}
          </div>
        </section>
      )}

      <section className="container-app mt-20">
        <div className="grid items-center gap-8 rounded-[2rem] bg-navy p-7 text-white sm:p-10 lg:grid-cols-[1fr_18rem]">
          <div>
            <h2 className="mb-3 mt-0 text-3xl font-extrabold sm:text-4xl">Results made for your story</h2>
            <p className="max-w-xl text-sm leading-6 text-slate-300">
              Every result gets a 9:16 card. Download it, copy the link, or send it straight to the group chat.
            </p>
            <Link
              href="/share/how-cooked?n=Alex&s=0"
              className="mt-3 inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Preview a share card
            </Link>
          </div>
          <ShareCard result={sample} icon="flame" miniature />
        </div>
      </section>
    </div>
  );
}
