"use client";

import Image from "next/image";
import type { Ref } from "react";
import { FitBox, hand, hash } from "@/components/fun/kit";

export type WhatAmICardData = { owner: string; link: string };

export const whatAmISample: WhatAmICardData = { owner: "Ananya", link: "toppershelf.online/fun/notes/ananya" };

// Each person gets their own colour scheme, picked from their name, so every card looks different.
const THEMES = [
  { bg: "#3b0764", b1: "#c026d3", b2: "#fb7185", ac: "#a855f7", ink: "#2e1065", soft: "#f5d0fe", link: "#a21caf" },
  { bg: "#0c2a4d", b1: "#0284c7", b2: "#22d3ee", ac: "#0ea5e9", ink: "#0c2a4d", soft: "#bae6fd", link: "#0369a1" },
  { bg: "#431407", b1: "#ea580c", b2: "#facc15", ac: "#f97316", ink: "#431407", soft: "#fed7aa", link: "#c2410c" },
  { bg: "#052e1b", b1: "#059669", b2: "#a3e635", ac: "#10b981", ink: "#052e1b", soft: "#bbf7d0", link: "#047857" },
];

/** 9:16 story card (drawn at 540x960, exported at 1080x1920). The link on it is the owner's own link. */
export default function CardWhatAmI({ data = whatAmISample, cardRef }: { data?: WhatAmICardData; cardRef?: Ref<HTMLDivElement> }) {
  const t = THEMES[hash(data.owner.trim().toLowerCase()) % THEMES.length];
  const owner = data.owner.trim() || "Me";
  return (
    <FitBox width={540} height={960} max={1} className="mx-auto max-w-[540px]">
      <div
        ref={cardRef}
        className={`${hand.variable} w-[540px] h-[960px] relative overflow-hidden text-[#fff]`}
        style={{ background: t.bg }}
      >
        <div className="absolute -left-[140px] -top-[60px] w-[460px] h-[460px] rounded-full [filter:blur(90px)] opacity-[.7]" style={{ background: t.b1 }}></div>
        <div className="absolute -right-[160px] bottom-[40px] w-[480px] h-[480px] rounded-full [filter:blur(100px)] opacity-[.55]" style={{ background: t.b2 }}></div>
        <div className="absolute inset-0 [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,.08)_1px,transparent_1.5px)_0_0/7px_7px]"></div>

        <div className="absolute left-[44px] top-[104px] text-[14px] font-extrabold tracking-[.2em]" style={{ color: t.soft }}>
          ASK ME ANYTHING, KINDA
        </div>

        <Image
          src="/mascot/owl-peek.webp"
              unoptimized
          alt=""
          width={150}
          height={118}
          className="h-auto w-[150px] absolute right-[58px] top-[166px] block"
        />

        <div className="absolute left-[40px] right-[40px] top-[270px] bg-[#fff] rounded-[30px] p-[56px_26px_26px] shadow-[0_30px_60px_-20px_rgba(0,0,0,.5)]" style={{ color: t.ink }}>
          <div className="absolute left-[50%] -top-[38px] -ml-[38px] w-[76px] h-[76px] rounded-full [border:5px_solid_#fff] flex items-center justify-center font-display text-[38px] text-[#fff]" style={{ background: t.ac }}>
            {owner.charAt(0).toUpperCase()}
          </div>
          <div className="text-center font-display text-[50px] leading-[1]">
            what am i to you?
          </div>
          <div className="text-center text-[17px] text-[#6b4c8f] mt-[10px]">
            pick one. it&apos;s anonymous.
          </div>
          <div className="grid [grid-template-columns:repeat(2,minmax(0,1fr))] gap-[10px] mt-[22px]">
            <div className="bg-[#fce7f3] rounded-[14px] p-[12px] font-extrabold text-[16px] text-center">
              best friend
            </div>
            <div className="bg-[#fef3c7] rounded-[14px] p-[12px] font-extrabold text-[16px] text-center">
              sibling vibe
            </div>
            <div className="bg-[#fee2e2] rounded-[14px] p-[12px] font-extrabold text-[16px] text-center">
              chaos partner
            </div>
            <div className="bg-[#dbeafe] rounded-[14px] p-[12px] font-extrabold text-[16px] text-center">
              study buddy
            </div>
            <div className="bg-[#ccfbf1] rounded-[14px] p-[12px] font-extrabold text-[16px] text-center">
              my therapist
            </div>
            <div className="bg-[#ede9fe] rounded-[14px] p-[12px] font-extrabold text-[16px] text-center">
              meme supplier
            </div>
            <div className="bg-[#ffedd5] rounded-[14px] p-[12px] font-extrabold text-[16px] text-center">
              food partner
            </div>
            <div className="bg-[#e2e8f0] rounded-[14px] p-[12px] font-extrabold text-[16px] text-center">
              a mystery
            </div>
          </div>
        </div>

        <div className="absolute left-[50%] top-[752px] [transform:translateX(-50%)_rotate(-2deg)] flex items-center gap-[10px] bg-[#fff] rounded-[99px] p-[12px_20px] font-extrabold whitespace-nowrap shadow-[0_12px_24px_-10px_rgba(0,0,0,.45)]" style={{ color: t.ink, fontSize: data.link.length > 36 ? 14 : 17 }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={t.link}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
          </svg>
          {data.link}
        </div>

        <div className="absolute left-[44px] right-[44px] bottom-[110px] text-center font-hand text-[30px]" style={{ color: t.soft }}>
          be honest, i can take it
        </div>
      </div>
    </FitBox>
  );
}
