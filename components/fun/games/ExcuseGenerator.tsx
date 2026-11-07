"use client";

import { useRef, useState } from "react";
import CardExcuse from "@/components/fun/cards/CardExcuse";
import CardActions from "@/components/fun/CardActions";
import { GameShell, hash, useTimers } from "@/components/fun/kit";
import { resultLink } from "@/lib/fun/results";
import { useHindi, useTr } from "@/lib/tools/useTr";
import { appContent } from "@/lib/tools/appContent";

const LISTS = [
  ["My neighbour’s goat", "A random auto driver", "Nani’s WhatsApp group", "The wifi router", "A very confident pigeon", "My little cousin", "Mercury in retrograde", "The building lift", "My phone’s autocorrect", "A sus monsoon cloud"],
  ["ate my charger", "kidnapped my alarm", "sent a 40 min voice note", "locked the bathroom door", "started a staring contest", "hid my left shoe", "updated itself overnight", "declared a holiday", "sat on my notebook", "got stuck between floors"],
  ["so I had to negotiate", "and I'm still not okay", "so time just stopped", "and they almost called the police", "so I took the long way via Bhopal", "and ngl, respect", "so I followed the rules", "my horoscope literally warned me", "so I waited for justice", "and nobody believes me fr"],
];
const LABELS = ["WHO", "DID WHAT", "AND THEN"];

/** The three chosen pieces as one sentence (the story card text). */
const joinParts = (idx: number[], hi: boolean) => {
  const pack = hi ? appContent().excuse : undefined;
  return pack ? pack.join(idx) : `${LISTS[0][idx[0]]} ${LISTS[1][idx[1]]}, ${LISTS[2][idx[2]]}.`;
};
const sorry = (situation: string, hi: boolean) => {
  const pack = hi ? appContent().excuse : undefined;
  if (pack) return pack.sorry(situation);
  const s = situation.trim();
  return `Sorry about ${s.charAt(0).toLowerCase() + s.slice(1)}.`;
};
const DURS = [1.6, 1.9, 2.2];

/** Same situation + same roll number always gives the same excuse. */
export function excuseFor(situation: string, roll: number, hi = false) {
  const sit = situation.trim();
  const h = hash("excuse:" + sit.toLowerCase() + ":" + roll);
  const idx = [h % 10, (h >>> 4) % 10, (h >>> 8) % 10];
  const believe = 3 + (hash("believe:" + sit.toLowerCase() + ":" + roll) % 95);
  return { idx, believe, text: `${sorry(sit, hi)} ${joinParts(idx, hi)}` };
}

/** The pieces of the excuse as shown on the story card (same situation and roll give the same excuse). */
export function excuseParts(situation: string, roll: number, hi = false) {
  const e = excuseFor(situation, roll, hi);
  return { text: joinParts(e.idx, hi), believe: e.believe };
}

const btn =
  "min-h-14 cursor-pointer rounded-[18px] border-0 bg-[#6a4cff] px-4 py-3.5 text-[17px] font-extrabold text-white shadow-[0_6px_0_#4126c9,0_14px_24px_rgba(65,38,201,.28)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_2px_0_#4126c9] disabled:cursor-default disabled:opacity-50";
const ghost =
  "min-h-14 cursor-pointer rounded-[18px] border-2 border-[#d6ccff] bg-white px-4 py-3 text-[17px] font-extrabold text-[#3b23b8] shadow-[0_5px_0_#d6ccff] active:translate-y-[3px] active:shadow-[0_2px_0_#d6ccff] disabled:cursor-default disabled:opacity-50";

export default function ExcuseGenerator() {
  const tr = useTr();
  const hi = useHindi();
  const lists = (hi ? appContent().excuse?.lists : undefined) ?? LISTS;
  const [sit, setSit] = useState("");
  const [roll, setRoll] = useState(0);
  const [idx, setIdx] = useState([0, 3, 6]);
  const [rot, setRot] = useState([0, -108, -216]);
  const [spinning, setSpinning] = useState(false);
  const [has, setHas] = useState(false);
  const [lever, setLever] = useState(false);
  const [made, setMade] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const later = useTimers();

  function spin(nextRoll: number) {
    const text = sit.trim();
    if (!text || spinning) return;
    const e = excuseFor(text, nextRoll, hi);
    setRot(rot.map((prev, i) => {
      let t = -e.idx[i] * 36;
      while (t > prev - 360 * (3 + i)) t -= 360;
      return t;
    }));
    setRoll(nextRoll);
    setIdx(e.idx);
    setSpinning(true);
    setHas(false);
    setLever(true);
    later(() => setLever(false), 820);
    later(() => {
      setSpinning(false);
      setHas(true);
      setMade(text);
    }, 2500);
  }

  const e = excuseFor(made || " ", roll, hi);
  const excuse = `${sorry(made, hi)} ${joinParts(idx, hi)}`;
  const believe = e.believe;
  const believeColor = believe > 66 ? "#14a06a" : believe > 33 ? "#f0a020" : "#e5484d";

  const input = (
    <div className="flex flex-col gap-2 lg:col-start-2 lg:row-start-1">
      <label htmlFor="ex-sit" className="text-sm font-bold text-[#5b4f86]">{tr("What happened?")}</label>
      <input
        id="ex-sit"
        value={sit}
        onChange={(ev) => setSit(ev.target.value)}
        onKeyDown={(ev) => ev.key === "Enter" && spin(0)}
        placeholder={tr("missing the 8am class")}
        maxLength={60}
        autoComplete="off"
        className="box-border w-full rounded-2xl border-2 border-[#d6ccff] bg-white px-4 py-[15px] text-base font-medium text-[#1d1340] outline-none placeholder:text-[#9a90c6] focus:border-[#6a4cff] focus:shadow-[0_0_0_4px_rgba(106,76,255,.15)] sm:text-[17px]"
      />
    </div>
  );

  const machine = (
    <div className="flex items-stretch gap-2.5 lg:col-start-1 lg:row-span-3 lg:row-start-1">
      <div className="relative flex min-w-0 flex-1 flex-col gap-2 rounded-3xl bg-[#2b1d73] p-3 shadow-[0_8px_0_#1a1150,0_18px_30px_rgba(26,17,80,.3)]">
        <div className="flex justify-between px-1.5">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="size-2.5 animate-fz-bulb rounded-full bg-[#ffd23f]" style={{ animationDelay: `${(i * 0.13).toFixed(2)}s` }} />
          ))}
        </div>
        {lists.map((list, i) => (
          <div key={i} className="relative h-[66px] overflow-hidden rounded-xl bg-white shadow-[inset_0_0_0_3px_#ffd23f] [perspective:420px]">
            <div className="absolute left-2 top-1 z-[2] text-[10px] font-bold tracking-[.1em] text-[#8f84bd]">{tr(LABELS[i])}</div>
            <div
              className="absolute inset-0 [transform-style:preserve-3d]"
              style={{
                transform: `translateZ(-90px) rotateX(${rot[i]}deg)`,
                transition: `transform ${DURS[i]}s cubic-bezier(.12,.85,.25,1.04) ${(i * 0.05).toFixed(2)}s`,
              }}
            >
              {list.map((t, j) => (
                <div
                  key={t}
                  className="absolute inset-x-0 top-1/2 -mt-[29px] box-border flex h-[58px] items-center justify-center overflow-hidden border-y border-[#ece7ff] bg-white px-2.5 text-center text-[15px] font-bold leading-tight text-[#1d1340] [backface-visibility:hidden] min-[380px]:text-[17px]"
                  style={{ transform: `rotateX(${j * 36}deg) translateZ(90px)` }}
                >
                  {t}
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(43,29,115,.55),rgba(43,29,115,0)_32%,rgba(43,29,115,0)_68%,rgba(43,29,115,.55))]" />
          </div>
        ))}
      </div>
      <div className="relative w-[34px] shrink-0 [perspective:300px]" aria-hidden="true">
        <div className="absolute bottom-10 left-1 h-10 w-[26px] rounded-lg bg-[#4126c9]" />
        <div className={`absolute bottom-[70px] left-[13px] h-[130px] w-2 origin-bottom rounded bg-[#c9c2e8] ${lever ? "animate-fz-lever" : ""}`}>
          <div className="absolute -left-2.5 -top-3.5 size-7 rounded-full bg-[#ff4d6d] shadow-[inset_-4px_-4px_0_#c42a48]" />
        </div>
      </div>
    </div>
  );

  const result = (
    <div className="min-h-[120px] lg:col-start-2">
      {has ? (
        <div className="flex animate-fz-pop flex-col gap-2.5 rounded-[20px] bg-white p-4 shadow-[0_6px_0_#d6ccff]">
          <div className="text-base font-medium leading-[1.4] text-[#1d1340]">“{excuse}”</div>
          <div className="flex items-center gap-2.5">
            <span className="whitespace-nowrap text-xs font-bold text-[#5b4f86]">{tr("Believability")}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#ece7ff]">
              <div className="h-full rounded-full transition-[width] duration-1000 ease-out" style={{ width: `${believe}%`, background: believeColor }} />
            </div>
            <span className="text-lg font-extrabold text-[#1d1340]">{believe}%</span>
          </div>
        </div>
      ) : (
        <div className="rounded-[20px] border-2 border-dashed border-[#d6ccff] p-4 text-center text-[15px] leading-[1.4] text-[#5b4f86]">
          {spinning ? tr("Cooking up an excuse…") : tr("Tell me what happened, then pull the lever.")}
        </div>
      )}
    </div>
  );

  const buttons = (
    <div className="grid grid-cols-2 gap-3 lg:col-start-2">
      <button type="button" className={btn} onClick={() => spin(0)} disabled={!sit.trim() || spinning}>{tr("Make my excuse")}</button>
      <button type="button" className={ghost} onClick={() => spin(roll + 1)} disabled={!has || spinning}>{tr("Roll again")}</button>
    </div>
  );

  const storyCard = has && (
    <div className="flex animate-fz-pop flex-col items-center gap-3 lg:col-span-2 lg:mx-auto lg:w-full lg:max-w-[380px]">
      <CardExcuse cardRef={cardRef} data={{ situation: made, text: joinParts(idx, hi), believe }} />
      <CardActions
        getNode={() => cardRef.current}
        fileName="excuse-toppershelf.png"
        shareText={tr("My excuse for {s}: {n}% believable. Make yours!", { s: made, n: believe })}
        shareUrl={resultLink("excuse", { s: made, r: roll })}
        btnClass={btn}
        ghostClass={ghost}
      />
    </div>
  );

  return (
    <GameShell
      gradient="linear-gradient(150deg,#6d28d9 0%,#a21caf 55%,#ec4899 100%)"
      icon="/fun-zone/excuse-generator.webp"
      iconBg="#cfcbfc"
      title="Excuse Generator"
      subtitle="Funny excuses for super specific situations, lowkey believable."
      status="LIVE"
      panelClass="bg-[#f3f0ff] px-5 text-[#1d1340] sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:content-center lg:gap-x-10 lg:gap-y-4"
      rootClass="bg-[#f3f0ff]"
      body={<>{input}{machine}{result}{buttons}{storyCard}</>}
    />
  );
}
