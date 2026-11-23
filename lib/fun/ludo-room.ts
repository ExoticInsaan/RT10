// Ludo Rush rooms: who sits where before and during a game. No network and no React here, so it can be tested on its own.
// The host keeps the real state and runs these functions. Everyone else only receives the result.

import { COLORS, MAX_PLAYERS, MIN_PLAYERS, botPick, cleanName, current, move, newGame, roll, rollDie, type Color, type GameState } from "./ludo";

export { CODE_LENGTH, cleanCode, newRoomCode } from "./memory-match";

export type Member = { id: string; name: string; online: boolean };
export type RoomPhase = "lobby" | "play" | "done";

/** What everyone in the room sees. `seats` only has the colours somebody took, so empty colours stay out of the game. */
export type RoomState = {
  v: number;
  phase: RoomPhase;
  hostId: string;
  seats: Partial<Record<Color, Member>>;
  game: GameState | null;
};

/** The order a newcomer is given a colour: the second person lands opposite the host, so a 2 player board is balanced. */
const JOIN_ORDER: Color[] = ["R", "Y", "G", "B"];

export function lobbyState(hostId: string, hostName: string): RoomState {
  return { v: 0, phase: "lobby", hostId, seats: { R: { id: hostId, name: cleanName(hostName) || "Host", online: true } }, game: null };
}

export const members = (s: RoomState) => COLORS.flatMap((c) => (s.seats[c] ? [{ color: c, ...s.seats[c]! }] : []));
export const seatOf = (s: RoomState, id: string): Color | null => COLORS.find((c) => s.seats[c]?.id === id) ?? null;
export const seated = (s: RoomState) => members(s).length;
export const isFull = (s: RoomState) => seated(s) >= MAX_PLAYERS;
/** The host can start with 2 to 4 people who are still connected. */
export const canStart = (s: RoomState) => s.phase === "lobby" && members(s).filter((m) => m.online).length >= MIN_PLAYERS;

function withSeats(s: RoomState, seats: RoomState["seats"]): RoomState {
  return { ...s, v: s.v + 1, seats };
}

/** A guest knocks. They get the first free colour, or keep the one they have (a refresh). Null when the room is full or already playing. */
export function joinRoom(s: RoomState, id: string, name: string): RoomState | null {
  const mine = seatOf(s, id);
  if (mine) return s.seats[mine]!.online ? s : withSeats(s, { ...s.seats, [mine]: { ...s.seats[mine]!, online: true } });
  if (s.phase !== "lobby") return null;
  const free = JOIN_ORDER.find((c) => !s.seats[c]);
  if (!free) return null;
  return withSeats(s, { ...s.seats, [free]: { id, name: cleanName(name) || "Player", online: true } });
}

/** Someone picks another colour. Only in the lobby, only a free colour. */
export function takeColor(s: RoomState, id: string, color: Color): RoomState | null {
  const from = seatOf(s, id);
  if (s.phase !== "lobby" || !from || !COLORS.includes(color) || s.seats[color]) return null;
  const seats = { ...s.seats };
  seats[color] = seats[from];
  delete seats[from];
  return withSeats(s, seats);
}

/** Someone leaves on purpose. The host cannot leave this way (the room closes instead). */
export function leaveRoom(s: RoomState, id: string): RoomState {
  const from = seatOf(s, id);
  if (!from || id === s.hostId) return s;
  const seats = { ...s.seats };
  if (s.phase === "lobby") delete seats[from];
  else seats[from] = { ...seats[from]!, online: false };
  return withSeats(s, seats);
}

/** Keeps seats in step with who is connected. In the lobby, people who are gone lose their seat. In a game they keep it. */
export function syncPresence(s: RoomState, here: (id: string) => boolean): RoomState {
  const seats: RoomState["seats"] = {};
  for (const c of COLORS) {
    const m = s.seats[c];
    if (!m) continue;
    const online = m.id === s.hostId || here(m.id);
    if (!online && s.phase === "lobby") continue;
    seats[c] = m.online === online ? m : { ...m, online };
  }
  return withSeats(s, seats);
}

/** Host only: deals everyone in with the colour they picked. Colours nobody took are not in the game. */
export function beginGame(s: RoomState): RoomState | null {
  if (!canStart(s)) return null;
  const game = newGame(members(s).filter((m) => m.online).map((m) => ({ color: m.color, name: m.name, kind: "human" as const, id: m.id })));
  return game ? { ...s, v: s.v + 1, phase: "play", game } : null;
}

/* ---------- playing: dice, moves and turns ---------- */

/** How long the host waits before it plays a step by itself, so everyone can see the dice and the move. */
export const AUTO_MS = { roll: 1000, move: 1100, single: 750 } as const;

const withGame = (s: RoomState, game: GameState): RoomState => ({ ...s, v: s.v + 1, game, phase: game.phase === "done" ? "done" : "play" });

/**
 * The colour `id` may play right now, or null. A colour with an id belongs to that person only.
 * A colour with no id is a person sharing a phone (pass and play), so whoever holds the phone plays it.
 */
export function canAct(s: RoomState, id: string | null): Color | null {
  const g = s.game;
  if (s.phase !== "play" || !g) return null;
  const p = current(g);
  if (!p || p.kind !== "human") return null;
  return p.id === null || p.id === id ? p.color : null;
}

/** The player whose colour it is rolls. The host picks the number, so nobody can choose their own roll. */
export function actRoll(s: RoomState, id: string | null, random: () => number = Math.random): RoomState | null {
  if (!canAct(s, id) || !s.game) return null;
  const g = roll(s.game, rollDie(random));
  return g ? withGame(s, g) : null;
}

/** The player whose colour it is moves token `i`. */
export function actMove(s: RoomState, id: string | null, i: number): RoomState | null {
  if (!canAct(s, id) || !s.game) return null;
  const g = move(s.game, i);
  return g ? withGame(s, g) : null;
}

/** True when the computer should play this turn: a computer colour, or a person who has gone offline (they get the colour back when they return). */
export function isAutoTurn(s: RoomState) {
  const g = s.game;
  if (s.phase !== "play" || !g) return false;
  const p = current(g);
  if (!p) return false;
  return p.kind === "bot" || s.seats[p.color]?.online === false;
}

/** What the host should do by itself next, and how long to wait first. Null when it is waiting for a person. */
export function autoPending(s: RoomState): { kind: "roll" | "move"; ms: number } | null {
  const g = s.game;
  if (s.phase !== "play" || !g) return null;
  if (isAutoTurn(s)) return g.step === "roll" ? { kind: "roll", ms: AUTO_MS.roll } : { kind: "move", ms: AUTO_MS.move };
  // A person with only one possible move does not need to tap: it is played for them.
  return g.step === "pick" && g.movable.length === 1 ? { kind: "move", ms: AUTO_MS.single } : null;
}

/** Plays the pending automatic step. */
export function autoStep(s: RoomState, random: () => number = Math.random): RoomState | null {
  const g = s.game;
  const todo = autoPending(s);
  if (!g || !todo) return null;
  const next = todo.kind === "roll" ? roll(g, rollDie(random)) : move(g, botPick(g));
  return next ? withGame(s, next) : null;
}

/** Host only: after a finished game, back to the lobby with the same people and colours. */
export function backToLobby(s: RoomState): RoomState | null {
  if (s.phase !== "done") return null;
  const seats: RoomState["seats"] = {};
  for (const c of COLORS) {
    const m = s.seats[c];
    if (m && m.online) seats[c] = m;
  }
  return { ...s, v: s.v + 1, phase: "lobby", seats, game: null };
}
