"use client";

import { useEffect, useRef, useState } from "react";
import CardVibe from "@/components/fun/cards/CardVibe";
import CardActions from "@/components/fun/CardActions";
import { GameShell, OwlPeek, hash, useTimers } from "@/components/fun/kit";
import { resultLink } from "@/lib/fun/results";

type Phase = "input" | "loading" | "result";

const VIBES = [
  { n: "Main Character", a: "#f9a8d4", b: "#db2777", bg: "#be185d", l: "The universe cast you as the lead today. Walk slower, look out of windows." },
  { n: "Chaotic Good", a: "#fdba74", b: "#ea580c", bg: "#c2410c", l: "You will cause problems, but helpful ones. Chaos with a good heart." },
  { n: "Sleepy Genius", a: "#c4b5fd", b: "#7c3aed", bg: "#6d28d9", l: "Brain at 200%, eyelids at 12%. Your best idea arrives at 2am." },
  { n: "Unbothered Royalty", a: "#fde68a", b: "#d97706", bg: "#b45309", l: "Nothing can shake you today. Not even a surprise test." },
  { n: "Golden Retriever", a: "#fef08a", b: "#eab308", bg: "#a16207", l: "Pure sunshine. You will hype up at least three people today." },
  { n: "Lo-fi Focus", a: "#99f6e4", b: "#0d9488", bg: "#0f766e", l: "Headphones on, world off. Today you actually finish the thing." },
  { n: "Chai Philosopher", a: "#fed7aa", b: "#b45309", bg: "#92400e", l: "Deep thoughts, one cup at a time. Avoid debates before noon." },
  { n: "Plot Twist Pending", a: "#a5f3fc", b: "#0284c7", bg: "#0369a1", l: "Something unexpected is loading. Keep your phone charged." },
  { n: "Soft Launch", a: "#fbcfe8", b: "#c026d3", bg: "#a21caf", l: "Quietly levelling up. Nobody knows yet, and that is the point." },
  { n: "Villain Arc (Productive)", a: "#fca5a5", b: "#dc2626", bg: "#b91c1c", l: "Revenge served as a perfect assignment. Petty, but efficient." },
];
const STARS = Array.from({ length: 16 }, (_, i) => ({
  x: (((i * 73) % 330) + 8) / 350 * 100,
  y: (i * 47) % 280 + 8,
  d: ((i * 0.23) % 2).toFixed(2),
  r: 2 + (i % 3) * 2,
}));
const RINGS = [
  { tx: 72, ty: 0, size: 230, c: "#a5b4fc", dur: 9 },
  { tx: 68, ty: 58, size: 200, c: "#f0abfc", dur: 7 },
  { tx: 64, ty: -54, size: 180, c: "#fde68a", dur: 11 },
];

export const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

/** Same name on the same day gives the same vibe; it changes at midnight. */
export function vibeFor(name: string, day: string) {
  const h = hash("vibe:" + name.trim().toLowerCase() + ":" + day);
  return {
    v: VIBES[h % VIBES.length],
    meters: [
      { label: "ENERGY", v: 20 + ((h >>> 4) % 81) },
      { label: "AURA", v: 30 + ((h >>> 9) % 71) },
      { label: "CHAOS", v: (h >>> 14) % 101 },
    ],
  };
}

const btn =
  "min-h-14 w-full cursor-pointer rounded-[18px] border-0 bg-[#4f46e5] px-[18px] py-3.5 text-[17px] font-extrabold text-white shadow-[0_6px_0_#3730a3,0_14px_24px_rgba(55,48,163,.3)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_2px_0_#3730a3] disabled:cursor-default disabled:opacity-50";
const ghost =
  "min-h-[50px] cursor-pointer rounded-2xl border-2 border-[#d4d7fb] bg-white px-3.5 py-3 text-[15px] font-extrabold text-[#312e81] shadow-[0_5px_0_#d4d7fb] active:translate-y-[3px] active:shadow-[0_2px_0_#d4d7fb]";

export default function VibeCheck() {
  const [phase, setPhase] = useState<Phase>("input");
  const [name, setName] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(0);
  const later = useTimers();
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const r = phase === "result" ? vibeFor(name, dayKey(now)) : null;
  const orb = r ? { a: r.v.a, b: r.v.b } : phase === "loading" ? { a: "#f0abfc", b: "#c026d3" } : { a: "#a5b4fc", b: "#6366f1" };
  const speed = phase === "loading" ? 0.35 : 1;
  const d = new Date(now);
  const mid = new Date(d);
  mid.setHours(24, 0, 0, 0);
  const mins = Math.max(0, Math.round((mid.getTime() - d.getTime()) / 60000));

  function check() {
    if (!name.trim() || phase !== "input") return;
    setNow(Date.now());
    setPhase("loading");
    later(() => setPhase("result"), 2200);
  }
  const stage =
    phase !== "result" ? (
      <div className="relative mx-auto h-[300px] w-full max-w-[26rem] shrink-0 overflow-hidden rounded-[26px] bg-[#1e1b4b] [perspective:700px]">
        {STARS.map((s, i) => (
          <div key={i} className="absolute animate-fz-twinkle rounded-full bg-white" style={{ left: `${s.x}%`, top: s.y, width: s.r, height: s.r, animationDelay: `${s.d}s` }} />
        ))}
        <div
          className="absolute left-1/2 top-1/2 -ml-[130px] -mt-[130px] size-[260px] rounded-full opacity-45 blur-[40px] transition-[background] duration-[800ms]"
          style={{ background: orb.b }}
        />
        {RINGS.map((rg, i) => (
          <div key={i} className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]" style={{ transform: `rotateX(${rg.tx}deg) rotateY(${rg.ty}deg)` }}>
            <div
              className="absolute animate-fz-spinz rounded-full [transform-style:preserve-3d]"
              style={{ width: rg.size, height: rg.size, margin: `${-rg.size / 2}px 0 0 ${-rg.size / 2}px`, border: `2px solid ${rg.c}`, animationDuration: `${(rg.dur * speed).toFixed(2)}s` }}
            >
              <div className="absolute -top-2 left-1/2 -ml-2 size-4 rounded-full" style={{ background: rg.c, boxShadow: `0 0 12px ${rg.c}` }} />
            </div>
          </div>
        ))}
        <div
          className="absolute left-1/2 top-1/2 -ml-[65px] -mt-[65px] size-[130px] animate-fz-pulse rounded-full transition-[background] duration-[800ms]"
          style={{
            background: `radial-gradient(circle at 34% 30%,#ffffff 0%,${orb.a} 22%,${orb.b} 70%,#1e1b4b 120%)`,
            boxShadow: `0 0 50px ${orb.a},inset -14px -18px 30px rgba(30,27,75,.45)`,
          }}
        />
        <div className="absolute inset-x-0 bottom-4 text-center font-display text-[22px] text-white">
          {phase === "loading" ? "Reading your aura…" : "Your aura is waiting"}
        </div>
      </div>
    ) : (
      <div className="animate-fz-card w-full">
        <CardVibe
          cardRef={cardRef}
          date={d}
          data={{ name: name.trim(), vibe: r!.v.n, line: r!.v.l, a: r!.v.a, b: r!.v.b, bg: r!.v.bg, meters: r!.meters.map((m) => ({ label: m.label, v: m.v })) }}
        />
      </div>
    );

  const controls =
    phase === "input" ? (
      <>
        <div className="flex flex-col gap-2">
          <label htmlFor="vibe-name" className="text-sm font-bold text-[#4b4a7a]">Your name</label>
          <input
            id="vibe-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="Type your name"
            maxLength={30}
            autoComplete="off"
            className="box-border w-full rounded-2xl border-2 border-[#d4d7fb] bg-white px-4 py-[15px] text-base font-medium text-[#1e1b4b] outline-none placeholder:text-[#9a9ccc] focus:border-[#6366f1] focus:shadow-[0_0_0_4px_rgba(99,102,241,.18)] sm:text-[17px]"
          />
        </div>
        <button type="button" className={btn} onClick={check} disabled={!name.trim()}>Check the vibe</button>
        <p className="m-0 text-center text-[13px] font-semibold text-[#4b4a7a]">Your vibe changes every day at midnight.</p>
        <div className="-mb-6 flex h-[92px] justify-end overflow-hidden pr-0 lg:hidden">
          <OwlPeek className="w-[118px]" />
        </div>
      </>
    ) : phase === "result" ? (
      <div className="flex flex-col items-center gap-3.5">
        <div className="text-[13px] font-bold text-[#4b4a7a]">New vibe in {Math.floor(mins / 60)}h {mins % 60}m</div>
        <CardActions
          getNode={() => cardRef.current}
          fileName="vibe-check-toppershelf.png"
          shareText={`${name.trim()}'s vibe today: ${r!.v.n}. What's yours?`}
          shareUrl={resultLink("vibe", { n: name.trim(), d: dayKey(now) })}
          btnClass={`${btn} !min-h-[50px] !text-[15px]`}
          ghostClass={ghost}
        />
        <button type="button" className={`${ghost} w-full`} onClick={() => { setPhase("input"); setName(""); }}>Check someone</button>
      </div>
    ) : null;

  return (
    <GameShell
      gradient="linear-gradient(150deg,#4f46e5 0%,#9333ea 50%,#db2777 100%)"
      icon="/fun-zone/vibe-check.webp"
      iconBg="#bac0fd"
      title="Instant Vibe Check"
      subtitle="A daily reading of your energy."
      status="LIVE"
      panelClass="bg-[#eef0ff] px-5 text-[#1e1b4b] sm:px-6"
      rootClass="bg-[#eef0ff]"
      stage={stage}
      controls={controls}
    />
  );
}
