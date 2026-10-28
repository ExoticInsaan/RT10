"use client";

import Image from "next/image";
import { FitBox, hand } from "@/components/fun/kit";

/** 9:16 story card (drawn at 540x960, exported at 1080x1920). Scales to fit any screen. */
export default function CardVibe() {
  return (
    <FitBox width={540} height={960} max={1} className="mx-auto max-w-[540px]">
      <div
        className={`${hand.variable} w-[540px] h-[960px] relative overflow-hidden bg-[#140c2e] text-[#fff]`}
      >
        <div className="animate-fz-drift absolute -left-[80px] top-[170px] w-[380px] h-[380px] rounded-full bg-[#ec4899] [filter:blur(70px)] opacity-[.75]"></div>
        <div
          className="animate-fz-drift absolute -right-[90px] top-[300px] w-[360px] h-[360px] rounded-full bg-[#f97316] [filter:blur(80px)] opacity-[.6]"
          style={{ animationDelay: "-3s" }}
        ></div>
        <div
          className="animate-fz-drift absolute left-[90px] top-[470px] w-[340px] h-[340px] rounded-full bg-[#7c3aed] [filter:blur(80px)] opacity-[.7]"
          style={{ animationDelay: "-6s" }}
        ></div>
        <div className="absolute inset-0 [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,.07)_1px,transparent_1.5px)_0_0/6px_6px]"></div>

        <div className="absolute left-[44px] right-[44px] top-[104px] flex justify-between text-[14px] font-extrabold tracking-[.2em] opacity-[.9]">
          <span>TODAY&apos;S VIBE</span>
          <span>WED · 28 OCT</span>
        </div>

        <div className="animate-fz-breathe absolute left-[50%] top-[190px] w-[250px] h-[250px] -ml-[125px] rounded-full [background:radial-gradient(circle_at_34%_28%,#ffffff_0%,#fbcfe8_14%,#f472b6_42%,#be185d_78%,#4c0d3a_100%)] shadow-[0_0_90px_rgba(244,114,182,.75),inset_-20px_-26px_50px_rgba(20,12,46,.5)]"></div>
        <div className="absolute left-[50%] top-[296px] w-[360px] h-[40px] -ml-[180px] rounded-full [border:2px_solid_rgba(255,255,255,.55)] [transform:rotate(-12deg)]"></div>

        <div className="absolute left-[44px] right-[44px] top-[488px] text-center">
          <div className="text-[18px] font-semibold opacity-[.85]">
            Ananya&apos;s aura says
          </div>
          <div className="font-display italic text-[62px] leading-[1] mt-[6px] whitespace-nowrap">
            Main Character
          </div>
          <div className="text-[21px] leading-[1.4] mt-[16px] opacity-[.92]">
            The universe cast you as the lead today. Walk slower. Look out of
            windows.
          </div>
        </div>

        <div className="absolute left-[70px] right-[70px] top-[720px] flex flex-col gap-[12px]">
          <div className="flex items-center gap-[12px] text-[12px] font-extrabold tracking-[.14em]">
            <span className="w-[70px]">ENERGY</span>
            <div className="flex-1 h-[3px] bg-[rgba(255,255,255,.25)] rounded-[2px]">
              <div className="w-[88%] h-[100%] bg-[#fff] rounded-[2px]"></div>
            </div>
            <span className="w-[34px] text-right">88</span>
          </div>
          <div className="flex items-center gap-[12px] text-[12px] font-extrabold tracking-[.14em]">
            <span className="w-[70px]">AURA</span>
            <div className="flex-1 h-[3px] bg-[rgba(255,255,255,.25)] rounded-[2px]">
              <div className="w-[96%] h-[100%] bg-[#fff] rounded-[2px]"></div>
            </div>
            <span className="w-[34px] text-right">96</span>
          </div>
          <div className="flex items-center gap-[12px] text-[12px] font-extrabold tracking-[.14em]">
            <span className="w-[70px]">CHAOS</span>
            <div className="flex-1 h-[3px] bg-[rgba(255,255,255,.25)] rounded-[2px]">
              <div className="w-[41%] h-[100%] bg-[#fff] rounded-[2px]"></div>
            </div>
            <span className="w-[34px] text-right">41</span>
          </div>
        </div>

        <div className="absolute left-[44px] right-[44px] bottom-[118px] flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <Image
              src="/mascot/owl-peek.webp"
              alt=""
              width={62}
              height={49}
              className="h-auto w-[62px] block"
            />
            <div className="text-[14px] leading-[1.3]">
              <div className="font-extrabold">check your vibe</div>
              <div className="opacity-[.8]">toppershelf.online/fun</div>
            </div>
          </div>
          <div className="font-hand text-[28px] [transform:rotate(-4deg)] text-[#fbcfe8]">
            new one tomorrow
          </div>
        </div>
      </div>
    </FitBox>
  );
}
