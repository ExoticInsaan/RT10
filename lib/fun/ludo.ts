// Ludo Rush: the game rules. No network, no React and no screen code here, so the rules can be tested on their own.
// One device (the host, or the only phone in pass and play and vs computer) keeps the real state and runs these rules.
// Any set of 2 to 4 colours can play. Colours that are not in the game simply do not exist: no tokens, no turns.

export type Color = "R" | "G" | "Y" | "B";
/** Clockwise around the board: Red top left, Green top right, Yellow bottom right, Blue bottom left. */
export const COLORS: Color[] = ["R", "G", "Y", "B"];
export const COLOR_NAMES: Record<Color, string> = { R: "Red", G: "Green", Y: "Yellow", B: "Blue" };

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;
export const TOKENS = 4;
export const TRACK = 52; // squares on the shared loop
export const LAST_TRACK = 50; // a token leaves the loop after this many steps from its start
export const HOME = 56; // 51 to 55 are the coloured lane, 56 is home. -1 is still in the yard.

/** Where each colour enters the shared loop. */
export const START: Record<Color, number> = { R: 0, G: 13, Y: 26, B: 39 };
/** Start squares and star squares: nobody can be captured here. */
export const SAFE = new Set([0, 13, 26, 39, 8, 21, 34, 47]);

export type Kind = "human" | "bot";

/** One colour in the game. `id` is whoever controls it (a room member), or null on a shared phone and for bots. */
export type Player = { color: Color; name: string; kind: Kind; id: string | null; tokens: number[] };

export type Seat = { color: Color; name: string; kind: Kind; id?: string | null };

export type Phase = "play" | "done";
export type Step = "roll" | "pick";

/** What just happened, so the screen can animate it and play a sound. */
export type Last =
  | { kind: "roll"; color: Color; value: number }
  | { kind: "lost"; color: Color; value: number } // third six in a row
  | { kind: "nomove"; color: Color; value: number }
  | { kind: "move"; color: Color; i: number; from: number; to: number; captured: { color: Color; i: number }[]; home: boolean }
  | { kind: "win"; color: Color };

export type GameState = {
  v: number;
  phase: Phase;
  players: Player[]; // in turn order (clockwise)
  turn: number; // index in players, -1 when the game is over
  step: Step; // "roll": waiting for the dice. "pick": waiting for a token to be chosen.
  die: number | null;
  sixes: number; // sixes in a row for the player whose turn it is
  movable: number[]; // token numbers that can use the die
  winner: Color | null;
  last: Last | null;
};

export const cleanName = (raw: string) => raw.replace(/\s+/g, " ").trim().slice(0, 16);

/** Colours of the people playing, sorted into board order. */
export function sortColors(colors: Color[]) {
  return COLORS.filter((c) => colors.includes(c));
}

/** Starts a game. Only the given seats play, so 2 players means 2 colours and nobody else. */
export function newGame(seats: Seat[]): GameState | null {
  const seen = new Set<Color>();
  for (const s of seats) {
    if (!COLORS.includes(s.color) || seen.has(s.color)) return null;
    seen.add(s.color);
  }
  if (seats.length < MIN_PLAYERS || seats.length > MAX_PLAYERS) return null;
  const players: Player[] = COLORS.filter((c) => seen.has(c)).map((c) => {
    const s = seats.find((x) => x.color === c)!;
    return { color: c, name: cleanName(s.name) || COLOR_NAMES[c], kind: s.kind, id: s.kind === "human" ? (s.id ?? null) : null, tokens: Array(TOKENS).fill(-1) };
  });
  return { v: 0, phase: "play", players, turn: 0, step: "roll", die: null, sixes: 0, movable: [], winner: null, last: null };
}

/** Can a token at `pos` use a roll of `value`? Out of the yard needs a six, and home needs the exact number. */
export function canUse(pos: number, value: number) {
  return pos < 0 ? value === 6 : pos + value <= HOME;
}

/** The square on the shared loop for a token, or -1 while in the yard, on the coloured lane or home. */
export function loopSquare(color: Color, pos: number) {
  return pos >= 0 && pos <= LAST_TRACK ? (START[color] + pos) % TRACK : -1;
}

export const isHuman = (p: Player) => p.kind === "human";

/** The player whose turn it is, or undefined outside a game. */
export const current = (s: GameState) => s.players[s.turn];

/** True when the player has to choose between more than one token. With one choice the host can move it straight away. */
export const needsChoice = (s: GameState) => s.phase === "play" && s.step === "pick" && s.movable.length > 1;

export const rollDie = (random: () => number = Math.random) => 1 + Math.floor(random() * 6);

function pass(s: GameState, bonus: boolean, last: Last): GameState {
  const turn = bonus ? s.turn : (s.turn + 1) % s.players.length;
  return { ...s, v: s.v + 1, turn, step: "roll", movable: [], sixes: bonus ? s.sixes : 0, last };
}

/**
 * The current player rolls `value` (the host picks the number). Returns the new state, or null when it is not time to roll.
 * Three sixes in a row lose the turn. With no token able to move the turn passes on (a six still earns another roll).
 */
export function roll(s: GameState, value: number): GameState | null {
  if (s.phase !== "play" || s.step !== "roll" || !Number.isInteger(value) || value < 1 || value > 6) return null;
  const p = s.players[s.turn];
  const sixes = value === 6 ? s.sixes + 1 : 0; // any other number breaks the run
  const base: GameState = { ...s, die: value, sixes };
  if (sixes >= 3) return pass({ ...base, sixes: 0 }, false, { kind: "lost", color: p.color, value });
  const movable = p.tokens.map((pos, i) => (canUse(pos, value) ? i : -1)).filter((i) => i >= 0);
  if (!movable.length) return pass(base, value === 6, { kind: "nomove", color: p.color, value });
  return { ...base, v: s.v + 1, step: "pick", movable, last: { kind: "roll", color: p.color, value } };
}

/**
 * The current player moves token `i` by the rolled number. Returns the new state, or null when that token cannot move.
 * Landing on a square with other colours' tokens captures them (back to their yard), unless the square is safe.
 * A six, a capture or reaching home gives another roll. The first colour to bring all four tokens home wins.
 */
export function move(s: GameState, i: number): GameState | null {
  if (s.phase !== "play" || s.step !== "pick" || s.die === null || !s.movable.includes(i)) return null;
  const mover = s.players[s.turn];
  const from = mover.tokens[i];
  const to = from < 0 ? 0 : from + s.die;
  const square = loopSquare(mover.color, to);
  const captured: { color: Color; i: number }[] = [];

  const players = s.players.map((p) => {
    if (p.color === mover.color) {
      const tokens = p.tokens.slice();
      tokens[i] = to;
      return { ...p, tokens };
    }
    if (square < 0 || SAFE.has(square)) return p;
    const tokens = p.tokens.map((pos, j) => {
      if (loopSquare(p.color, pos) !== square) return pos;
      captured.push({ color: p.color, i: j });
      return -1;
    });
    return captured.some((c) => c.color === p.color) ? { ...p, tokens } : p;
  });

  const home = to === HOME;
  const moved: Last = { kind: "move", color: mover.color, i, from, to, captured, home };
  const next: GameState = { ...s, players };
  if (players[s.turn].tokens.every((pos) => pos === HOME)) {
    return { ...next, v: s.v + 1, phase: "done", turn: -1, step: "roll", movable: [], sixes: 0, winner: mover.color, last: { kind: "win", color: mover.color } };
  }
  return pass(next, s.die === 6 || captured.length > 0 || home, moved);
}

/** The token a computer player should move: finish first, capture next, then safe squares, otherwise the one furthest along. */
export function botPick(s: GameState): number {
  const p = s.players[s.turn];
  const die = s.die ?? 0;
  let best = s.movable[0];
  let bestScore = -1;
  for (const i of s.movable) {
    const pos = p.tokens[i];
    const target = pos < 0 ? 0 : pos + die;
    let score = pos < 0 ? 50 : pos;
    if (target === HOME) score += 80;
    const sq = loopSquare(p.color, target);
    if (sq >= 0) {
      if (SAFE.has(sq)) score += 20;
      else if (s.players.some((o) => o.color !== p.color && o.tokens.some((q) => loopSquare(o.color, q) === sq))) score += 100;
    }
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

/** How many tokens a colour has brought home. */
export const homeCount = (p: Player) => p.tokens.filter((pos) => pos === HOME).length;
