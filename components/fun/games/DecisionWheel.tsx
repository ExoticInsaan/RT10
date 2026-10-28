"use client";

import { useState } from "react";
import Image from "next/image";
import { FitBox, GameShell, useTimers } from "@/components/fun/kit";

const COLORS = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];
const CONF = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#fff"];
const PEGS = Array.from({ length: 16 }, (_, i) => i * 22.5);
const CONFETTI = Array.from({ length: 26 }, (_, i) => {
  const a = (i / 26) * Math.PI * 2;
  const r = 120 + (i % 4) * 30;
  return { c: CONF[i % 6], dx: Math.round(Math.cos(a) * r), dy: Math.round(Math.sin(a) * r * 0.8), d: ((i % 5) * 0.03).toFixed(2) };
});

const spinBtn =
  "min-h-[58px] w-full cursor-pointer rounded-[18px] border-0 bg-[#2563eb] px-[18px] py-3.5 text-[19px] font-black tracking-[.02em] text-white shadow-[0_6px_0_#1e40af,0_14px_24px_rgba(30,64,175,.3)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_2px_0_#1e40af] disabled:cursor-default disabled:opacity-50";

export default function DecisionWheel() {
  const [opts, setOpts] = useState(["Pizza", "Biryani", "Dosa"]);
  const [draft, setDraft] = useState("");
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(-1);
  const [dur, setDur] = useState(0);
  const [tilt, setTilt] = useState(24);
  const later = useTimers();

  const n = opts.length;
  const seg = 360 / Math.max(n, 1);
  const conic = n ? "conic-gradient(" + opts.map((_, i) => `${COLORS[i % 8]} ${(i * seg).toFixed(2)}deg ${((i + 1) * seg).toFixed(2)}deg`).join(",") + ")" : "#cbd5e1";
  const fs = n > 6 ? 13 : n > 4 ? 15 : 17;
  const hasWinner = winner >= 0;

  function add() {
    const t = draft.trim();
    if (!t || n >= 8 || spinning) return;
    setOpts([...opts, t]);
    setDraft("");
    setWinner(-1);
  }
  function spin() {
    if (n < 2 || spinning) return;
    const target = Math.floor(Math.random() * n);
    const center = (target + 0.5) * seg + (Math.random() - 0.5) * seg * 0.6;
    const cur = ((rot % 360) + 360) % 360;
    const delta = ((((360 - center) - cur) % 360) + 360) % 360;
    setRot(rot + 360 * 6 + delta);
    setSpinning(true);
    setWinner(-1);
    setDur(4.2);
    setTilt(8);
    later(() => {
      setSpinning(false);
      setWinner(target);
      setTilt(24);
    }, 4300);
  }
  function remove(i: number) {
    if (spinning) return;
    setOpts(opts.filter((_, j) => j !== i));
    setWinner(-1);
  }

  const stage = (
    <FitBox width={330} height={338} max={1.2}>
      <div className="relative h-[338px] w-[330px] [perspective:900px]">
        <div
          className="absolute left-1/2 top-11 -ml-[148px] size-[296px] [transform-style:preserve-3d]"
          style={{ transform: `rotateX(${tilt}deg)`, transition: "transform .6s" }}
        >
          <div className="absolute inset-0 rounded-full bg-[#1e3a8a] shadow-[0_30px_40px_-10px_rgba(16,42,76,.45)] [transform:translateZ(-18px)]" />
          <div className="absolute inset-0 rounded-full bg-[#1e40af] [transform:translateZ(-12px)]" />
          <div className="absolute inset-0 rounded-full bg-[#2747b8] [transform:translateZ(-6px)]" />
          <div className="absolute inset-0 box-border rounded-full bg-[#102a4c] p-2.5">
            <div
              className="relative size-full rounded-full shadow-[inset_0_0_0_4px_rgba(255,255,255,.35)]"
              style={{ background: conic, transform: `rotate(${rot}deg)`, transition: `transform ${dur}s cubic-bezier(.12,.72,.12,1)` }}
            >
              {opts.map((t, i) => (
                <div key={i} className="absolute left-1/2 top-1/2 size-0" style={{ transform: `rotate(${((i + 0.5) * seg).toFixed(2)}deg)` }}>
                  <div
                    className="absolute -left-[55px] -top-[118px] w-[110px] overflow-hidden text-ellipsis whitespace-nowrap text-center font-black text-white [text-shadow:0_2px_0_rgba(16,42,76,.35)]"
                    style={{ fontSize: fs }}
                  >
                    {t}
                  </div>
                </div>
              ))}
              {hasWinner && (
                <div className="absolute left-1/2 top-1/2 size-0" style={{ transform: `rotate(${((winner + 0.5) * seg).toFixed(2)}deg)` }}>
                  <div className="absolute -left-[60px] -top-[140px] size-[120px] animate-fz-glow rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.85),rgba(255,255,255,0)_70%)]" />
                </div>
              )}
            </div>
            {PEGS.map((a) => (
              <div key={a} className="absolute left-1/2 top-1/2 -ml-[5px] -mt-[5px] size-2.5 rounded-full bg-white shadow-[0_2px_0_#94a3b8]" style={{ transform: `rotate(${a}deg) translateY(-142px)` }} />
            ))}
          </div>
          <div className="absolute left-1/2 top-1/2 -ml-8 -mt-8 flex size-16 items-center justify-center rounded-full bg-white shadow-[0_6px_0_#c7dcfb,0_10px_20px_rgba(16,42,76,.3)] [transform:translateZ(14px)]">
            <Image src="/logo-mark.png" alt="" width={40} height={40} className="size-10" />
          </div>
        </div>
        <div className={`absolute left-1/2 top-5 z-[3] -ml-5 h-14 w-10 origin-[50%_20%] ${spinning ? "animate-fz-tick" : ""}`} aria-hidden="true">
          <svg width="40" height="56" viewBox="0 0 40 56">
            <path d="M20 54 L4 18 A17 17 0 1 1 36 18 Z" fill="#f43f5e" stroke="#fff" strokeWidth="3" />
            <circle cx="20" cy="17" r="6" fill="#fff" />
          </svg>
        </div>
        {hasWinner && (
          <>
            {CONFETTI.map((c, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-[44%] h-3.5 w-[9px] animate-fz-conf rounded-sm"
                style={{ background: c.c, animationDelay: `${c.d}s`, ["--dx" as string]: `${c.dx}px`, ["--dy" as string]: `${c.dy}px` }}
              />
            ))}
            <div className="absolute -bottom-1 left-1/2 z-[4] animate-fz-banner whitespace-nowrap rounded-[18px] bg-[#102a4c] px-[18px] py-2.5 text-center text-white shadow-[0_10px_24px_rgba(16,42,76,.35)]">
              <div className="text-[11px] font-extrabold tracking-[.14em] text-[#93c5fd]">THE WHEEL HAS SPOKEN</div>
              <div className="font-display text-[28px] leading-[1.1]">{opts[winner]}</div>
            </div>
          </>
        )}
      </div>
    </FitBox>
  );

  const controls = (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor="wheel-opt" className="text-sm font-bold text-[#3d5a80]">Your options ({n}/8)</label>
        <div className="flex gap-2">
          <input
            id="wheel-opt"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add an option"
            maxLength={18}
            autoComplete="off"
            className="box-border min-w-0 flex-1 rounded-[14px] border-2 border-[#c7dcfb] bg-white px-3.5 py-[13px] text-base font-medium text-[#102a4c] outline-none placeholder:text-[#8aa3c4] focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,.15)]"
          />
          <button
            type="button"
            onClick={add}
            disabled={!draft.trim() || n >= 8 || spinning}
            className="min-h-[50px] cursor-pointer rounded-[14px] border-0 bg-[#102a4c] px-4 text-[15px] font-extrabold text-white shadow-[0_4px_0_#050f1f] active:translate-y-[3px] active:shadow-[0_1px_0_#050f1f] disabled:cursor-default disabled:opacity-45"
          >
            Add
          </button>
        </div>
        <div className="flex min-h-[38px] flex-wrap gap-2">
          {opts.map((t, i) => (
            <span key={i} className="inline-flex max-w-full items-center gap-1 rounded-full bg-white py-1 pl-3 pr-1 text-sm font-bold text-[#102a4c] shadow-[0_3px_0_#c7dcfb]">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: COLORS[i % 8] }} />
              <span className="min-w-0 truncate">{t}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={spinning}
                aria-label={`Remove ${t}`}
                className="flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-[#eef4ff] p-0 text-[#1e40af] hover:bg-[#dbe7fe] disabled:cursor-default"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </span>
          ))}
        </div>
      </div>
      <button type="button" className={spinBtn} onClick={spin} disabled={n < 2 || spinning}>
        {spinning ? "Spinning…" : n < 2 ? "Add at least 2 options" : hasWinner ? "Spin again" : "Spin"}
      </button>
    </>
  );

  return (
    <GameShell
      gradient="linear-gradient(150deg,#2563eb 0%,#0891b2 55%,#10b981 100%)"
      icon="/fun-zone/decision-wheel.webp"
      iconBg="#cfe0fe"
      title="Decision Wheel"
      subtitle="Can't choose? Let the wheel decide."
      status="SOLO"
      stickerShadow="rgba(8,40,60,.6)"
      panelClass="bg-[#e9f4fc] px-5 text-[#102a4c] sm:px-6"
      rootClass="bg-[#e9f4fc]"
      stage={stage}
      controls={controls}
    />
  );
}
