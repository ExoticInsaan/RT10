// Memory Match: the game rules. No network and no React here, so the rules can be tested on their own.
// One player (the host) keeps the real card order and runs these rules; everyone else only receives what is face up.

export const MAX_PLAYERS = 4;
export const SIZES = [12, 16, 24] as const;
export type Size = (typeof SIZES)[number];
export const MISMATCH_MS = 1100;

/** Eight study and campus flavoured pictures per pair. 12 are enough for the biggest board (24 cards). */
export const SYMBOLS = ["📚", "✏️", "🧪", "🔬", "🧠", "💡", "🎓", "📐", "🩺", "💊", "🌱", "☕"];

/** Room codes skip look-alike characters (0/O, 1/I/L) so they are easy to read out loud. */
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 5;

export function newRoomCode(random: () => number = Math.random) {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_CHARS[Math.floor(random() * CODE_CHARS.length)];
  return code;
}

/** Tidies what someone typed as a room code: capitals, only allowed characters, right length. */
export function cleanCode(raw: string) {
  return raw.toUpperCase().replace(new RegExp(`[^${CODE_CHARS}]`, "g"), "").slice(0, CODE_LENGTH);
}

export const cleanName = (raw: string) => raw.replace(/\s+/g, " ").trim().slice(0, 16);

export type Phase = "lobby" | "play" | "done";

export type Player = { id: string; name: string; score: number; online: boolean; ready: boolean };

/** What everyone in the room sees. `faces[i]` is the picture on card i, or null while it is face down. */
export type GameState = {
  v: number;
  phase: Phase;
  size: Size;
  round: number;
  hostId: string;
  players: Player[];
  turn: number; // index in players; -1 outside a game
  faces: (number | null)[];
  up: number[]; // face-up cards that have not been matched yet (0, 1 or 2)
  owner: number[]; // index of the player who matched card i, or -1
  busy: boolean; // two different cards are showing and about to flip back
};

export function lobbyState(hostId: string, hostName: string, size: Size = 16): GameState {
  return {
    v: 0,
    phase: "lobby",
    size,
    round: 0,
    hostId,
    players: [{ id: hostId, name: cleanName(hostName) || "Host", score: 0, online: true, ready: false }],
    turn: -1,
    faces: Array(size).fill(null),
    up: [],
    owner: Array(size).fill(-1),
    busy: false,
  };
}

/** Shuffled deck: every picture appears exactly twice. The numbers point into SYMBOLS. */
export function makeDeck(size: Size, random: () => number = Math.random) {
  const pool = SYMBOLS.map((_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const deck = pool.slice(0, size / 2).flatMap((s) => [s, s]);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** Index of the next player who is still in the room after `from` (stays on `from` when nobody else is). */
export function nextTurn(players: Player[], from: number) {
  for (let step = 1; step <= players.length; step++) {
    const i = (from + step) % players.length;
    if (players[i].online) return i;
  }
  return from;
}

/** Starts (or restarts) a game with the people who are still here. The first player rotates each round. */
export function startGame(s: GameState, deck: number[], size: Size = s.size): GameState {
  const players = s.players.filter((p) => p.online).map((p) => ({ ...p, score: 0, ready: false }));
  const round = s.phase === "lobby" ? 0 : s.round + 1;
  return {
    ...s,
    v: s.v + 1,
    phase: "play",
    size,
    round,
    players,
    turn: round % players.length,
    faces: Array(deck.length).fill(null),
    up: [],
    owner: Array(deck.length).fill(-1),
    busy: false,
  };
}

/** A player turns card `index`. Returns the new state, or null when the move is not allowed right now. */
export function flipCard(s: GameState, deck: number[], playerId: string, index: number): GameState | null {
  if (s.phase !== "play" || s.busy) return null;
  if (s.players[s.turn]?.id !== playerId) return null;
  if (!Number.isInteger(index) || index < 0 || index >= deck.length) return null;
  if (s.owner[index] !== -1 || s.up.includes(index)) return null;

  const faces = s.faces.slice();
  faces[index] = deck[index];
  const up = [...s.up, index];
  const next: GameState = { ...s, v: s.v + 1, faces, up };
  if (up.length < 2) return next;

  const [a, b] = up;
  if (deck[a] !== deck[b]) return { ...next, busy: true }; // the host flips them back after a short look

  const owner = s.owner.slice();
  owner[a] = owner[b] = s.turn;
  const players = s.players.map((p, i) => (i === s.turn ? { ...p, score: p.score + 1 } : p));
  const finished = owner.every((o) => o !== -1);
  // A match earns a point and the same player goes again.
  return { ...next, owner, players, up: [], phase: finished ? "done" : "play", turn: finished ? -1 : s.turn };
}

/** After the short look at a mismatch: turn both cards back over and pass the turn. */
export function resolveMismatch(s: GameState): GameState {
  if (!s.busy) return s;
  const faces = s.faces.slice();
  s.up.forEach((i) => (faces[i] = null));
  return { ...s, v: s.v + 1, faces, up: [], busy: false, turn: nextTurn(s.players, s.turn) };
}

/** The highest scorers (more than one means a tie). Empty outside a finished game. */
export function winners(s: GameState) {
  if (s.phase !== "done") return [];
  const best = Math.max(...s.players.map((p) => p.score));
  return s.players.filter((p) => p.score === best);
}
