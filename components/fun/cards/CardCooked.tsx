"use client";

import Image from "next/image";
import type { Ref } from "react";
import { FitBox, hand, mix, storyDate } from "@/components/fun/kit";

export type CookedCardData = { name: string; score: number; tier: string; bg: string; verdict: string };

export const cookedSample: CookedCardData = {
  name: "Aarav",
  score: 87,
  tier: "WELL DONE",
  bg: "#d6401b",
  verdict: "Well done. Your brain has 47 tabs open and one is playing music.",
};

/** 9:16 story card (drawn at 540x960, exported at 1080x1920). The colours follow the result. */
export default function CardCooked({ data = cookedSample, cardRef, date = new Date() }: { data?: CookedCardData; cardRef?: Ref<HTMLDivElement>; date?: Date }) {
  const { name, score, tier, bg, verdict } = data;
  const dark = mix(bg, "#000000", 0.16);
  const accent = mix(bg, "#fff3e6", 0.72);
  const words = tier.charAt(0) + tier.slice(1).toLowerCase();
  const [w1, ...rest] = words.split(" ");
  const nm = name.trim();
  return (
    <FitBox width={540} height={960} max={1} className="mx-auto max-w-[540px]">
      <div ref={cardRef} className={`${hand.variable} w-[540px] h-[960px] relative overflow-hidden text-[#fff3e6]`} style={{ background: bg }}>
        <div className="absolute inset-0 [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,.09)_1px,transparent_1.5px)_0_0/7px_7px]"></div>
        <div className="absolute -left-[120px] top-[520px] w-[520px] h-[520px] rounded-full" style={{ background: dark }}></div>

        <div className="absolute left-[44px] right-[44px] top-[104px] flex justify-between text-[15px] font-extrabold tracking-[.18em]">
          <span>HOW COOKED ARE YOU?</span>
          <span className="opacity-[.75]">{storyDate(date).split(" · ")[1]}</span>
        </div>

        <div className="absolute left-[44px] right-[44px] top-[170px] font-display italic leading-[1] overflow-hidden whitespace-nowrap text-ellipsis" style={{ fontSize: nm.length > 16 ? 30 : nm.length > 10 ? 38 : 44 }}>
          {nm} is
        </div>
        <div className="absolute left-[34px] top-[206px] font-display leading-[.86] tracking-[-.04em]" style={{ fontSize: score > 99 ? 190 : 250 }}>
          {score}%
        </div>
        <div className="absolute left-[44px] top-[420px] font-display italic text-[104px] leading-[1]" style={{ color: accent }}>
          cooked.
        </div>

        <div className="absolute right-[50px] top-[548px] w-[150px] h-[150px] rounded-full [border:4px_solid_#fff3e6] flex items-center justify-center [transform:rotate(-14deg)] text-center">
          <div className="absolute inset-[7px] rounded-full [border:2px_dashed_rgba(255,243,230,.7)]"></div>
          <div>
            <div className="text-[12px] font-black tracking-[.2em]">CERTIFIED</div>
            <div className="font-display text-[30px] leading-[1]">
              {w1}
              {rest.length > 0 && (<><br />{rest.join(" ")}</>)}
            </div>
          </div>
        </div>

        <svg className="absolute left-[44px] top-[560px]" width="200" height="140" viewBox="0 0 200 140" aria-hidden="true">
          <path className="animate-fz-steam2" d="M70 40 q-10 -12 0 -24 q10 -12 0 -24" stroke="#fff3e6" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path className="animate-fz-steam2" style={{ animationDelay: "1s" }} d="M100 40 q-10 -12 0 -24 q10 -12 0 -24" stroke="#fff3e6" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path className="animate-fz-steam2" style={{ animationDelay: "2s" }} d="M130 40 q-10 -12 0 -24 q10 -12 0 -24" stroke="#fff3e6" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M30 60 h140 v30 a40 40 0 0 1 -40 40 h-60 a40 40 0 0 1 -40 -40 z" fill="#fff3e6" />
          <rect x="22" y="52" width="156" height="14" rx="7" fill={accent} />
          <rect x="6" y="72" width="24" height="10" rx="5" fill="#fff3e6" />
          <rect x="170" y="72" width="24" height="10" rx="5" fill="#fff3e6" />
          <text x="100" y="104" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="16" letterSpacing="3" fill={bg}>
            CHAOS
          </text>
        </svg>

        <div className="absolute left-[44px] right-[44px] top-[722px] text-[24px] leading-[1.35] font-medium">{verdict}</div>

        <div className="absolute left-[44px] right-[44px] bottom-[118px] flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <Image src="/mascot/owl-peek.webp" alt="" width={62} height={49} className="h-auto w-[62px] block" />
            <div className="text-[14px] leading-[1.3]">
              <div className="font-extrabold">how cooked are you?</div>
              <div className="opacity-[.8]">toppershelf.online/fun</div>
            </div>
          </div>
          <div className="font-hand text-[28px] [transform:rotate(-4deg)]">your turn</div>
        </div>
      </div>
    </FitBox>
  );
}
