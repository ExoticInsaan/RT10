"use client";

import Image from "next/image";
import type { Ref } from "react";
import { FitBox, hand, storyDate, useToday } from "@/components/fun/kit";

export type VibeCardData = {
  name: string;
  vibe: string;
  line: string;
  /** Light, mid and deep colours of the vibe; they tint the glow, the orb and the accents. */
  a: string;
  b: string;
  bg: string;
  meters: { label: string; v: number }[];
};

export const vibeSample: VibeCardData = {
  name: "Aryan",
  vibe: "Main Character",
  line: "You're the main character today. Walk slow, stare out of windows, no cap.",
  a: "#f9a8d4",
  b: "#db2777",
  bg: "#be185d",
  meters: [{ label: "ENERGY", v: 88 }, { label: "AURA", v: 96 }, { label: "CHAOS", v: 41 }],
};

/** 9:16 story card (drawn at 540x960, exported at 1080x1920). The colours follow the vibe. */
export default function CardVibe({ data = vibeSample, cardRef, date }: { data?: VibeCardData; cardRef?: Ref<HTMLDivElement>; date?: Date }) {
  const today = useToday();
  const when = date ?? today;
  const { name, vibe, line, a, b, bg, meters } = data;
  const nm = name.trim();
  return (
    <FitBox width={540} height={960} max={1} className="mx-auto max-w-[540px]">
      <div ref={cardRef} className={`${hand.variable} w-[540px] h-[960px] relative overflow-hidden bg-[#140c2e] text-[#fff]`}>
        <div className="animate-fz-drift absolute -left-[80px] top-[170px] w-[380px] h-[380px] rounded-full [filter:blur(70px)] opacity-[.75]" style={{ background: b }}></div>
        <div className="animate-fz-drift absolute -right-[90px] top-[300px] w-[360px] h-[360px] rounded-full [filter:blur(80px)] opacity-[.6]" style={{ animationDelay: "-3s", background: a }}></div>
        <div className="animate-fz-drift absolute left-[90px] top-[470px] w-[340px] h-[340px] rounded-full [filter:blur(80px)] opacity-[.7]" style={{ animationDelay: "-6s", background: bg }}></div>
        <div className="absolute inset-0 [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,.07)_1px,transparent_1.5px)_0_0/6px_6px]"></div>

        <div className="absolute left-[44px] right-[44px] top-[104px] flex justify-between text-[14px] font-extrabold tracking-[.2em] opacity-[.9]">
          <span>TODAY&apos;S VIBE</span>
          <span>{when ? storyDate(when) : "TODAY"}</span>
        </div>

        <div
          className="animate-fz-breathe absolute left-[50%] top-[190px] w-[250px] h-[250px] -ml-[125px] rounded-full"
          style={{
            background: `radial-gradient(circle at 34% 28%,#ffffff 0%,${a} 14%,${b} 48%,${bg} 80%,#1a0b2e 100%)`,
            boxShadow: `0 0 90px ${b}bf, inset -20px -26px 50px rgba(20,12,46,.5)`,
          }}
        ></div>
        <div className="absolute left-[50%] top-[296px] w-[360px] h-[40px] -ml-[180px] rounded-full [border:2px_solid_rgba(255,255,255,.55)] [transform:rotate(-12deg)]"></div>

        <div className="absolute left-[44px] right-[44px] top-[488px] text-center">
          <div className="text-[18px] font-semibold opacity-[.85] overflow-hidden whitespace-nowrap text-ellipsis">{nm}&apos;s aura says</div>
          <div className="font-display italic leading-[1] mt-[6px] whitespace-nowrap" style={{ fontSize: vibe.length > 18 ? 40 : vibe.length > 14 ? 50 : 62 }}>
            {vibe}
          </div>
          <div className="text-[21px] leading-[1.4] mt-[16px] opacity-[.92]">{line}</div>
        </div>

        <div className="absolute left-[70px] right-[70px] top-[690px] flex flex-col gap-[12px]">
          {meters.map((m) => (
            <div key={m.label} className="flex items-center gap-[12px] text-[12px] font-extrabold tracking-[.14em]">
              <span className="w-[70px]">{m.label}</span>
              <div className="flex-1 h-[3px] bg-[rgba(255,255,255,.25)] rounded-[2px]">
                <div className="h-[100%] bg-[#fff] rounded-[2px]" style={{ width: `${m.v}%` }}></div>
              </div>
              <span className="w-[34px] text-right">{m.v}</span>
            </div>
          ))}
        </div>

        <div className="absolute left-[44px] right-[44px] bottom-[118px] flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <Image src="/mascot/owl-peek.webp"
              unoptimized alt="" width={62} height={49} className="h-auto w-[62px] block" />
            <div className="text-[14px] leading-[1.3]">
              <div className="font-extrabold">check your vibe</div>
              <div className="opacity-[.8]">toppershelf.online/fun</div>
            </div>
          </div>
          <div className="font-hand text-[28px] [transform:rotate(-4deg)]" style={{ color: a }}>
            new one tomorrow
          </div>
        </div>
      </div>
    </FitBox>
  );
}
