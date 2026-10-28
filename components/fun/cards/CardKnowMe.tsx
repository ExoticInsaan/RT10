"use client";

import Image from "next/image";
import type { Ref } from "react";
import { FitBox, hand } from "@/components/fun/kit";

export type KnowMeCardData = { owner: string; top: { name: string; score: number }[] };

export const knowMeSample: KnowMeCardData = {
  owner: "Jatin",
  top: [{ name: "Aryan", score: 9 }, { name: "Rohit", score: 8 }, { name: "Dev", score: 6 }],
};

/** The glow follows how well the best friend did: gold for a near-perfect score, cyan in the middle, violet below. */
function glow(best: number) {
  return best >= 8 ? "#f59e0b" : best >= 5 ? "#22d3ee" : "#a78bfa";
}

const initial = (name: string) => (name.trim().charAt(0) || "?").toUpperCase();
const short = (name: string) => (name.length > 9 ? name.slice(0, 8) + "…" : name);

/** 9:16 story card (drawn at 540x960, exported at 1080x1920). The podium shows the real top three. */
export default function CardKnowMe({ data = knowMeSample, cardRef }: { data?: KnowMeCardData; cardRef?: Ref<HTMLDivElement> }) {
  const [first, second, third] = data.top;
  const best = first?.score ?? 0;
  return (
    <FitBox width={540} height={960} max={1} className="mx-auto max-w-[540px]">
      <div
        ref={cardRef}
        className={`${hand.variable} w-[540px] h-[960px] relative overflow-hidden bg-[#0b1d3a] text-[#fff]`}
      >
        <div className="absolute left-[50%] top-[330px] w-[520px] h-[520px] -ml-[260px] rounded-full [filter:blur(120px)] opacity-[.28]" style={{ background: glow(best) }}></div>
        <div className="animate-fz-tw absolute left-[60px] top-[200px] w-[5px] h-[5px] rounded-full bg-[#fde68a]"></div>
        <div
          className="animate-fz-tw absolute left-[460px] top-[250px] w-[6px] h-[6px] rounded-full bg-[#fff]"
          style={{ animationDelay: ".8s" }}
        ></div>
        <div
          className="animate-fz-tw absolute left-[400px] top-[150px] w-[4px] h-[4px] rounded-full bg-[#fde68a]"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="animate-fz-tw absolute left-[110px] top-[330px] w-[4px] h-[4px] rounded-full bg-[#fff]"
          style={{ animationDelay: ".4s" }}
        ></div>
        <div className="absolute left-[70px] top-[420px] w-[10px] h-[16px] rounded-[2px] bg-[#f43f5e] [transform:rotate(30deg)]"></div>
        <div className="absolute left-[450px] top-[400px] w-[10px] h-[16px] rounded-[2px] bg-[#22d3ee] [transform:rotate(-20deg)]"></div>
        <div className="absolute left-[400px] top-[470px] w-[8px] h-[14px] rounded-[2px] bg-[#a78bfa] [transform:rotate(60deg)]"></div>
        <div className="absolute left-[120px] top-[480px] w-[8px] h-[14px] rounded-[2px] bg-[#fde68a] [transform:rotate(-40deg)]"></div>

        <div className="absolute left-[44px] right-[44px] top-[104px] text-[14px] font-extrabold tracking-[.2em] text-[#fde68a] overflow-hidden whitespace-nowrap text-ellipsis">
          {data.owner.toUpperCase()}&apos;S QUIZ · 10 QUESTIONS
        </div>
        <div className="absolute left-[44px] top-[140px] font-display italic text-[80px] leading-[.95]">
          who knows
          <br />
          me best?
        </div>

        <div className="absolute left-[50%] top-[336px] w-[420px] -ml-[210px] flex items-end gap-[10px]">
          <div className="flex-1 flex flex-col items-center gap-[8px]">
            {second && (
              <>
                <div className="w-[60px] h-[60px] rounded-full bg-[#60a5fa] flex items-center justify-center font-black text-[24px] [border:3px_solid_#fff]">{initial(second.name)}</div>
                <div className="font-extrabold text-[17px]">{short(second.name)}</div>
                <div className="w-[100%] h-[150px] rounded-[16px_16px_0_0] bg-[#cbd5e1] text-[#0b1d3a] flex flex-col items-center pt-[12px] box-border shadow-[inset_-12px_0_0_rgba(0,0,0,.08)]">
                  <span className="font-display text-[44px] leading-[1]">2</span>
                  <span className="text-[15px] font-extrabold">{second.score}/10</span>
                </div>
              </>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center gap-[8px]">
            {first && (
              <>
                <svg width="46" height="34" viewBox="0 0 34 26" aria-hidden="true">
                  <path d="M2 24 L4 6 L11 14 L17 2 L23 14 L30 6 L32 24 Z" fill="#facc15" stroke="#fde68a" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                <div className="w-[72px] h-[72px] rounded-full bg-[#f472b6] flex items-center justify-center font-black text-[28px] [border:3px_solid_#facc15]">{initial(first.name)}</div>
                <div className="font-extrabold text-[18px]">{short(first.name)}</div>
                <div className="w-[100%] h-[210px] rounded-[16px_16px_0_0] bg-[#facc15] text-[#0b1d3a] flex flex-col items-center pt-[14px] box-border shadow-[inset_-12px_0_0_rgba(0,0,0,.08)]">
                  <span className="font-display text-[56px] leading-[1]">1</span>
                  <span className="text-[16px] font-extrabold">{first.score}/10</span>
                </div>
              </>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center gap-[8px]">
            {third && (
              <>
                <div className="w-[56px] h-[56px] rounded-full bg-[#34d399] flex items-center justify-center font-black text-[22px] [border:3px_solid_#fff]">{initial(third.name)}</div>
                <div className="font-extrabold text-[17px]">{short(third.name)}</div>
                <div className="w-[100%] h-[110px] rounded-[16px_16px_0_0] bg-[#d08b52] text-[#0b1d3a] flex flex-col items-center pt-[10px] box-border shadow-[inset_-12px_0_0_rgba(0,0,0,.1)]">
                  <span className="font-display text-[40px] leading-[1]">3</span>
                  <span className="text-[15px] font-extrabold">{third.score}/10</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="absolute left-[44px] right-[44px] top-[722px] h-[2px] bg-[rgba(255,255,255,.18)]"></div>

        <div className="absolute left-[44px] right-[44px] top-[740px] text-[22px] leading-[1.35] text-center">
          Think you know me better than{" "}
          <span className="font-hand text-[32px] text-[#fde68a]">{first ? short(first.name) : "them"}?</span>
        </div>

        <div className="absolute left-[44px] right-[44px] bottom-[118px] flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <Image
              src="/mascot/owl-peek.webp"
              unoptimized
              alt=""
              width={62}
              height={49}
              className="h-auto w-[62px] block"
            />
            <div className="text-[14px] leading-[1.3]">
              <div className="font-extrabold">take my quiz</div>
              <div className="opacity-[.8]">toppershelf.online/fun</div>
            </div>
          </div>
          <div className="font-hand text-[28px] [transform:rotate(-4deg)] text-[#fde68a]">
            prove it
          </div>
        </div>
      </div>
    </FitBox>
  );
}
