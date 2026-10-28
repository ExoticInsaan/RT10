"use client";

import Image from "next/image";
import { FitBox, hand } from "@/components/fun/kit";

/** 9:16 story card (drawn at 540x960, exported at 1080x1920). Scales to fit any screen. */
export default function CardSapling() {
  return (
    <FitBox width={540} height={960} max={1} className="mx-auto max-w-[540px]">
      <div
        className={`${hand.variable} w-[540px] h-[960px] relative overflow-hidden bg-[#e8eee0] text-[#1f3a28]`}
      >
        <div className="absolute inset-0 [background:radial-gradient(circle_at_1px_1px,rgba(31,58,40,.07)_1px,transparent_1.5px)_0_0/6px_6px]"></div>

        <div className="absolute left-[44px] right-[44px] top-[104px] flex justify-between text-[14px] font-extrabold tracking-[.2em] text-[#4d7a58]">
          <span>GARDEN JOURNAL</span>
          <span>NO. 247</span>
        </div>

        <div className="absolute left-[70px] right-[70px] top-[146px] h-[420px] rounded-[200px_200px_24px_24px] overflow-hidden bg-[#cfe6ef] [border:6px_solid_#fff] shadow-[0_24px_40px_-20px_rgba(31,58,40,.45)]">
          <div className="absolute right-[40px] top-[56px] w-[54px] h-[54px] rounded-full bg-[#fde68a]"></div>
          <svg
            className="absolute left-[0] top-[0]"
            width="388"
            height="408"
            viewBox="0 0 300 316"
            aria-hidden="true"
          >
            <ellipse cx="60" cy="270" rx="120" ry="40" fill="#bfe3b4" />
            <ellipse cx="250" cy="275" rx="120" ry="44" fill="#a7d8a0" />
            <g transform="translate(44 252) scale(.32)">
              <path
                d="M-6 0 Q-4 -60 -3 -120 L3 -120 Q4 -60 6 0 Z"
                fill="#6b3d17"
              />
              <circle cx="0" cy="-130" r="44" fill="#3f8f4a" />
              <circle cx="-30" cy="-112" r="30" fill="#5fae5e" />
              <circle cx="30" cy="-112" r="30" fill="#5fae5e" />
              <circle cx="-14" cy="-120" r="6" fill="#ef4444" />
              <circle cx="16" cy="-140" r="6" fill="#ef4444" />
              <circle cx="24" cy="-108" r="6" fill="#ef4444" />
            </g>
            <rect x="0" y="262" width="300" height="60" fill="#8fc98a" />
            <rect x="0" y="262" width="300" height="6" fill="#a8dca2" />
            <g className="animate-fz-sway5 [transform-origin:150px_262px]">
              <path
                d="M141 262 Q144 200 146 150 L154 150 Q156 200 159 262 Z"
                fill="#7c4a1e"
              />
              <path
                d="M148 205 Q120 192 104 172"
                stroke="#7c4a1e"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M151 190 Q182 178 196 160"
                stroke="#7c4a1e"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="104" cy="168" r="30" fill="#15803d" />
              <circle cx="198" cy="156" r="30" fill="#15803d" />
              <circle cx="150" cy="128" r="58" fill="#15803d" />
              <circle cx="112" cy="142" r="40" fill="#22c55e" />
              <circle cx="190" cy="140" r="40" fill="#22c55e" />
              <circle cx="130" cy="98" r="36" fill="#22c55e" />
              <circle cx="172" cy="98" r="36" fill="#16a34a" />
              <circle cx="150" cy="80" r="30" fill="#22c55e" />
              <circle cx="124" cy="82" r="18" fill="#ffffff" opacity=".14" />
              <circle cx="120" cy="150" r="6.5" fill="#f59e0b" />
              <circle cx="118" cy="148" r="2" fill="#fff" opacity=".6" />
              <circle cx="168" cy="132" r="6.5" fill="#f59e0b" />
              <circle cx="166" cy="130" r="2" fill="#fff" opacity=".6" />
              <circle cx="140" cy="108" r="6.5" fill="#f59e0b" />
              <circle cx="138" cy="106" r="2" fill="#fff" opacity=".6" />
              <circle cx="194" cy="160" r="6.5" fill="#f59e0b" />
              <circle cx="192" cy="158" r="2" fill="#fff" opacity=".6" />
              <circle cx="96" cy="170" r="6.5" fill="#f59e0b" />
              <circle cx="94" cy="168" r="2" fill="#fff" opacity=".6" />
              <circle cx="160" cy="84" r="6.5" fill="#f59e0b" />
              <circle cx="158" cy="82" r="2" fill="#fff" opacity=".6" />
              <circle cx="182" cy="108" r="4" fill="#fef3c7" />
              <circle cx="112" cy="118" r="4" fill="#fef3c7" />
              <circle cx="150" cy="150" r="4" fill="#fef3c7" />
            </g>
            <path
              d="M100 268 l-3 -7 M100 268 l0 -9 M100 268 l3 -7 M210 270 l-3 -7 M210 270 l0 -9 M210 270 l3 -7 M40 290 l-3 -7 M40 290 l0 -9 M40 290 l3 -7"
              stroke="#5aa454"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="absolute left-[330px] top-[540px] [transform:rotate(6deg)] bg-[#fff] p-[8px_14px] rounded-[6px] shadow-[0_8px_16px_-8px_rgba(31,58,40,.4)] font-hand text-[24px] text-[#b45309]">
          mango, first fruit!
        </div>

        <div className="absolute left-[44px] right-[44px] top-[600px]">
          <div className="font-display text-[96px] leading-[.9]">
            <span className="italic">day</span> 247
          </div>
          <div className="font-display italic text-[32px] leading-[1.1] mt-[6px] text-[#4d7a58]">
            of keeping something alive.
          </div>
          <div className="flex gap-[10px] mt-[18px]">
            <span className="inline-flex items-center gap-[6px] bg-[#fff] rounded-[99px] p-[8px_14px] font-extrabold text-[15px]">
              <svg
                width="14"
                height="16"
                viewBox="0 0 18 20"
                aria-hidden="true"
              >
                <path
                  d="M9 1c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 2-7 2 1 3 3 3 5 1-2 1-6 1-9z"
                  fill="#f97316"
                />
              </svg>
              247 day streak
            </span>
            <span className="inline-flex items-center gap-[6px] bg-[#fff] rounded-[99px] p-[8px_14px] font-extrabold text-[15px]">
              2 trees in my garden
            </span>
          </div>
        </div>

        <div className="absolute left-[44px] right-[44px] bottom-[110px] flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <Image
              src="/mascot/owl-peek.webp"
              alt=""
              width={62}
              height={49}
              className="h-auto w-[62px] block"
            />
            <div className="text-[14px] leading-[1.3]">
              <div className="font-extrabold">grow a sapling</div>
              <div className="text-[#4d7a58]">toppershelf.online/fun</div>
            </div>
          </div>
          <div className="font-hand text-[28px] [transform:rotate(-4deg)] text-[#2f5d3a]">
            plant yours
          </div>
        </div>
      </div>
    </FitBox>
  );
}
