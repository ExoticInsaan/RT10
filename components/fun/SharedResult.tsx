"use client";

import { useRef, type ReactNode, type Ref } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CardCooked from "@/components/fun/cards/CardCooked";
import CardExcuse from "@/components/fun/cards/CardExcuse";
import CardRoast from "@/components/fun/cards/CardRoast";
import CardVibe from "@/components/fun/cards/CardVibe";
import CardActions from "@/components/fun/CardActions";
import { cookedResult } from "@/components/fun/games/HowCooked";
import { excuseParts } from "@/components/fun/games/ExcuseGenerator";
import { roastFor } from "@/components/fun/games/RoastTimetable";
import { dayKey, vibeFor } from "@/components/fun/games/VibeCheck";
import { resultLink, type ResultKind } from "@/lib/fun/results";

const btn =
  "min-h-12 w-full cursor-pointer rounded-[18px] border-0 bg-white px-4 py-3 text-base font-extrabold text-navy shadow-[0_5px_0_rgba(0,0,0,.25)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,.25)] disabled:cursor-default disabled:opacity-60";
const ghost =
  "min-h-12 w-full cursor-pointer rounded-[18px] border-2 border-white/60 bg-white/10 px-4 py-3 text-base font-extrabold text-white active:translate-y-0.5 disabled:cursor-default disabled:opacity-60";

const TOOL: Record<ResultKind, { id: string; cta: string }> = {
  cooked: { id: "how-cooked", cta: "Find out how cooked you are" },
  vibe: { id: "vibe-check", cta: "Check your own vibe" },
  excuse: { id: "excuse-generator", cta: "Make your own excuse" },
  roast: { id: "roast-my-timetable", cta: "Roast your own timetable" },
};

type Built = { node: (ref: Ref<HTMLDivElement>) => ReactNode; fileName: string; shareText: string; shareUrl: string };

/** Rebuilds the same result for whoever opens a shared link: the same input always gives the same card. */
function build(kind: ResultKind, q: URLSearchParams): Built | null {
  const clip = (key: string, max: number) => (q.get(key) ?? "").trim().slice(0, max);
  if (kind === "cooked") {
    const n = clip("n", 30);
    if (!n) return null;
    const r = cookedResult(n);
    return {
      node: (cardRef) => <CardCooked cardRef={cardRef} data={{ name: n, score: r.score, tier: r.tier, bg: r.bg, verdict: r.verdict }} />,
      fileName: "how-cooked-toppershelf.png",
      shareText: `${n} is ${r.score}% cooked. How cooked are you?`,
      shareUrl: resultLink("cooked", { n }),
    };
  }
  if (kind === "vibe") {
    const n = clip("n", 30);
    if (!n) return null;
    const d = /^\d{4}-\d{1,2}-\d{1,2}$/.test(q.get("d") ?? "") ? (q.get("d") as string) : dayKey(Date.now());
    const [y, m, dd] = d.split("-").map(Number);
    const r = vibeFor(n, d);
    return {
      node: (cardRef) => (
        <CardVibe
          cardRef={cardRef}
          date={new Date(y, m - 1, dd)}
          data={{ name: n, vibe: r.v.n, line: r.v.l, a: r.v.a, b: r.v.b, bg: r.v.bg, meters: r.meters.map((x) => ({ label: x.label, v: x.v })) }}
        />
      ),
      fileName: "vibe-check-toppershelf.png",
      shareText: `${n}'s vibe today: ${r.v.n}. What's yours?`,
      shareUrl: resultLink("vibe", { n, d }),
    };
  }
  if (kind === "excuse") {
    const s = clip("s", 60);
    const roll = Math.min(50, Math.max(0, parseInt(q.get("r") ?? "0", 10) || 0));
    if (!s) return null;
    const e = excuseParts(s, roll);
    return {
      node: (cardRef) => <CardExcuse cardRef={cardRef} data={{ situation: s, text: e.text, believe: e.believe }} />,
      fileName: "excuse-toppershelf.png",
      shareText: `My excuse for ${s}: ${e.believe}% believable. Make yours!`,
      shareUrl: resultLink("excuse", { s, r: roll }),
    };
  }
  const d = clip("d", 90);
  if (!d) return null;
  const r = roastFor(d);
  return {
    node: (cardRef) => <CardRoast cardRef={cardRef} data={{ day: d, lines: r.lines, level: r.level, score: r.score }} />,
    fileName: "roast-toppershelf.png",
    shareText: `My timetable got roasted: ${r.score}/10. Roast yours!`,
    shareUrl: resultLink("roast", { d }),
  };
}

export default function SharedResult({ kind }: { kind: ResultKind }) {
  const params = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const built = build(kind, params);
  const tool = TOOL[kind];
  return (
    <div className="mx-auto flex w-full max-w-[26rem] flex-col items-center gap-4">
      <h1 className="m-0 text-center font-display text-3xl text-white">{built ? "Someone shared a result" : "This link is incomplete"}</h1>
      {built ? (
        <>
          <div className="w-full overflow-hidden rounded-[22px] shadow-[0_24px_50px_-20px_rgba(0,0,0,.5)]">{built.node(cardRef)}</div>
          <CardActions getNode={() => cardRef.current} fileName={built.fileName} shareText={built.shareText} shareUrl={built.shareUrl} btnClass={btn} ghostClass={ghost} />
        </>
      ) : (
        <p className="m-0 text-center text-white/90">The link is missing its details. You can still try it yourself.</p>
      )}
      <Link href={`/tool/${tool.id}`} className="inline-flex min-h-12 w-full items-center justify-center rounded-[18px] bg-white px-4 py-3 text-center text-base font-extrabold text-navy no-underline shadow-[0_5px_0_rgba(0,0,0,.25)]">
        {tool.cta}
      </Link>
      <Link href="/fun" className="text-sm font-bold text-white/90 underline">More from the Fun Zone</Link>
    </div>
  );
}
