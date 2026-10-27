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
  "excuse-generator": {
    heading: "What do you need an excuse for?",
    intro: "Describe the situation. We will supply a reason nobody can fully disprove.",
    label: "The situation",
    placeholder: "e.g. missing the 8am class",
    cta: "Make my excuse",
    maxLength: 80,
    reroll: true,
  },
  "roast-my-timetable": {
    heading: "Show us the timetable.",
    intro: "Describe your day in a line or two. The roast is friendly, mostly.",
    label: "Your timetable",
    placeholder: "e.g. 6 classes, no breaks, sleep at 2am",
    cta: "Roast it",
    multiline: true,
    maxLength: 200,
    reroll: true,
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
const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const cooked: [number, string, string[]][] = [
  [20, "RAW.", ["Barely warmed up. Suspiciously calm for a person with deadlines.", "Enjoy this peace. It is rare and it will not last."]],
  [40, "LIGHTLY TOASTED.", ["A little crispy at the edges, but nothing a good night's sleep cannot fix.", "Still in control. Mostly. Do not check the calendar."]],
  [60, "SIZZLING.", ["You are on your way. The smell of panic is faint but present.", "Medium heat, high potential. Start before it gets worse."]],
  [80, "COOKED.", ["Well done. You have almost reached your final form.", "Fully cooked, still standing. That counts for something."]],
  [101, "FULLY CHARRED.", ["Call it. Frame the deadline. Order snacks and begin anyway.", "Nothing left to lose, which is a very powerful place to start from."]],
];

const excuseOpeners = [
  "I was fully on my way, but",
  "I had everything ready until",
  "Honestly, I would have made it, but",
  "I checked everything twice, and then",
  "Right when I stepped out,",
  "I swear this is true:",
  "Plans were perfect. Then",
  "I do not like to complain, but",
];
const excuseCauses = [
  "a pigeon sat on my Wi-Fi router and refused to leave",
  "my alarm decided it was Sunday",
  "the lift stopped on a floor that does not exist",
  "my phone updated itself at the worst possible moment",
  "a very confident cow blocked the entire road",
  "my charger chose today to stop believing in electricity",
  "I got stuck helping a stranger find their other slipper",
  "the auto driver took a shortcut through a wedding",
];
const excuseClosers = [
  "I am deeply sorry and slightly traumatised.",
  "It will not happen again, and if it does, it will be a different reason.",
  "I have proof, but it is also stuck.",
  "Please consider this a rare act of fate.",
];

const roastGeneral = [
  "This is not a timetable. It is a cry for help with a colour code.",
  "You scheduled everything except rest. Bold strategy.",
  "Your day has more gaps than a Wi-Fi signal in a lift, and none of them are free time.",
  "A timetable this packed deserves its own therapist.",
  "Impressive effort. The plan assumes you are a robot with unlimited battery.",
  "Somewhere, a calendar app is quietly crying for you.",
];
const roastKeywords: [RegExp, string][] = [
  [/no break|non.?stop|back.?to.?back|without break/i, "No breaks? Even your phone gets to charge."],
  [/(2|3|4)\s?am|midnight|all.?nighter|late/i, "Sleeping at that hour is not a schedule, it is a dare."],
  [/gym|workout|run/i, "Gym in the plan, but the plan has not seen the snooze button yet."],
  [/study|revision|exam/i, "Study blocks are great. Your phone is not invited."],
  [/free|nothing|empty/i, "An empty timetable is just a plan to panic later."],
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
    case "excuse-generator": {
      const believability = 40 + Math.floor(rnd() * 60);
      const message = `${pick(excuseOpeners, rnd)} ${pick(excuseCauses, rnd)}. ${pick(excuseClosers, rnd)}`;
      return {
        kicker: "Excuse believability",
        big: `${believability}%`,
        title: believability >= 75 ? "BELIEVABLE." : believability >= 55 ? "RISKY." : "BOLD.",
        message,
        subject: capitalise(input),
      };
    }
    case "roast-my-timetable": {
      const score = 1 + Math.floor(rnd() * 6);
      const match = roastKeywords.find(([pattern]) => pattern.test(input));
      return {
        kicker: "Timetable verdict",
        big: `${score}/10`,
        title: "ROASTED.",
        message: match ? match[1] : pick(roastGeneral, rnd),
      };
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
