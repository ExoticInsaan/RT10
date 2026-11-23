"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Color } from "@/lib/fun/ludo";
import { beginGame, joinRoom, leaveRoom, lobbyState, newRoomCode, seatOf, syncPresence, takeColor, type RoomState } from "@/lib/fun/ludo-room";

/*
 * Ludo Rush rooms, built the same way as Memory Match rooms. Nothing is stored: there is no table and no saved game.
 * People with the same room code talk over a Supabase Realtime "broadcast" channel, which only passes messages along
 * while people are connected. The person who made the room (the host) keeps the real room state and runs the rules.
 * Everyone else sends what they want to do (join, pick a colour, leave) to the host and receives the result.
 */

export type RoomStatus = "idle" | "connecting" | "ready" | "notfound" | "closed" | "error";

type Act = { t: "hello"; id: string; name: string } | { t: "color"; id: string; color: Color } | { t: "bye"; id: string };
type Meta = { name?: string; host?: boolean };

const FIND_TIMEOUT_MS = 10_000; // how long a guest keeps knocking before saying "no room found"
const HELLO_EVERY_MS = 1200; // a guest asks the host to let them in until the host answers
const HEARTBEAT_MS = 4000; // the host re-sends the room now and then, so a lost message heals itself
const GRACE_MS = 8000; // someone who just knocked counts as present even if their presence signal is slow
const HOST_GONE_MS = 3000; // a guest waits this long before deciding the host has really left

function myId() {
  try {
    const saved = sessionStorage.getItem("ludo-id");
    if (saved) return saved;
    const fresh = crypto.randomUUID();
    sessionStorage.setItem("ludo-id", fresh); // same id after a refresh, so a player gets their colour back
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

export function useLudoRoom() {
  const [status, setStatus] = useState<RoomStatus>("idle");
  const [state, setState] = useState<RoomState | null>(null);
  const [code, setCode] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [me] = useState(() => (typeof window === "undefined" ? "" : myId()));

  const channel = useRef<RealtimeChannel | null>(null);
  const hostState = useRef<RoomState | null>(null);
  const lastV = useRef(-1);
  const timers = useRef<number[]>([]);
  const gotState = useRef(false);
  const knocked = useRef<Record<string, number>>({});
  const left = useRef(new Set<string>()); // people who pressed Leave: their presence signal may linger for a moment, so do not seat them again
  const presenceNow = useRef<() => Record<string, Meta>>(() => ({}));
  const session = useRef(0); // ignores events from a room that was already left
  const syncRef = useRef<(here: Record<string, Meta>) => void>(() => {});
  const connectRef = useRef<(roomCode: string, name: string, host: boolean, attempt?: number) => void>(() => {});

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
    lastV.current = -1;
    gotState.current = false;
    knocked.current = {};
    left.current = new Set();
  }, []);

  useEffect(() => teardown, [teardown]);

  /* ---------- host: runs the room ---------- */

  const publish = useCallback((next: RoomState) => {
    hostState.current = next;
    setState(next);
    void channel.current?.send({ type: "broadcast", event: "state", payload: next });
  }, []);

  const hostAct = useCallback(
    (act: Act) => {
      const s = hostState.current;
      if (!s) return;
      if (act.t === "bye") {
        delete knocked.current[act.id]; // they left on purpose: no grace period
        left.current.add(act.id);
        publish(leaveRoom(s, act.id));
        return;
      }
      if (act.t === "hello") {
        // A guest knocking. Seat them straight away, so joining never depends on the presence signal arriving first.
        knocked.current[act.id] = Date.now();
        left.current.delete(act.id); // knocking again means they are back
        const next = joinRoom(s, act.id, act.name ?? "Player");
        if (next && next !== s) publish(next);
        return;
      }
      const next = takeColor(s, act.id, act.color);
      if (next) publish(next);
    },
    [publish],
  );

  /** Keeps the seats in step with who is connected (presence), and tells everyone. */
  const hostSync = useCallback(
    (here: Record<string, Meta>) => {
      const s = hostState.current;
      if (!s) return;
      const fresh = (id: string) => Date.now() - (knocked.current[id] ?? 0) < GRACE_MS;
      let next = syncPresence(s, (id) => id in here || fresh(id));
      for (const id of Object.keys(here)) delete knocked.current[id]; // once presence shows them, it decides
      for (const [id, meta] of Object.entries(here)) {
        if (meta.host || left.current.has(id)) continue;
        const joined = joinRoom(next, id, meta.name ?? "Player"); // null when the room is full or the game already started
        if (joined) next = joined;
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
    (roomCode: string, name: string, host: boolean, attempt = 0) => {
      teardown();
      const mine = session.current;
      setCode(roomCode);
      setIsHost(host);
      setState(null);
      setStatus("connecting");
      if (host) {
        const first = lobbyState(me, name);
        hostState.current = first;
        setState(first);
      }

      const ch = createClient().channel(`ludo-${roomCode}`, { config: { broadcast: { self: false, ack: false }, presence: { key: me } } });
      channel.current = ch;
      const here = () => {
        const out: Record<string, Meta> = {};
        for (const [key, metas] of Object.entries(ch.presenceState<Meta>())) out[key] = metas[0] ?? {};
        return out;
      };
      presenceNow.current = here;

      ch.on("broadcast", { event: "state" }, ({ payload }) => {
        if (host || session.current !== mine) return;
        const next = payload as RoomState;
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
              if (clash && attempt < 4) connectRef.current(newRoomCode(), name, true, attempt + 1);
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

  const create = useCallback((name: string) => connect(newRoomCode(), name, true), [connect]);
  const join = useCallback((roomCode: string, name: string) => connect(roomCode, name, false), [connect]);

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

  /** Pick another colour in the lobby. */
  const pickColor = useCallback((color: Color) => send({ t: "color", id: me, color }), [me, send]);

  /** Host only: begin the game with the people and colours in the room. */
  const start = useCallback(() => {
    const s = hostState.current;
    if (!isHost || !s) return;
    const next = beginGame(s);
    if (next) publish(next);
  }, [isHost, publish]);

  /** The colour this person holds, or null (not seated yet, room full, or the game already started without them). */
  const seat = state ? seatOf(state, me) : null;

  return { status, state, code, me, seat, isHost, create, join, leave, pickColor, start };
}
