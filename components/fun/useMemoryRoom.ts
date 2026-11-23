"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  MAX_PLAYERS,
  MISMATCH_MS,
  flipCard,
  lobbyState,
  makeDeck,
  newRoomCode,
  resolveMismatch,
  startGame,
  type GameState,
  type Size,
} from "@/lib/fun/memory-match";

/*
 * Memory Match rooms. Nothing is stored: there is no table and no saved game. People in the same room code talk over a
 * Supabase Realtime "broadcast" channel, which only passes messages along while people are connected.
 * The person who made the room (the host) keeps the real card order and runs the rules. Everyone else sends their
 * taps to the host and receives what is face up. Face-down cards are never sent, so nobody can peek.
 */

export type RoomStatus = "idle" | "connecting" | "ready" | "notfound" | "closed" | "error";

type Act = { t: "flip"; id: string; i: number } | { t: "ready"; id: string } | { t: "hello"; id: string; name: string } | { t: "bye"; id: string };
type Meta = { name?: string; host?: boolean };

const FIND_TIMEOUT_MS = 10_000; // how long a guest keeps knocking before saying "no room found"
const HELLO_EVERY_MS = 1200; // a guest asks the host to let them in until the host answers
const HEARTBEAT_MS = 4000; // the host re-sends the table now and then, so a lost message heals itself
const GRACE_MS = 8000; // someone who just knocked counts as present even if their presence signal is slow
const HOST_GONE_MS = 3000; // a guest waits this long before deciding the host has really left

function myId() {
  try {
    const saved = sessionStorage.getItem("mm-id");
    if (saved) return saved;
    const fresh = crypto.randomUUID();
    sessionStorage.setItem("mm-id", fresh); // same id after a refresh, so a player gets their seat back
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

export function useMemoryRoom() {
  const [status, setStatus] = useState<RoomStatus>("idle");
  const [state, setState] = useState<GameState | null>(null);
  const [code, setCode] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [me] = useState(() => (typeof window === "undefined" ? "" : myId()));

  const channel = useRef<RealtimeChannel | null>(null);
  const hostState = useRef<GameState | null>(null);
  const deck = useRef<number[]>([]);
  const lastV = useRef(-1);
  const timers = useRef<number[]>([]);
  const gotState = useRef(false);
  const knocked = useRef<Record<string, number>>({});
  const presenceNow = useRef<() => Record<string, Meta>>(() => ({}));
  const session = useRef(0); // ignores events from a room that was already left
  const publishRef = useRef<(next: GameState) => void>(() => {});
  const syncRef = useRef<(here: Record<string, Meta>) => void>(() => {});
  const connectRef = useRef<(roomCode: string, name: string, host: boolean, size: Size, attempt?: number) => void>(() => {});

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  const teardown = useCallback(() => {
    session.current++;
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    const ch = channel.current;
    channel.current = null;
    if (ch) void createClient().removeChannel(ch);
    hostState.current = null;
    deck.current = [];
    lastV.current = -1;
    gotState.current = false;
    knocked.current = {};
  }, []);

  useEffect(() => teardown, [teardown]);

  /* ---------- host: runs the game ---------- */

  const publish = useCallback(
    (next: GameState) => {
      const wasBusy = hostState.current?.busy ?? false;
      hostState.current = next;
      setState(next);
      void channel.current?.send({ type: "broadcast", event: "state", payload: next });
      if (next.busy && !wasBusy) {
        const mine = session.current;
        later(() => {
          if (session.current !== mine || !hostState.current?.busy) return;
          publishRef.current(resolveMismatch(hostState.current));
        }, MISMATCH_MS);
      }
    },
    [later],
  );
  useEffect(() => {
    publishRef.current = publish;
  }, [publish]);

  const restart = useCallback(() => {
    const s = hostState.current;
    if (!s) return;
    deck.current = makeDeck(s.size);
    publish(startGame(s, deck.current));
  }, [publish]);

  const hostAct = useCallback(
    (act: Act) => {
      const s = hostState.current;
      if (!s) return;
      if (act.t === "bye") {
        delete knocked.current[act.id]; // they left on purpose: no grace period
        syncRef.current(presenceNow.current());
        return;
      }
      if (act.t === "hello") {
        // A guest knocking. Seat them straight away, so joining never depends on the presence signal arriving first.
        knocked.current[act.id] = Date.now();
        const open = s.phase !== "play" && s.players.length < MAX_PLAYERS;
        if (!s.players.some((p) => p.id === act.id) && open) {
          const name = (act.name ?? "Player").slice(0, 16) || "Player";
          publish({ ...s, v: s.v + 1, players: [...s.players, { id: act.id, name, score: 0, online: true, ready: false }] });
        } else {
          publish({ ...s, v: s.v + 1, players: s.players.map((p) => (p.id === act.id ? { ...p, online: true } : p)) });
        }
        return;
      }
      if (act.t === "flip") {
        const next = flipCard(s, deck.current, act.id, act.i);
        if (next) publish(next);
        return;
      }
      // Rematch vote after a finished game. Everyone still in the room ready means a new game starts.
      if (s.phase !== "done") return;
      const players = s.players.map((p) => (p.id === act.id ? { ...p, ready: true } : p));
      const next = { ...s, v: s.v + 1, players };
      if (players.filter((p) => p.online).every((p) => p.ready) && players.filter((p) => p.online).length > 1) {
        hostState.current = next;
        restart();
      } else {
        publish(next);
      }
    },
    [publish, restart],
  );

  /** Keeps the player list in step with who is connected (presence), and tells everyone. */
  const hostSync = useCallback(
    (here: Record<string, Meta>) => {
      const s = hostState.current;
      if (!s) return;
      const fresh = (id: string) => Date.now() - (knocked.current[id] ?? 0) < GRACE_MS;
      let players = s.players.map((p) => ({ ...p, online: p.id === s.hostId || p.id in here || fresh(p.id) }));
      if (s.phase === "lobby") players = players.filter((p) => p.online);
      for (const id of Object.keys(here)) delete knocked.current[id]; // once presence shows them, it decides
      for (const [id, meta] of Object.entries(here)) {
        if (players.some((p) => p.id === id) || meta.host) continue;
        if (s.phase === "play" || players.length >= MAX_PLAYERS) continue; // they see "game started" or "room full"
        players.push({ id, name: (meta.name ?? "Player").slice(0, 16) || "Player", score: 0, online: true, ready: false });
      }
      let next: GameState = { ...s, v: s.v + 1, players };
      // If the player whose turn it is has gone, pass the turn on.
      if (next.phase === "play" && !next.busy && !players[next.turn]?.online) {
        let t = next.turn;
        for (let step = 1; step <= players.length; step++) {
          const i = (next.turn + step) % players.length;
          if (players[i].online) {
            t = i;
            break;
          }
        }
        next = { ...next, turn: t };
      }
      publish(next);
    },
    [publish],
  );

  useEffect(() => {
    syncRef.current = hostSync;
  }, [hostSync]);

  /* ---------- connecting ---------- */

  const connect = useCallback(
    (roomCode: string, name: string, host: boolean, size: Size, attempt = 0) => {
      teardown();
      const mine = session.current;
      setCode(roomCode);
      setIsHost(host);
      setState(null);
      setStatus("connecting");
      if (host) {
        const first = lobbyState(me, name, size);
        hostState.current = first;
        setState(first);
      }

      const ch = createClient().channel(`mm-${roomCode}`, { config: { broadcast: { self: false, ack: false }, presence: { key: me } } });
      channel.current = ch;
      const here = () => {
        const out: Record<string, Meta> = {};
        for (const [key, metas] of Object.entries(ch.presenceState<Meta>())) out[key] = metas[0] ?? {};
        return out;
      };

      presenceNow.current = here;
      ch.on("broadcast", { event: "state" }, ({ payload }) => {
        if (host || session.current !== mine) return;
        const next = payload as GameState;
        if (next.v < lastV.current && next.hostId === hostState.current?.hostId) return; // an old message arriving late
        lastV.current = next.v;
        gotState.current = true;
        hostState.current = next;
        setState(next);
        setStatus("ready");
      });

      ch.on("broadcast", { event: "act" }, ({ payload }) => {
        if (host && session.current === mine) hostAct(payload as Act);
      });

      ch.on("presence", { event: "sync" }, () => {
        if (session.current !== mine) return;
        const people = here();
        if (host) {
          hostSync(people);
        } else if (gotState.current && !Object.values(people).some((m) => m.host)) {
          // Maybe the host is only reconnecting: look again in a few seconds before giving up.
          later(() => {
            if (session.current !== mine || Object.values(here()).some((m) => m.host)) return;
            teardown();
            setStatus("closed");
          }, HOST_GONE_MS);
        }
      });

      ch.subscribe(async (st) => {
        if (session.current !== mine) return;
        if (st === "SUBSCRIBED") {
          await ch.track({ name, host });
          if (host) {
            // If another host already uses this code, pick a new one.
            later(() => {
              if (session.current !== mine) return;
              const clash = Object.entries(here()).some(([key, m]) => m.host && key !== me);
              if (clash && attempt < 4) connectRef.current(newRoomCode(), name, true, size, attempt + 1);
              else {
                setStatus("ready");
                if (hostState.current) publish(hostState.current);
                const beat = window.setInterval(() => {
                  if (session.current !== mine) return window.clearInterval(beat);
                  hostSync(here());
                }, HEARTBEAT_MS);
                timers.current.push(beat);
              }
            }, 700);
          } else {
            // Knock on the host's door until it answers, then give up after a while.
            const knock = () => void ch.send({ type: "broadcast", event: "act", payload: { t: "hello", id: me, name } satisfies Act });
            knock();
            const again = window.setInterval(() => {
              if (session.current !== mine || gotState.current) return window.clearInterval(again);
              knock();
            }, HELLO_EVERY_MS);
            timers.current.push(again);
            later(() => {
              if (session.current !== mine || gotState.current) return;
              teardown();
              setStatus("notfound");
            }, FIND_TIMEOUT_MS);
          }
        } else if (st === "CHANNEL_ERROR" || st === "TIMED_OUT") {
          teardown();
          setStatus("error");
        }
      });
    },
    [hostAct, hostSync, later, me, publish, teardown],
  );
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  /* ---------- what the screen can do ---------- */

  const create = useCallback((name: string, size: Size) => connect(newRoomCode(), name, true, size), [connect]);
  const join = useCallback((roomCode: string, name: string) => connect(roomCode, name, false, 16), [connect]);

  const leave = useCallback(() => {
    if (!isHost) void channel.current?.send({ type: "broadcast", event: "act", payload: { t: "bye", id: me } satisfies Act });
    teardown();
    setState(null);
    setCode("");
    setIsHost(false);
    setStatus("idle");
  }, [isHost, me, teardown]);

  const send = useCallback(
    (act: Act) => {
      if (hostState.current && isHost) hostAct(act);
      else void channel.current?.send({ type: "broadcast", event: "act", payload: act });
    },
    [hostAct, isHost],
  );

  const flip = useCallback((i: number) => send({ t: "flip", id: me, i }), [me, send]);
  const rematch = useCallback(() => send({ t: "ready", id: me }), [me, send]);

  const setSize = useCallback(
    (size: Size) => {
      const s = hostState.current;
      if (!isHost || !s || s.phase !== "lobby") return;
      publish({ ...s, v: s.v + 1, size, faces: Array(size).fill(null), owner: Array(size).fill(-1) });
    },
    [isHost, publish],
  );

  /** Host only: deal the cards and begin (lobby), or begin the next round without waiting for votes (after a game). */
  const start = useCallback(() => {
    const s = hostState.current;
    if (!isHost || !s || s.players.filter((p) => p.online).length < 2) return;
    restart();
  }, [isHost, restart]);

  return { status, state, code, me, isHost, create, join, leave, flip, rematch, setSize, start };
}
