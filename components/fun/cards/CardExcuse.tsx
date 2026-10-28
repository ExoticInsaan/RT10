"use client";

import Image from "next/image";
import type { Ref } from "react";
import { FitBox, hand } from "@/components/fun/kit";

export type ExcuseCardData = { situation: string; text: string; believe: number };

export const excuseSample: ExcuseCardData = {
  situation: "missing the 8am class",
  text: "A very confident pigeon sat on my notebook, so I followed the rules and ngl, respect.",
  believe: 34,
};

/** The theme follows how believable the excuse is: low is red, middle is purple, high is green. */
function theme(believe: number) {
  if (believe < 34) return { bg: "#7f1d3a", glow: "#f43f5e", soft: "#fecdd3", stamp: "#dc2626", word: "SUS" };
  if (believe < 67) return { bg: "#4c1d95", glow: "#a21caf", soft: "#ddd6fe", stamp: "#c2410c", word: "MAYBE" };
  return { bg: "#064e3b", glow: "#10b981", soft: "#a7f3d0", stamp: "#15803d", word: "LEGIT" };
}

/** 9:16 story card (drawn at 540x960, exported at 1080x1920). The colours follow the believability. */
export default function CardExcuse({ data = excuseSample, cardRef }: { data?: ExcuseCardData; cardRef?: Ref<HTMLDivElement> }) {
  const t = theme(data.believe);
  const sit = data.situation.trim();
  const shortSit = sit.length > 36 ? sit.slice(0, 34).trimEnd() + "…" : sit;
  return (
    <FitBox width={540} height={960} max={1} className="mx-auto max-w-[540px]">
      <div ref={cardRef} className={`${hand.variable} w-[540px] h-[960px] relative overflow-hidden text-[#fff]`} style={{ background: t.bg }}>
        <div className="absolute inset-0 [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,.08)_1px,transparent_1.5px)_0_0/7px_7px]"></div>
        <div className="absolute -right-[120px] -top-[80px] w-[400px] h-[400px] rounded-full [filter:blur(90px)] opacity-[.6]" style={{ background: t.glow }}></div>

        <div className="absolute left-[44px] top-[104px] text-[14px] font-extrabold tracking-[.2em]" style={{ color: t.soft }}>
          FOR THE RECORD
        </div>
        <div className="absolute left-[44px] right-[44px] top-[132px] font-display italic text-[52px] leading-[1.02] overflow-hidden h-[108px]">
          about {shortSit}…
        </div>

        <div className="absolute left-[46px] right-[46px] top-[284px] h-[470px] bg-[#fffdf5] text-[#1e1b4b] [transform:rotate(-2.5deg)] shadow-[0_30px_50px_-20px_rgba(0,0,0,.55)] p-[36px_30px_30px_58px] box-border overflow-hidden [background-image:repeating-linear-gradient(180deg,transparent_0_37px,#d6e4f5_37px_38px)]">
          <div className="absolute left-[40px] top-[0] bottom-[0] w-[2px] bg-[#f9a8b8]"></div>
          <div className="text-[12px] font-black tracking-[.18em] text-[#7c3aed] leading-[38px]">OFFICIAL EXCUSE</div>
          <div className="font-hand font-bold text-[31px] leading-[38px] text-[#1e3a8a]">Dear Ma&apos;am, {data.text.charAt(0).toLowerCase() + data.text.slice(1)}</div>
          <div className="font-hand text-[30px] leading-[38px] text-[#1e3a8a] mt-[8px]">signed, a very honest student</div>
          <div className="absolute right-[22px] bottom-[26px] w-[132px] h-[132px] rounded-full [border:4px_solid] flex flex-col items-center justify-center [transform:rotate(-16deg)] opacity-[.88]" style={{ color: t.stamp, borderColor: t.stamp }}>
            <div className="text-[11px] font-black tracking-[.16em]">BELIEVABILITY</div>
            <div className="font-display text-[44px] leading-[1]">{data.believe}%</div>
            <div className="text-[11px] font-black tracking-[.16em]">{t.word}</div>
          </div>
        </div>
        <div className="absolute left-[50%] top-[268px] -ml-[50px] w-[100px] h-[30px] bg-[rgba(253,224,71,.7)] [transform:rotate(-3deg)]"></div>

        <div className="absolute left-[44px] right-[44px] bottom-[118px] flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <Image src="/mascot/owl-peek.webp"
              unoptimized alt="" width={62} height={49} className="h-auto w-[62px] block" />
            <div className="text-[14px] leading-[1.3]">
              <div className="font-extrabold">need an excuse?</div>
              <div className="opacity-[.8]">toppershelf.online/fun</div>
            </div>
          </div>
          <div className="font-hand text-[28px] [transform:rotate(-4deg)]" style={{ color: t.soft }}>
            totally legit
          </div>
        </div>
      </div>
    </FitBox>
  );
}
