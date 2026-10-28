"use client";

import type { ReactNode } from "react";

/*
 * Phones and tablets: the PDF Toolkit opens on a grid of cards (one per job). Tapping a card opens that job.
 * Desktop keeps the one-line switch at the top, so nothing here shows on large screens.
 */
type Card = { value: string; label: string; intro: string };

const art: Record<string, { tone: string; icon: ReactNode }> = {
  merge: {
    tone: "bg-blue-soft text-blue-hover",
    icon: (
      <>
        <rect x="3" y="4" width="8" height="10" rx="1.5" />
        <rect x="13" y="10" width="8" height="10" rx="1.5" />
        <path d="M7 17v2h4M17 7V5h-4" />
      </>
    ),
  },
  compress: {
    tone: "bg-emerald-50 text-emerald-600",
    icon: (
      <>
        <path d="M12 3v7M9 7l3 3 3-3" />
        <path d="M12 21v-7M9 17l3-3 3 3" />
        <path d="M4 12h16" />
      </>
    ),
  },
  "to-pdf": {
    tone: "bg-orange-50 text-orange-500",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        <circle cx="9" cy="10" r="1.8" />
        <path d="m4 18 5-4.5 3.5 3L16 13l4 4.5" />
      </>
    ),
  },
  edit: {
    tone: "bg-violet-50 text-violet",
    icon: (
      <>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <path d="M9 17.5 9.5 15l5-5 1.5 1.5-5 5z" />
      </>
    ),
  },
  split: {
    tone: "bg-rose-50 text-rose-500",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="18" rx="1.5" />
        <rect x="14" y="3" width="7" height="18" rx="1.5" />
        <path d="M12 6v2M12 11v2M12 16v2" />
      </>
    ),
  },
  "to-images": {
    tone: "bg-amber-50 text-amber-600",
    icon: (
      <>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <path d="M9 17h6M9 13h3" />
      </>
    ),
  },
};

export function ModeIcon({ id, size = 26 }: { id: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {art[id]?.icon}
    </svg>
  );
}

export default function PdfModeCards({ cards, onPick }: { cards: Card[]; onPick: (value: string) => void }) {
  return (
    <div className="lg:hidden">
      <p className="m-0 mb-3 text-sm font-semibold text-navy">What do you want to do?</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.value}
            type="button"
            onClick={() => onPick(card.value)}
            className="flex min-h-[148px] cursor-pointer flex-col items-start gap-2 rounded-3xl border border-[#e8e4dd] bg-white p-4 text-left shadow-[0_10px_24px_-18px_rgba(16,42,76,.45)] transition active:translate-y-px active:bg-blue-soft"
          >
            <span className={`grid size-12 place-items-center rounded-2xl ${art[card.value]?.tone ?? "bg-blue-soft text-blue-hover"}`}>
              <ModeIcon id={card.value} />
            </span>
            <span className="text-base leading-tight font-extrabold text-navy">{card.label}</span>
            <span className="text-[12.5px] leading-[1.35] text-muted">{card.intro}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
