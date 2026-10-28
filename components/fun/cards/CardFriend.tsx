"use client";

import Image from "next/image";
import { FitBox, hand } from "@/components/fun/kit";

/** 9:16 story card (drawn at 540x960, exported at 1080x1920). Scales to fit any screen. */
export default function CardFriend() {
  return (
    <FitBox width={540} height={960} max={1} className="mx-auto max-w-[540px]">
      <div
        className={`${hand.variable} w-[540px] h-[960px] relative overflow-hidden bg-[#f5ede1] text-[#1f2a44]`}
      >
        <div className="absolute inset-0 [background:repeating-linear-gradient(0deg,transparent_0_31px,rgba(31,42,68,.06)_31px_32px)]"></div>

        <div className="absolute left-[44px] top-[104px] text-[14px] font-extrabold tracking-[.2em] text-[#b4546b]">
          FRIENDSHIP SCORE
        </div>

        <div className="absolute left-[52px] top-[150px] w-[190px] h-[220px] bg-[#fff] p-[12px_12px_44px] box-border [transform:rotate(-7deg)] shadow-[0_18px_30px_-14px_rgba(31,42,68,.45)]">
          <div className="w-[100%] h-[100%] bg-[#7cb7f0] flex items-center justify-center font-display text-[110px] text-[#fff]">
            P
          </div>
          <div className="absolute left-[0] right-[0] bottom-[8px] text-center font-hand text-[26px]">
            priya
          </div>
          <div className="absolute left-[66px] -top-[14px] w-[70px] h-[26px] bg-[rgba(253,224,71,.75)] [transform:rotate(4deg)]"></div>
        </div>
        <div className="absolute right-[52px] top-[186px] w-[190px] h-[220px] bg-[#fff] p-[12px_12px_44px] box-border [transform:rotate(6deg)] shadow-[0_18px_30px_-14px_rgba(31,42,68,.45)]">
          <div className="w-[100%] h-[100%] bg-[#f08bb0] flex items-center justify-center font-display text-[110px] text-[#fff]">
            R
          </div>
          <div className="absolute left-[0] right-[0] bottom-[8px] text-center font-hand text-[26px]">
            rohan
          </div>
          <div className="absolute left-[60px] -top-[14px] w-[70px] h-[26px] bg-[rgba(167,243,208,.8)] [transform:rotate(-5deg)]"></div>
        </div>
        <svg
          className="absolute left-[236px] top-[300px]"
          width="70"
          height="64"
          viewBox="0 0 24 22"
          aria-hidden="true"
        >
          <path
            d="M12 20s-7.5-4.6-9.6-9.2C.9 7.4 3 3.5 6.9 3.5c2.1 0 3.9 1.2 5.1 3 1.2-1.8 3-3 5.1-3 3.9 0 6 3.9 4.5 7.3C19.5 15.4 12 20 12 20z"
            fill="#e5486f"
          />
        </svg>

        <svg
          className="absolute left-[30px] top-[420px]"
          width="60"
          height="60"
          viewBox="0 0 60 60"
          aria-hidden="true"
        >
          <path
            d="M30 8 L34 26 L52 30 L34 34 L30 52 L26 34 L8 30 L26 26 Z"
            fill="none"
            stroke="#1f2a44"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          className="absolute right-[40px] top-[470px]"
          width="64"
          height="40"
          viewBox="0 0 64 40"
          aria-hidden="true"
        >
          <path
            d="M4 30 q14 -28 28 -6 t28 -10"
            fill="none"
            stroke="#b4546b"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute left-[0] right-[0] top-[436px] text-center">
          <div className="font-display text-[200px] leading-[.9] tracking-[-.03em]">
            92
            <span className="text-[48px] tracking-[0] text-[#b4546b]">
              /100
            </span>
          </div>
          <div className="font-hand font-bold text-[64px] leading-[1] mt-[6px] text-[#e5486f]">
            ride or die
          </div>
          <div className="text-[20px] leading-[1.4] m-[14px_auto_0] max-w-[400px] text-[#3d4a66]">
            We would split the last samosa without even asking.
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
              <div className="font-extrabold">test your friendship</div>
              <div className="opacity-[.75]">toppershelf.online/fun</div>
            </div>
          </div>
          <div className="font-hand text-[28px] [transform:rotate(-4deg)] text-[#b4546b]">
            tag your person
          </div>
        </div>
      </div>
    </FitBox>
  );
}
