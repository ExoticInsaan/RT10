// The four Fun Zone tools. Each one turns what the person typed into a result card.
// Results are deterministic: the same input and "salt" always give the same card, so a share link rebuilds the exact result.

export type FunResult = {
  kicker: string; // small label above the big number
  big: string; // the big number or score
  title: string; // the punchline word(s)
  message: string; // one or two witty sentences
  subject?: string; // who or what it is about (shown small under the kicker)
};

export type FunConfig = {
  heading: string;
  intro: string;
  label: string;
  placeholder: string;
  cta: string;
  multiline?: boolean;
  maxLength: number;
  /** "day" = a new result every day (the salt in the link is the day number). */
  salt?: "none" | "day";
  /** Show a "Roll again" button on the share page. */
  reroll?: boolean;
};

export const funConfig: Record<string, FunConfig> = {
  "how-cooked": {
    heading: "Ready for the truth?",
    intro: "Enter a name and our extremely advanced, absolutely questionable algorithm will do the rest.",
    label: "Your name",
    placeholder: "Type your name",
    cta: "Reveal my result",
    maxLength: 40,
  },
  "vibe-check": {
    heading: "Check today's vibe.",
    intro: "Enter a name for a completely unbiased reading of today's energy.",
    label: "Your name",
    placeholder: "Type your name",
    cta: "Check the vibe",
    maxLength: 40,
    salt: "day",
  },
};

export const isFunTool = (id: string) => id in funConfig;

/** Tidies what the person typed: one line of text, no stray spaces, limited length. */
export function cleanInput(raw: string | null | undefined, maxLength: number) {
  return (raw ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(list: T[], rnd: () => number) => list[Math.floor(rnd() * list.length)];

const cooked: [number, string, string[]][] = [
  [20, "RAW.", ["Barely warmed up. Suspiciously calm for a person with deadlines.", "Enjoy this peace. It is rare and it will not last."]],
  [40, "LIGHTLY TOASTED.", ["A little crispy at the edges, but nothing a good night's sleep cannot fix.", "Still in control. Mostly. Do not check the calendar."]],
  [60, "SIZZLING.", ["You are on your way. The smell of panic is faint but present.", "Medium heat, high potential. Start before it gets worse."]],
  [80, "COOKED.", ["Well done. You have almost reached your final form.", "Fully cooked, still standing. That counts for something."]],
  [101, "FULLY CHARRED.", ["Call it. Frame the deadline. Order snacks and begin anyway.", "Nothing left to lose, which is a very powerful place to start from."]],
];

const vibes: [number, string, string[]][] = [
  [25, "LOW BATTERY MODE.", ["Run on snacks and soft music. Cancel what you can.", "Today asks for gentle, not heroic."]],
  [50, "QUIETLY OK.", ["Not loud, not bad. A solid, slightly beige kind of day.", "Steady as a chai that went lukewarm. Still drinkable."]],
  [75, "GOOD ENERGY.", ["Things are lining up. Do the hard thing before lunch.", "Strong signals. Say yes to one small adventure."]],
  [101, "MAIN CHARACTER.", ["The universe has handed you the spotlight. Please do not waste the entrance.", "Peak energy. Text the person you were thinking of."]],
];

export function runFunTool(id: string, input: string, salt: number): FunResult | null {
  const rnd = random(hash(`${id}|${input.toLowerCase()}|${salt}`));
  switch (id) {
    case "how-cooked": {
      const pct = Math.floor(rnd() * 101);
      const [, title, messages] = cooked.find(([max]) => pct < max)!;
      return { kicker: "Official diagnosis", big: `${pct}%`, title, message: pick(messages, rnd), subject: input };
    }
    case "vibe-check": {
      const pct = Math.floor(rnd() * 101);
      const [, title, messages] = vibes.find(([max]) => pct < max)!;
      return { kicker: "Today's vibe reading", big: `${pct}%`, title, message: pick(messages, rnd), subject: input };
    }
    default:
      return null;
  }
}

/** Reads the share link values (?n=...&s=...) for a fun tool. Returns null when the tool is not a fun tool or the input is empty. */
export function parseShare(id: string, name: string | null | undefined, salt: string | null | undefined) {
  const config = funConfig[id];
  if (!config) return null;
  const input = cleanInput(name, config.maxLength);
  if (!input) return null;
  const parsed = Number.parseInt(salt ?? "0", 10);
  const s = Number.isFinite(parsed) && parsed >= 0 ? Math.min(parsed, 1_000_000_000) : 0;
  const result = runFunTool(id, input, s);
  return result ? { input, salt: s, result } : null;
}

export const shareQuery = (input: string, salt: number) => `n=${encodeURIComponent(input)}&s=${salt}`;
