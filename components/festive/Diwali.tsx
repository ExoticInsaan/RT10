"use client";

import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";
import { DIWALI_SEASON_ENDS } from "@/components/festive/season";

// Diwali decoration for the WEBSITE only (the Android app never imports this file).
// It switches itself off after the date below, so there is nothing to remove later.
// The string lights and the row of diyas are photographs (public/diwali). The banner, the corner diya and the
// embers are the only drawn parts.
// To remove it for good: delete this folder, public/diwali and app/diwali.css, then remove the @import in
// app/globals.css and the three Diwali lines in app/layout.tsx.
const SEASON_ENDS = DIWALI_SEASON_ENDS;

const inSeason = () => Date.now() < SEASON_ENDS;

// The server and first paint see "off", then the decoration fades in, so there is no hydration mismatch.
const useSeason = () => useSyncExternalStore(() => () => {}, inSeason, () => false);

function Diya() {
  return (
    <svg className="dw-diya" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
      <defs>
        <linearGradient id="dw-bowl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f97316" />
          <stop offset="1" stopColor="#9a3412" />
        </linearGradient>
        <radialGradient id="dw-halo">
          <stop offset="0" stopColor="#fbbf24" stopOpacity=".55" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="dw-halo" cx="32" cy="26" r="26" fill="url(#dw-halo)" />
      <path d="M6 36c0 14 12 22 26 22s26-8 26-22z" fill="url(#dw-bowl)" />
      <ellipse cx="32" cy="36" rx="26" ry="5" fill="#b45309" />
      <ellipse cx="32" cy="35" rx="20" ry="3" fill="#7c2d12" />
      <g className="dw-flame">
        <path d="M32 8c6 8 9 13 9 19a9 9 0 0 1-18 0c0-6 3-11 9-19z" fill="#fbbf24" />
        <path d="M32 18c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z" fill="#fff7ed" />
      </g>
    </svg>
  );
}

/** A slim greeting above the header. No close button: it shows for the whole season, through 15 Nov (IST). */
export function DiwaliBanner() {
  const on = useSeason();
  if (!on) return null;
  return (
    <div className="dw-banner" role="region" aria-label="Diwali greeting">
      <span className="dw-banner-text">
        <span className="dw-bounce" aria-hidden="true">🪔</span>
        <span>
          Happy Diwali from TopperShelf!<span className="hidden sm:inline"> May your days be bright and your marks brighter.</span>
        </span>
        <span className="dw-bounce dw-late" aria-hidden="true">✨</span>
      </span>
    </div>
  );
}

/** Real string lights under the header (warm flicker, gentle sway), floating embers and a flickering diya. */
export function DiwaliLights() {
  const on = useSeason();
  if (!on) return null;
  return (
    <>
      <div className="dw-lights" aria-hidden="true">
        <div className="dw-strand">
          {/* The same photograph, brightened and masked to different stripes, so the bulbs flicker one group at a time. */}
          <div className="dw-shine dw-shine-a" />
          <div className="dw-shine dw-shine-b" />
        </div>
      </div>
      <div className="dw-embers" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <i
            key={i}
            style={{
              left: `${(i * 7.3 + 4) % 98}%`,
              "--s": `${3 + (i % 3) * 1.5}px`,
              "--t": `${9 + (i % 5) * 2.2}s`,
              "--d": `${-(i * 1.7)}s`,
              "--x": `${(i % 2 ? 1 : -1) * (14 + (i % 4) * 9)}px`,
            } as CSSProperties}
          />
        ))}
      </div>
      <div className="dw-diya-wrap" aria-hidden="true">
        <Diya />
      </div>
    </>
  );
}

/** "Shubh Deepavali" above a row of real lit diyas, just above the footer. */
export function DiwaliBand() {
  const on = useSeason();
  if (!on) return null;
  return (
    <section className="dw-band" aria-label="Shubh Deepavali">
      <p className="dw-band-title">Shubh Deepavali</p>
      <div className="dw-row" aria-hidden="true">
        <div className="dw-row-photo" />
        {/* The flames of the same photograph, brightened and breathing, give them a natural flicker. */}
        <div className="dw-row-photo dw-row-flame dw-row-flame-a" />
        <div className="dw-row-photo dw-row-flame dw-row-flame-b" />
      </div>
    </section>
  );
}
