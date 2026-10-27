import type { Metadata } from "next";
import Link from "next/link";
import ShareCard from "@/components/tools/ShareCard";
import ToolIcon from "@/components/tools/ToolIcon";
import { FavoriteButton, IconTile } from "@/components/tools/ui";
import { runFunTool } from "@/lib/tools/fun";
import { tools } from "@/lib/tools/registry";

export const metadata: Metadata = {
  title: "Fun Zone",
  description: "Witty little tools for dramatic reveals, friendly roasts and group chat content. Free on TopperShelf.",
  alternates: { canonical: "/fun" },
};

const cardTones = ["bg-orange-100", "bg-sky-100", "bg-purple-100", "bg-lime-100"];

export default function FunZonePage() {
  const fun = tools.filter((tool) => tool.category === "Fun Zone");
  const sample = runFunTool("how-cooked", "Alex", 0)!;
  return (
    <>
      <section className="overflow-hidden bg-fun-gradient py-14 sm:py-20">
        <div className="container-app relative text-center">
          <span className="eyebrow border-purple-200 bg-white/60 text-purple-700">
            <ToolIcon name="sparkles" size={14} /> Zero productivity guaranteed
          </span>
          <h1 className="mx-auto mb-4 mt-5 max-w-3xl text-5xl font-extrabold tracking-hero text-navy sm:text-6xl">
            Welcome to the <span className="text-purple-600">Fun Zone.</span>
          </h1>
          <p className="mx-auto max-w-xl text-base leading-7 text-slate-700">
            Witty little tools for dramatic reveals, friendly roasts and the group chat content you didn&apos;t know you needed.
          </p>
          <span className="absolute -left-4 top-0 hidden rotate-12 text-coral lg:block">
            <ToolIcon name="flame" size={52} />
          </span>
          <span className="absolute -right-3 bottom-0 hidden -rotate-12 text-purple-600 lg:block">
            <ToolIcon name="sparkles" size={56} />
          </span>
        </div>
      </section>

      <section className="container-app section-space">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {fun.map((tool, index) => (
            <article
              key={tool.id}
              className={`relative overflow-hidden rounded-3xl p-6 transition hover:-translate-y-1 ${cardTones[index % cardTones.length]}`}
            >
              <span className="absolute -right-8 -top-8 size-28 rounded-full border border-white/70" />
              <IconTile tool={tool} large />
              <h2 className="mb-2 mt-14 text-xl font-extrabold text-navy">{tool.name}</h2>
              <p className="min-h-12 text-sm leading-6 text-slate-600">{tool.description}</p>
              <Link href={`/tool/${tool.id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-navy">
                Try it now <ToolIcon name="arrow" size={16} />
              </Link>
              <FavoriteButton id={tool.id} />
            </article>
          ))}
        </div>
      </section>

      <section className="container-app pb-20">
        <div className="grid items-center gap-8 rounded-3xl bg-navy p-7 text-white sm:p-10 lg:grid-cols-[1fr_18rem]">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue">Share the damage</span>
            <h2 className="mb-3 mt-3 text-3xl font-extrabold sm:text-4xl">Results built for your story.</h2>
            <p className="max-w-xl text-sm leading-6 text-slate-300">
              Every witty result gets a polished 9:16 card. Download it, copy the link, or send it straight to the group chat.
            </p>
            <Link
              href="/share/how-cooked?n=Alex&s=0"
              className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Preview a share card <ToolIcon name="arrow" size={16} />
            </Link>
          </div>
          <ShareCard result={sample} icon="flame" miniature />
        </div>
      </section>
    </>
  );
}
