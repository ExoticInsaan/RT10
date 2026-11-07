/**
 * Wording that only the Android app provides (Hindi). This starts empty. The app fills it in once at startup
 * (mobile/src/main.tsx), and the website never does, so none of this text is part of the website.
 */
export type RoastResult = { lines: string[]; score: number; rows: { time: string; text: string }[]; level: string };

export type AppContent = {
  date?: { days: string[]; months: string[] };
  sapling?: { dayNames: string[] };
  excuse?: { lists: string[][]; sorry: (situation: string) => string; join: (idx: number[]) => string };
  cooked?: { tiers: { tier: string; v: string[] }[] };
  vibe?: { vibes: { n: string; l: string }[]; meters: Record<string, string> };
  roast?: { roastFor: (day: string) => RoastResult };
};

let current: AppContent = {};
export const registerAppContent = (content: AppContent) => {
  current = content;
};
export const appContent = () => current;
