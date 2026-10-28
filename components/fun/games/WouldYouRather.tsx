"use client";

import { useState } from "react";
import Image from "next/image";
import { GameShell } from "@/components/fun/kit";

const QS: [string, string, number][] = [
  ["Unlimited chai forever", "Unlimited Maggi forever", 58],
  ["Know exam questions a day early", "Never need sleep before exams", 71],
  ["Pause time whenever you want", "Rewind 10 seconds anytime", 64],
  ["Always be 10 minutes late", "Always be 2 hours early", 55],
  ["Sing everything you say", "Dance everywhere you walk", 42],
  ["Crush reads all your chats", "Parents read your search history", 37],
  ["Only 2G internet for a year", "No phone for a month", 46],
  ["Give every presentation in rhyme", "Write every exam in emoji", 61],
  ["Live without music", "Live without memes", 33],
  ["Fight one horse-sized duck", "Fight 100 duck-sized horses", 52],
];

const DEAL = { A0: "animate-fz-deal-a", B0: "animate-fz-deal-b", A1: "animate-fz-deal-a2", B1: "animate-fz-deal-b2" } as const;

const face = "absolute inset-0 box-border flex flex-col justify-center rounded-3xl px-[22px] py-5 text-left [backface-visibility:hidden]";
const btn =
  "min-h-14 w-full cursor-pointer rounded-[18px] border-0 bg-[#102a4c] px-[18px] py-3.5 text-lg font-black text-white shadow-[0_6px_0_#050f1f,0_14px_24px_rgba(16,42,76,.3)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_2px_0_#050f1f]";

export default function WouldYouRather() {
  const [q, setQ] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [agree, setAgree] = useState(0);
  const [round, setRound] = useState(0);

  const total = QS.length;
  const done = q >= total;
  const cur = QS[Math.min(q, total - 1)];
  const answered = pick !== null;
  const pa = cur[2];
  const pb = 100 - cur[2];
  const sides = [
    { letter: "A" as const, text: cur[0], pct: pa, bg: "#7c3aed", edge: "#5b21b6" },
    { letter: "B" as const, text: cur[1], pct: pb, bg: "#e11d48", edge: "#9f1239" },
  ];
  const mine = pick === null ? 0 : pick === 0 ? pa : pb;
  const verdict = !answered ? "Tap the one you would pick." : mine >= 50 ? "You are with the majority. Safe choice." : `Bold. Only ${mine}% agree with you.`;
  const types =
    agree >= 8
      ? ["Crowd Whisperer", "You think exactly like everyone else, which makes you weirdly good at predicting things."]
      : agree >= 5
        ? ["Balanced Brain", "Half sensible, half chaos. The perfect group project partner."]
        : ["Certified Rebel", "You see a popular opinion and run the other way. Iconic."];

  function choose(i: number) {
    if (pick !== null) return;
    const major = (i === 0 ? pa : pb) >= 50;
    setPick(i);
    if (major) setAgree(agree + 1);
  }

  if (done) {
    return (
      <GameShell
        gradient="linear-gradient(150deg,#7c3aed 0%,#c026d3 50%,#f43f5e 100%)"
        icon="/fun-zone/would-you-rather.webp"
        iconBg="#e8d8fd"
        title="Would You Rather"
        subtitle="Two impossible choices, one answer."
        status="SOLO"
        panelClass="bg-[#f6edff] px-5 text-[#2e1065] sm:px-6"
        rootClass="bg-[#f6edff]"
        body={
          <div className="mx-auto flex w-full max-w-md flex-col gap-3.5 lg:col-span-2">
            <div className="flex animate-fz-pop flex-col items-center gap-2.5 rounded-[28px] bg-white px-[22px] py-[26px] text-center shadow-[0_8px_0_#e3cffd]">
              <Image src="/mascot/owl-peek.webp" alt="" width={150} height={118} className="h-auto w-[150px]" />
              <div className="text-xs font-black tracking-[.14em] text-[#a21caf]">YOU ARE A</div>
              <div className="font-display text-[38px] leading-none text-[#2e1065]">{types[0]}</div>
              <div className="text-[15px] leading-[1.45] text-[#5b3a86]">{types[1]}</div>
              <div className="mt-1.5 flex gap-2.5">
                <div className="rounded-2xl bg-[#f6edff] px-3.5 py-2.5">
                  <div className="font-display text-[30px]">{agree}</div>
                  <div className="text-xs font-bold text-[#6b21a8]">with the crowd</div>
                </div>
                <div className="rounded-2xl bg-[#f6edff] px-3.5 py-2.5">
                  <div className="font-display text-[30px]">{total - agree}</div>
                  <div className="text-xs font-bold text-[#6b21a8]">against it</div>
                </div>
              </div>
            </div>
            <button type="button" className={btn} onClick={() => { setQ(0); setPick(null); setAgree(0); setRound(round + 1); }}>Play again</button>
          </div>
        }
      />
    );
  }

  const progress = (
    <div className="flex items-center gap-2.5 lg:col-start-2 lg:row-start-1 lg:self-end">
      <span className="whitespace-nowrap text-[13px] font-extrabold text-[#6b21a8]">{Math.min(q + 1, total)} of {total}</span>
      <div className="flex flex-1 gap-1">
        {QS.map((_, i) => (
          <div key={i} className="h-2 flex-1 rounded-full transition-[background] duration-300" style={{ background: i < q ? "#a21caf" : i === q ? "#f0abfc" : "#e9d8fd" }} />
        ))}
      </div>
    </div>
  );

  const cards = (
    <div className="relative mx-auto flex w-full max-w-[26rem] flex-col gap-[18px] [perspective:1000px] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center">
      {sides.map((s, i) => {
        const chosen = pick === i;
        const dim = answered && !chosen;
        return (
          <div key={s.letter} className={`h-[196px] [transform-style:preserve-3d] ${DEAL[`${s.letter}${(round % 2) as 0 | 1}`]}`}>
            <div
              className="h-[196px] [transform-style:preserve-3d]"
              style={{
                transform: `translateZ(${answered ? (chosen ? 40 : -60) : 0}px) scale(${dim ? 0.94 : 1})`,
                transition: "transform .45s cubic-bezier(.3,1.4,.5,1), opacity .4s",
                opacity: dim ? 0.75 : 1,
              }}
            >
              <button
                type="button"
                onClick={() => choose(i)}
                disabled={answered}
                aria-label={s.text}
                className="block size-full cursor-pointer border-0 bg-transparent p-0 transition-transform duration-700 ease-[cubic-bezier(.3,1.3,.5,1)] [transform-style:preserve-3d] disabled:cursor-default"
                style={{ transform: `rotateX(${answered ? 180 : 0}deg)` }}
              >
                <span className={`${face} text-white`} style={{ background: s.bg, boxShadow: `0 8px 0 ${s.edge},0 20px 30px -10px rgba(46,16,101,.45)` }}>
                  <span className="text-xs font-black tracking-[.14em] opacity-85">OPTION {s.letter}</span>
                  <span className="mt-2 font-display text-[27px] leading-[1.12]">{s.text}</span>
                </span>
                <span
                  className={`${face} border-[3px] bg-white text-[#2e1065] [transform:rotateX(180deg)]`}
                  style={{ boxShadow: `0 8px 0 ${s.edge},0 20px 30px -10px rgba(46,16,101,.35)`, borderColor: chosen ? s.bg : "transparent" }}
                >
                  <span className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-[.14em]" style={{ color: s.bg }}>OPTION {s.letter}</span>
                    {chosen && <span className="rounded-full px-[9px] py-1 text-[11px] font-black text-white" style={{ background: s.bg }}>YOUR PICK</span>}
                  </span>
                  <span className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-bold leading-[1.3]">{s.text}</span>
                  <span className="mt-1.5 font-display text-[56px] leading-none" style={{ color: s.bg }}>{s.pct}%</span>
                  <span className="mt-2 block h-2.5 overflow-hidden rounded-full bg-[#f1e7ff]">
                    <span className="block h-full animate-fz-bar rounded-full" style={{ width: `${s.pct}%`, background: s.bg }} />
                  </span>
                </span>
              </button>
            </div>
          </div>
        );
      })}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[5] -ml-8 -mt-8 size-16 [perspective:300px]">
        <div className="relative size-16 animate-fz-coin [transform-style:preserve-3d]">
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#facc15] text-xl font-black text-[#713f12] shadow-[inset_0_-5px_0_#ca8a04,0_6px_14px_rgba(46,16,101,.35)] [backface-visibility:hidden]">OR</div>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#facc15] text-xl font-black text-[#713f12] shadow-[inset_0_-5px_0_#ca8a04] [backface-visibility:hidden] [transform:rotateY(180deg)]">OR</div>
        </div>
      </div>
    </div>
  );

  return (
    <GameShell
      gradient="linear-gradient(150deg,#7c3aed 0%,#c026d3 50%,#f43f5e 100%)"
      icon="/fun-zone/would-you-rather.webp"
      iconBg="#e8d8fd"
      title="Would You Rather"
      subtitle="Two impossible choices, one answer."
      status="SOLO"
      panelClass="bg-[#f6edff] px-5 text-[#2e1065] sm:px-6 lg:gap-x-10"
      rootClass="bg-[#f6edff]"
      body={
        <>
          {progress}
          {cards}
          <div className="flex flex-col gap-3.5 lg:col-start-2 lg:row-start-2 lg:self-start">
            <div className="min-h-6 text-center text-[15px] font-bold text-[#6b21a8]">{verdict}</div>
            <div className="min-h-14">
            {answered && (
              <button type="button" className={`${btn} animate-fz-pop`} onClick={() => { setQ(q + 1); setPick(null); setRound(round + 1); }}>
                {q === total - 1 ? "See my result" : "Next question"}
              </button>
            )}
            </div>
          </div>
        </>
      }
    />
  );
}
