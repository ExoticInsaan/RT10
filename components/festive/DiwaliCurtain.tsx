"use client";

import type { CSSProperties } from "react";
import { useState, useSyncExternalStore } from "react";

// Diwali curtain opening, WEBSITE only. It plays every time the site is opened or reloaded, then removes itself.
// - The tiny script in app/layout.tsx adds class "dwc-off" to <html> before the first paint when the season is
//   over, so nobody sees a flash of it afterwards.
// - Everything animates with transform and opacity only, so it runs on the GPU and stays smooth.
// - People who prefer reduced motion never see it (see app/diwali-curtain.css).
// To remove it for good: delete this file, the @import of diwali-curtain.css in app/globals.css,
// and the curtain lines in app/layout.tsx.

// [left %, top %, delay s]
const sparkles: [number, number, number][] = [
  [12, 68, 0.2], [18, 83, 1.1], [26, 72, 2.2], [34, 89, 0.7], [41, 74, 1.8], [49, 87, 0.3], [57, 78, 2.5],
  [65, 91, 1.4], [73, 70, 0.9], [82, 84, 2], [89, 73, 0.4], [22, 54, 2.8], [77, 57, 1.6], [52, 63, 2.1],
];

const noop = () => () => {};
const isOff = () => document.documentElement.classList.contains("dwc-off");

function Lantern({ side }: { side: "left" | "right" }) {
  const gold = `dwc-gold-${side}`;
  const flame = `dwc-flame-${side}`;
  const glow = `dwc-glow-${side}`;
  return (
    <div className={`dwc-lantern dwc-lantern--${side}`}>
      <span className="dwc-lantern-cord" />
      <svg viewBox="0 0 90 150" aria-hidden="true">
        <defs>
          <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fff1a6" />
            <stop offset=".32" stopColor="#d99128" />
            <stop offset=".65" stopColor="#7f310b" />
            <stop offset="1" stopColor="#ffd76b" />
          </linearGradient>
          <radialGradient id={flame}>
            <stop stopColor="#fff8c7" />
            <stop offset=".4" stopColor="#ffbe3b" />
            <stop offset="1" stopColor="#b32608" stopOpacity="0" />
          </radialGradient>
          <filter id={glow} x="-80%" y="-60%" width="260%" height="240%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <ellipse cx="45" cy="73" rx="35" ry="42" fill={`url(#${flame})`} opacity=".55" filter={`url(#${glow})`} />
        <g fill="none" stroke={`url(#${gold})`} strokeWidth="3">
          <path d="M31 18h28l7 12H24zM20 38l25-14 25 14-5 66-20 18-20-18z" />
          <path d="M20 38h50M25 104h40M45 25v97M20 38l45 66M70 38l-45 66" />
          <path d="M34 14c0-8 22-8 22 0M34 127l11-7 11 7-11 10zM45 137v11" />
        </g>
        <path d="M45 61c10 13 8 25 0 30-8-5-10-17 0-30z" fill="#fff3a1" />
      </svg>
    </div>
  );
}

function Curtain({ side }: { side: "left" | "right" }) {
  return (
    <div className={`dwc-curtain dwc-curtain--${side}`}>
      <div className="dwc-fabric" />
    </div>
  );
}

export default function DiwaliCurtain() {
  const off = useSyncExternalStore(noop, isOff, () => false);
  const [done, setDone] = useState(false);

  if (off || done) return null;

  return (
    <div
      className="dwc-scene"
      aria-hidden="true"
      onAnimationEnd={(event) => {
        // The last animation on the scene itself is the fade-out; after it the whole thing is removed from the page.
        if (event.target === event.currentTarget && event.animationName === "dwc-fade-scene") setDone(true);
      }}
    >
      <div className="dwc-haze" />
      <div className="dwc-beam dwc-beam--left" />
      <div className="dwc-beam dwc-beam--right" />

      <Curtain side="left" />
      <Curtain side="right" />

      <Lantern side="left" />
      <Lantern side="right" />

      <div className="dwc-sparkles">
        {sparkles.map(([left, top, delay], index) => (
          <i
            key={index}
            className={index % 4 === 0 ? "dwc-sparkle dwc-sparkle--star" : "dwc-sparkle"}
            style={{ left: `${left}%`, top: `${top}%`, "--d": `${delay}s` } as CSSProperties}
          />
        ))}
      </div>

    </div>
  );
}
