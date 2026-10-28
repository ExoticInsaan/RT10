"use client";

import Image from "next/image";
import { FitBox, hand } from "@/components/fun/kit";

/** 9:16 story card (drawn at 540x960, exported at 1080x1920). Scales to fit any screen. */
export default function CardWhatAmI() {
  return (
    <FitBox width={540} height={960} max={1} className="mx-auto max-w-[540px]">
      <div
        className={`${hand.variable} w-[540px] h-[960px] relative overflow-hidden bg-[#3b0764] text-[#fff]`}
      >
        <div className="absolute -left-[140px] -top-[60px] w-[460px] h-[460px] rounded-full bg-[#c026d3] [filter:blur(90px)] opacity-[.7]"></div>
        <div className="absolute -right-[160px] bottom-[40px] w-[480px] h-[480px] rounded-full bg-[#fb7185] [filter:blur(100px)] opacity-[.55]"></div>
        <div className="absolute inset-0 [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,.08)_1px,transparent_1.5px)_0_0/7px_7px]"></div>

        <div className="absolute left-[44px] top-[104px] text-[14px] font-extrabold tracking-[.2em] text-[#f5d0fe]">
          ASK ME ANYTHING, KINDA
        </div>

        <Image
          src="/mascot/owl-peek.webp"
          alt=""
          width={150}
          height={118}
          className="h-auto w-[150px] absolute right-[58px] top-[166px] block"
        />

        <div className="absolute left-[40px] right-[40px] top-[270px] bg-[#fff] text-[#2e1065] rounded-[30px] p-[56px_26px_26px] shadow-[0_30px_60px_-20px_rgba(0,0,0,.5)]">
          <div className="absolute left-[50%] -top-[38px] -ml-[38px] w-[76px] h-[76px] rounded-full bg-[#a855f7] [border:5px_solid_#fff] flex items-center justify-center font-display text-[38px] text-[#fff]">
            A
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

        <div className="absolute left-[50%] top-[752px] [transform:translateX(-50%)_rotate(-2deg)] flex items-center gap-[10px] bg-[#fff] text-[#2e1065] rounded-[99px] p-[12px_20px] font-extrabold text-[17px] whitespace-nowrap shadow-[0_12px_24px_-10px_rgba(0,0,0,.45)]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a21caf"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
          </svg>
          toppershelf.online/fun/ananya
        </div>

        <div className="absolute left-[44px] right-[44px] bottom-[110px] text-center font-hand text-[30px] text-[#f5d0fe]">
          be honest, i can take it
        </div>
      </div>
    </FitBox>
  );
}
