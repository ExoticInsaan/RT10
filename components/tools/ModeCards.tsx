"use client";

import type { ReactNode } from "react";
import ToolIcon from "@/components/tools/ToolIcon";

/*
 * Phones and tablets: a tool with several jobs opens on a grid of cards (one per job). Tapping a card opens that job.
 * Desktop keeps the one-line switch at the top, so none of this shows on large screens (lg and up).
 */
export type ModeCard = { value: string; label: string; intro: string; tone: string; icon: ReactNode };

export function ModeIcon({ children, size = 26 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export function ModeCards({ title, cards, onPick }: { title: string; cards: ModeCard[]; onPick: (value: string) => void }) {
  return (
    <div className="lg:hidden">
      <p className="m-0 mb-3 text-sm font-semibold text-navy">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <button
            key={card.value}
            type="button"
            onClick={() => onPick(card.value)}
            className="flex min-h-[148px] cursor-pointer flex-col items-start gap-2 rounded-3xl border border-[#e8e4dd] bg-white p-4 text-left shadow-[0_10px_24px_-18px_rgba(16,42,76,.45)] transition active:translate-y-px active:bg-blue-soft"
          >
            <span className={`grid size-12 place-items-center rounded-2xl ${card.tone}`}>
              <ModeIcon>{card.icon}</ModeIcon>
            </span>
            <span className="text-base leading-tight font-extrabold text-navy">{card.label}</span>
            <span className="text-[12.5px] leading-[1.35] text-muted">{card.intro}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** The bar shown above an opened job on phones and tablets: back arrow, the job's icon and its name. */
export function ModeHeader({ card, onBack, backLabel }: { card: ModeCard; onBack: () => void; backLabel: string }) {
  return (
    <div className="flex items-center gap-3 lg:hidden">
      <button type="button" onClick={onBack} aria-label={backLabel} className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-white text-navy">
        <span className="rotate-180">
          <ToolIcon name="arrow" size={18} />
        </span>
      </button>
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${card.tone}`}>
        <ModeIcon size={22}>{card.icon}</ModeIcon>
      </span>
      <h2 className="m-0 text-lg font-extrabold text-navy">{card.label}</h2>
    </div>
  );
}
