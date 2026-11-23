// Ludo Rush rooms: who sits where before and during a game. No network and no React here, so it can be tested on its own.
// The host keeps the real state and runs these functions. Everyone else only receives the result.

import { COLORS, MAX_PLAYERS, MIN_PLAYERS, cleanName, newGame, type Color, type GameState } from "./ludo";

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
