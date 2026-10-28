"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Caveat } from "next/font/google";

/* Shared building blocks for the Fun Zone games. Each game keeps its own colours; this file only holds the frame,
   the scale-to-fit box for fixed-size artwork, and small helpers. */

export const hand = Caveat({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-caveat", display: "swap" });

/** FNV-1a hash: the same text always gives the same number, so a share link rebuilds the exact result. */
export function hash(text: string) {
  let x = 2166136261;
  for (let i = 0; i < text.length; i++) {
    x ^= text.charCodeAt(i);
    x = Math.imul(x, 16777619);
  }
  return x >>> 0;
}

/** Small seeded random generator (mulberry32) for repeatable layouts. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** setTimeout calls that are cleared when the game unmounts. */
export function useTimers() {
  const ids = useRef<number[]>([]);
  useEffect(() => {
    const list = ids.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);
  return useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    ids.current.push(id);
    return id;
  }, []);
}

/** Copy text to the clipboard without throwing where the browser blocks it. */
export function copyText(text: string) {
  try {
    void navigator.clipboard?.writeText(text);
  } catch {
    /* ignore */
  }
}

/** Read and write a small JSON value in localStorage, safely (private windows can throw). */
export function loadJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
export function saveJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Shows fixed-size artwork (drawn at `width` x `height` px) scaled down to fit narrow screens and, optionally,
 * up to `max` times on wide ones. Nothing inside can overflow the page.
 */
export function FitBox({
  width,
  height,
  max = 1,
  className = "",
  children,
}: {
  width: number;
  height: number;
  max?: number;
  className?: string;
  children: ReactNode;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useIsoLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const update = () => setScale(Math.min(max, el.clientWidth / width));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, max]);
  return (
    <div ref={outer} className={`relative w-full ${className}`} style={{ height: height * scale }}>
      <div
        className="absolute left-1/2 top-0 origin-top"
        style={{ width, height, transform: `translateX(-50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

export type GameStatus = "LIVE" | "SOLO" | "FRIENDS";

const dots = "radial-gradient(circle at 1px 1px,rgba(255,255,255,.18) 1.2px,transparent 1.7px) 0 0/18px 18px";

/**
 * The game frame: the Fun Zone band (logo, status, sticker icon, title) over a rounded panel.
 * On large screens the panel turns into two columns: `stage` on the left, `controls` on the right.
 */
export function GameShell({
  gradient,
  icon,
  iconBg,
  title,
  subtitle,
  status,
  panelClass,
  rootClass = "",
  stage,
  controls,
  body,
  overlay,
  stickerShadow = "rgba(60,8,40,.6)",
}: {
  gradient: string;
  icon: string;
  iconBg: string;
  title: string;
  subtitle: string;
  status: GameStatus;
  panelClass: string;
  rootClass?: string;
  stage?: ReactNode;
  controls?: ReactNode;
  /** Raw panel children (placed by the game with `lg:col-*` / `lg:row-*` classes) instead of `stage` + `controls`. */
  body?: ReactNode;
  overlay?: ReactNode;
  stickerShadow?: string;
}) {
  const dot = status === "LIVE" ? "bg-lime-500" : status === "SOLO" ? "bg-amber-500" : "bg-pink-500";
  return (
    <div
      className={`${hand.variable} relative mx-auto flex w-full max-w-[28rem] flex-col overflow-hidden rounded-[28px] font-sans shadow-[0_24px_60px_-24px_rgba(16,42,76,.45)] sm:rounded-[36px] lg:max-w-[64rem] ${rootClass}`}
    >
      <div className="shrink-0 px-5 pb-11 pt-4 text-white lg:px-9 lg:pb-14 lg:pt-6" style={{ background: `${dots},${gradient}` }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Image src="/logo-mark-light.png" alt="" width={30} height={30} className="size-[30px] shrink-0" />
            <span className="whitespace-nowrap text-[17px] font-extrabold tracking-[-.02em]">
              Topper<span className="text-blue-200">Shelf</span>
            </span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-[11px] py-1.5 text-xs font-extrabold text-navy">
            <span className={`size-[7px] rounded-full ${dot}`} />
            <span className="max-[359px]:hidden">FUN ZONE · </span>{status}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3.5 lg:mt-6 lg:gap-5">
          <div
            className="size-[68px] shrink-0 animate-fz-wig rounded-[20px] bg-white p-1 transition-[rotate,translate] duration-200 rotate-[-7deg] hover:-translate-y-1 hover:rotate-0 hover:animate-none lg:size-[84px]"
            style={{ boxShadow: `0 14px 26px -10px ${stickerShadow}` }}
          >
            <Image
              src={icon}
              alt=""
              width={120}
              height={120}
              className="block size-full rounded-2xl object-cover"
              style={{ backgroundColor: iconBg }}
            />
          </div>
          <div className="min-w-0">
            <h2 className="m-0 font-display text-[31px] font-normal leading-[1.02] tracking-[-.01em] lg:text-[42px]">{title}</h2>
            <p className="mb-0 mt-[5px] text-sm leading-[1.35] opacity-90 lg:text-base">{subtitle}</p>
          </div>
        </div>
      </div>
      <div
        className={`relative -mt-[26px] flex flex-1 flex-col gap-3.5 rounded-t-[28px] pb-6 pt-[22px] shadow-[0_-10px_30px_-12px_rgba(60,8,40,.35)] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-10 lg:px-9 lg:pb-10 lg:pt-8 ${panelClass}`}
      >
        {body}
        {stage !== undefined && <div className="flex min-w-0 flex-col gap-3.5">{stage}</div>}
        {controls !== undefined && <div className="flex min-w-0 flex-col gap-3.5">{controls}</div>}
      </div>
      {overlay}
    </div>
  );
}

/** Small owl that peeks up from the bottom edge. */
export function OwlPeek({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <Image
      src="/mascot/owl-peek.webp"
      alt=""
      width={360}
      height={282}
      className={`block h-auto animate-fz-peek ${className}`}
      style={style}
    />
  );
}
