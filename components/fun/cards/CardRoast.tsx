"use client";

import Image from "next/image";
import type { Ref } from "react";
import { FitBox, hand } from "@/components/fun/kit";

export type RoastCardData = { day: string; lines: string[]; level: string; score: number };

export const roastSample: RoastCardData = {
  day: "6 classes, no breaks, coaching, sleep at 2am, self study",
  lines: [
    "6 classes? That is not a timetable, that is a hostage situation.",
    "No breaks. Your bladder has filed a formal complaint with the principal.",
    "Self study is a beautiful fiction, like unicorns and free periods.",
  ],
  level: "VOLCANIC",
  score: 8,
};

/** The theme follows the roast level: cool for mild, warm for spicy, deep red for volcanic. */
function heat(score: number) {
  if (score <= 4) return { accent: "#2f855a", mark: "#bbf7d0", word: "#15803d", chili: "#16a34a" };
  if (score <= 6) return { accent: "#c2410c", mark: "#fed7aa", word: "#c2410c", chili: "#ea580c" };
  return { accent: "#b91c1c", mark: "#fde047", word: "#dc2626", chili: "#e5381d" };
}

/** Marks the last few words of a line like a highlighter pen. */
function Marked({ text, mark }: { text: string; mark: string }) {
  const words = text.split(" ");
  const cut = Math.max(0, words.length - 3);
  return (
    <>
      {words.slice(0, cut).join(" ")}{cut ? " " : ""}
      <span className="px-0.5" style={{ background: `linear-gradient(transparent 52%,${mark} 52%,${mark} 90%,transparent 90%)` }}>{words.slice(cut).join(" ")}</span>
    </>
  );
}

const CHILI = "M10 6c4 0 6 3 5 8-1 5-6 9-10 9 3-3 3-6 2-9-1-4 0-8 3-8z";

/** 9:16 story card (drawn at 540x960, exported at 1080x1920). The colours follow the roast level. */
export default function CardRoast({ data = roastSample, cardRef, date = new Date() }: { data?: RoastCardData; cardRef?: Ref<HTMLDivElement>; date?: Date }) {
  const h = heat(data.score);
  const day = data.day.trim();
  const when = date.toLocaleString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }).replace(",", " at");
  return (
    <FitBox width={540} height={960} max={1} className="mx-auto max-w-[540px]">
      <div ref={cardRef} className={`${hand.variable} w-[540px] h-[960px] relative overflow-hidden bg-[#fffcf3] text-[#1c1917]`}>
        <div className="absolute left-[40px] right-[40px] top-[96px] flex justify-between items-center text-[18px] font-semibold" style={{ color: h.accent }}>
          <span className="flex items-center gap-[4px]">
            <svg width="14" height="22" viewBox="0 0 14 22" aria-hidden="true">
              <path d="M11 2 L3 11 L11 20" stroke={h.accent} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Notes
          </span>
          <span className="text-[15px]">Done</span>
        </div>
        <div className="absolute left-[40px] right-[40px] top-[150px] text-center text-[14px] text-[#a8a29e]">{when}</div>

        <div className="absolute left-[40px] right-[40px] top-[190px]">
          <div className="text-[36px] font-extrabold leading-[1.1] tracking-[-.02em]">my timetable got roasted</div>
          <div className="mt-[16px] text-[18px] text-[#57534e] leading-[1.5] h-[54px] overflow-hidden">“{day.length > 90 ? day.slice(0, 88) + "…" : day}”</div>
          <div className="h-[1px] bg-[#e7e5e4] m-[22px_0]"></div>
          <div className="flex flex-col gap-[18px] text-[22px] leading-[1.45]">
            {data.lines.slice(0, 3).map((t, i) => (
              <p key={i} className="m-[0]">{i === 0 || i === 2 ? <Marked text={t} mark={h.mark} /> : t}</p>
            ))}
          </div>
        </div>

        <div className="absolute left-[40px] right-[40px] top-[686px] bg-[#fff] [border:2px_solid_#f5e9cf] rounded-[18px] p-[14px_16px] flex items-center justify-between [transform:rotate(-1.5deg)] shadow-[0_10px_20px_-12px_rgba(120,53,15,.3)]">
          <div>
            <div className="text-[12px] font-extrabold tracking-[.16em] text-[#a16207]">ROAST LEVEL</div>
            <div className="font-display text-[34px] leading-[1]" style={{ color: h.word }}>
              {data.level.charAt(0) + data.level.slice(1).toLowerCase()}
            </div>
          </div>
          <div className="flex gap-[2px]" role="img" aria-label={`${data.score} out of 10 chillies`}>
            {Array.from({ length: 10 }, (_, i) => (
              <svg key={i} width="18" height="24" viewBox="0 0 20 24" aria-hidden="true">
                <path d={CHILI} fill={i < data.score ? h.chili : "#ede3cf"} />
              </svg>
            ))}
          </div>
        </div>

        <div className="absolute left-[40px] right-[40px] bottom-[118px] flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <Image src="/mascot/owl-peek.webp" alt="" width={62} height={49} className="h-auto w-[62px] block" />
            <div className="text-[14px] leading-[1.3]">
              <div className="font-extrabold">roast my timetable</div>
              <div className="text-[#78716c]">toppershelf.online/fun</div>
            </div>
          </div>
          <div className="font-hand text-[28px] [transform:rotate(-4deg)]" style={{ color: h.accent }}>
            i felt that
          </div>
        </div>
      </div>
    </FitBox>
  );
}
