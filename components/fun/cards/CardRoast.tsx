"use client";

import Image from "next/image";
import { FitBox, hand } from "@/components/fun/kit";

/** 9:16 story card (drawn at 540x960, exported at 1080x1920). Scales to fit any screen. */
export default function CardRoast() {
  return (
    <FitBox width={540} height={960} max={1} className="mx-auto max-w-[540px]">
      <div
        className={`${hand.variable} w-[540px] h-[960px] relative overflow-hidden bg-[#fffcf3] text-[#1c1917]`}
      >
        <div className="absolute left-[40px] right-[40px] top-[96px] flex justify-between items-center text-[#c58a00] text-[18px] font-semibold">
          <span className="flex items-center gap-[4px]">
            <svg width="14" height="22" viewBox="0 0 14 22" aria-hidden="true">
              <path
                d="M11 2 L3 11 L11 20"
                stroke="#c58a00"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Notes
          </span>
          <span className="text-[15px]">Done</span>
        </div>
        <div className="absolute left-[40px] right-[40px] top-[150px] text-center text-[14px] text-[#a8a29e]">
          28 October 2026 at 1:47 AM
        </div>

        <div className="absolute left-[40px] right-[40px] top-[190px]">
          <div className="text-[36px] font-extrabold leading-[1.1] tracking-[-.02em]">
            my timetable got roasted
          </div>
          <div className="mt-[16px] text-[18px] text-[#57534e] leading-[1.5]">
            6 classes ·{" "}
            <span className="[text-decoration:line-through]">breaks</span> ·
            coaching · sleep at 2am · “self study”
          </div>
          <div className="h-[1px] bg-[#e7e5e4] m-[22px_0]"></div>
          <div className="flex flex-col gap-[18px] text-[22px] leading-[1.45]">
            <p className="m-[0]">
              6 classes? That is not a timetable, that is a{" "}
              <span className="px-0.5 [background:linear-gradient(transparent_52%,#fde047_52%,#fde047_90%,transparent_90%)]">
                hostage situation.
              </span>
            </p>
            <p className="m-[0]">
              No breaks. Your bladder has filed a formal complaint with the
              principal.
            </p>
            <p className="m-[0]">
              “Self study” is a beautiful fiction, like unicorns and{" "}
              <span className="px-0.5 [background:linear-gradient(transparent_52%,#fde047_52%,#fde047_90%,transparent_90%)]">
                free periods.
              </span>
            </p>
          </div>
        </div>

        <div className="absolute left-[40px] right-[40px] top-[686px] bg-[#fff] [border:2px_solid_#f5e9cf] rounded-[18px] p-[14px_16px] flex items-center justify-between [transform:rotate(-1.5deg)] shadow-[0_10px_20px_-12px_rgba(120,53,15,.3)]">
          <div>
            <div className="text-[12px] font-extrabold tracking-[.16em] text-[#a16207]">
              ROAST LEVEL
            </div>
            <div className="font-display text-[34px] leading-[1] text-[#dc2626]">
              Volcanic
            </div>
          </div>
          <div
            className="flex gap-[2px]"
            role="img"
            aria-label="8 out of 10 chillies"
          >
            <svg width="18" height="24" viewBox="0 0 20 24" aria-hidden="true">
              <path
                d="M10 6c4 0 6 3 5 8-1 5-6 9-10 9 3-3 3-6 2-9-1-4 0-8 3-8z"
                fill="#e5381d"
              />
            </svg>
            <svg width="18" height="24" viewBox="0 0 20 24" aria-hidden="true">
              <path
                d="M10 6c4 0 6 3 5 8-1 5-6 9-10 9 3-3 3-6 2-9-1-4 0-8 3-8z"
                fill="#e5381d"
              />
            </svg>
            <svg width="18" height="24" viewBox="0 0 20 24" aria-hidden="true">
              <path
                d="M10 6c4 0 6 3 5 8-1 5-6 9-10 9 3-3 3-6 2-9-1-4 0-8 3-8z"
                fill="#e5381d"
              />
            </svg>
            <svg width="18" height="24" viewBox="0 0 20 24" aria-hidden="true">
              <path
                d="M10 6c4 0 6 3 5 8-1 5-6 9-10 9 3-3 3-6 2-9-1-4 0-8 3-8z"
                fill="#e5381d"
              />
            </svg>
            <svg width="18" height="24" viewBox="0 0 20 24" aria-hidden="true">
              <path
                d="M10 6c4 0 6 3 5 8-1 5-6 9-10 9 3-3 3-6 2-9-1-4 0-8 3-8z"
                fill="#e5381d"
              />
            </svg>
            <svg width="18" height="24" viewBox="0 0 20 24" aria-hidden="true">
              <path
                d="M10 6c4 0 6 3 5 8-1 5-6 9-10 9 3-3 3-6 2-9-1-4 0-8 3-8z"
                fill="#e5381d"
              />
            </svg>
            <svg width="18" height="24" viewBox="0 0 20 24" aria-hidden="true">
              <path
                d="M10 6c4 0 6 3 5 8-1 5-6 9-10 9 3-3 3-6 2-9-1-4 0-8 3-8z"
                fill="#e5381d"
              />
            </svg>
            <svg width="18" height="24" viewBox="0 0 20 24" aria-hidden="true">
              <path
                d="M10 6c4 0 6 3 5 8-1 5-6 9-10 9 3-3 3-6 2-9-1-4 0-8 3-8z"
                fill="#e5381d"
              />
            </svg>
            <svg width="18" height="24" viewBox="0 0 20 24" aria-hidden="true">
              <path
                d="M10 6c4 0 6 3 5 8-1 5-6 9-10 9 3-3 3-6 2-9-1-4 0-8 3-8z"
                fill="#ede3cf"
              />
            </svg>
            <svg width="18" height="24" viewBox="0 0 20 24" aria-hidden="true">
              <path
                d="M10 6c4 0 6 3 5 8-1 5-6 9-10 9 3-3 3-6 2-9-1-4 0-8 3-8z"
                fill="#ede3cf"
              />
            </svg>
          </div>
        </div>

        <div className="absolute left-[40px] right-[40px] bottom-[118px] flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <Image
              src="/mascot/owl-peek.webp"
              alt=""
              width={62}
              height={49}
              className="h-auto w-[62px] block"
            />
            <div className="text-[14px] leading-[1.3]">
              <div className="font-extrabold">roast my timetable</div>
              <div className="text-[#78716c]">toppershelf.online/fun</div>
            </div>
          </div>
          <div className="font-hand text-[28px] [transform:rotate(-4deg)] text-[#c2410c]">
            i felt that
          </div>
        </div>
      </div>
    </FitBox>
  );
}
