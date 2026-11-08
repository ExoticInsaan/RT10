"use client";

import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";

// Diwali decoration for the WEBSITE only (the Android app never imports this file).
// It switches itself off after the date below, so there is nothing to remove later.
// To remove it for good: delete this folder, app/diwali.css, and the two lines in app/layout.tsx.
const SEASON_ENDS = new Date("2026-11-16T00:00:00+05:30").getTime();
const CLOSED_KEY = "toppershelf-diwali-banner-closed";
const EVENT = "toppershelf:diwali";

const inSeason = () => Date.now() < SEASON_ENDS;

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function bannerOpen() {
  try {
    return inSeason() && localStorage.getItem(CLOSED_KEY) !== "1";
  } catch {
    return inSeason();
  }
}

// The server and first paint see "off", then the decoration fades in, so there is no hydration mismatch.
const useSeason = () => useSyncExternalStore(() => () => {}, inSeason, () => false);

const bulbColors = ["#f59e0b", "#f97355", "#fb7185", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa"];

function Lantern({ id, className }: { id: string; className: string }) {
  return (
    <svg className={`dw-lantern ${className}`} viewBox="0 0 50 90" width="46" height="83" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fb923c" />
          <stop offset="1" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      <path d="M25 0v14" stroke="#b45309" strokeWidth="2" />
      <path d="M17 14h16l3 6H14z" fill="#b45309" />
      <path d="M14 20h22c4 8 4 28 0 36H14c-4-8-4-28 0-36z" fill={`url(#${id})`} />
      <ellipse className="dw-glow" cx="25" cy="38" rx="7" ry="12" fill="#fde68a" />
      <path d="M25 20v36M19 20c-3 12-3 24 0 36M31 20c3 12 3 24 0 36" stroke="#92400e" strokeOpacity=".45" fill="none" />
      <path d="M16 56h18l-2 5H18z" fill="#b45309" />
      <path d="M25 61v12" stroke="#f59e0b" strokeWidth="2" />
      <path d="M21 73h8l-1 12h-6z" fill="#f59e0b" />
    </svg>
  );
}

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

/** A slim greeting above the header. Can be closed, and stays closed. */
export function DiwaliBanner() {
  const open = useSyncExternalStore(subscribe, bannerOpen, () => false);
  if (!open) return null;
  return (
    <div className="dw-banner" role="region" aria-label="Diwali greeting">
      <span className="dw-banner-text">
        <span className="dw-bounce" aria-hidden="true">🪔</span>
        <span>
          Happy Diwali from TopperShelf!<span className="hidden sm:inline"> May your days be bright and your marks brighter.</span>
        </span>
        <span className="dw-bounce dw-late" aria-hidden="true">✨</span>
      </span>
      <button
        type="button"
        aria-label="Close the Diwali message"
        className="dw-close"
        onClick={() => {
          try {
            localStorage.setItem(CLOSED_KEY, "1");
          } catch {
            /* storage blocked: it will show again next visit */
          }
          window.dispatchEvent(new Event(EVENT));
        }}
      >
        ×
      </button>
    </div>
  );
}

/** Twinkling lights hanging under the header, swinging lanterns, a flickering diya and floating embers. */
export function DiwaliLights() {
  const on = useSeason();
  if (!on) return null;
  return (
    <>
      <div className="dw-lights" aria-hidden="true">
        <div className="dw-string">
          {Array.from({ length: 26 }, (_, i) => (
            <svg key={i} className="dw-unit" viewBox="0 0 110 44" aria-hidden="true" style={{ color: bulbColors[i % bulbColors.length], "--d": `${((i * 37) % 240) / 100}s` } as CSSProperties}>
              <path d="M0 2Q55 30 110 2" fill="none" stroke="#3b2a1a" strokeOpacity=".5" strokeWidth="1.5" />
              <path d="M55 16v5" stroke="#3b2a1a" strokeOpacity=".6" strokeWidth="1.5" />
              <ellipse className="dw-bulb" cx="55" cy="28" rx="5" ry="7" fill="currentColor" />
            </svg>
          ))}
        </div>
        <Lantern id="dw-l1" className="dw-left" />
        <Lantern id="dw-l2" className="dw-right" />
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
