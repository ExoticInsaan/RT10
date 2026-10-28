"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { saveJSON } from "@/components/fun/kit";
import { createClient } from "@/lib/supabase/client";

/*
 * Keeps a signed-in person's garden (Grow a Sapling) in their account (table user_tool_data, tool "grow-a-sapling"),
 * so the streak and trees survive a new phone or a reinstall. The garden is still saved on the device first, so guests
 * and offline play work as before and a guest who signs in keeps their garden.
 *
 * Which copy wins: the first time this device meets this account, the one with more waterings; after that, the one
 * changed most recently (so a reset really resets). The "preview: skip days" offset is never sent to the account.
 */
const TOOL = "grow-a-sapling";
const STAMP_KEY = "fz-garden-stamp";
const MARK_KEY = "fz-garden-user";
const SAVE_DELAY_MS = 800;

type GardenLike = { offset: number; cared: number; log: object; names: object };
const strip = (g: object) => JSON.stringify({ ...g, offset: 0 });
const getStamp = () => {
  try {
    return Number(localStorage.getItem(STAMP_KEY)) || 0;
  } catch {
    return 0;
  }
};
const setStamp = (n: number) => {
  try {
    localStorage.setItem(STAMP_KEY, String(n));
  } catch {
    /* storage blocked: the account copy is still sent */
  }
};
const looksLikeGarden = (x: unknown): x is GardenLike & { u?: number } => {
  const g = x as Partial<GardenLike> | null;
  return !!g && typeof g.cared === "number" && typeof g.log === "object" && g.log !== null && typeof g.names === "object" && g.names !== null;
};

export function useGardenSync<G extends GardenLike>(g: G, setG: (next: G) => void, storageKey: string) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const latest = useRef(g);
  const state = useRef({ ready: false, lastSent: "", seen: strip(g) });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const push = useCallback(async () => {
    timer.current = null;
    if (!userId || !state.current.ready) return;
    const body = { ...latest.current, offset: 0, u: getStamp() };
    const json = JSON.stringify(body);
    if (json === state.current.lastSent) return;
    const { error } = await createClient()
      .from("user_tool_data")
      .upsert({ user_id: userId, tool_id: TOOL, data: body, updated_at: new Date().toISOString() }, { onConflict: "user_id,tool_id" });
    if (!error) state.current.lastSent = json;
  }, [userId]);

  // Every change made on this device: stamp it, then save it to the account a moment later.
  useEffect(() => {
    latest.current = g;
    const now = strip(g);
    if (now !== state.current.seen) {
      state.current.seen = now;
      setStamp(Date.now());
      if (state.current.ready) {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(push, SAVE_DELAY_MS);
      }
    }
  }, [g, push]);

  // On sign-in: read the account copy and decide which one wins.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    state.current.ready = false;
    (async () => {
      try {
        const { data: row, error } = await createClient().from("user_tool_data").select("data").eq("tool_id", TOOL).maybeSingle();
        if (error || cancelled) return;
        const local = latest.current;
        const remote = row?.data;
        let first = true;
        try {
          first = localStorage.getItem(MARK_KEY) !== userId;
        } catch {
          /* storage blocked: treat as first time */
        }
        if (looksLikeGarden(remote)) {
          const { u, ...rest } = remote;
          const remoteWins = first ? remote.cared > local.cared : (u ?? 0) > getStamp();
          if (remoteWins) {
            const merged = { ...local, ...rest, offset: local.offset } as G;
            state.current.seen = strip(merged);
            setStamp(u ?? Date.now());
            saveJSON(storageKey, merged);
            setG(merged);
            latest.current = merged;
          }
        }
        try {
          localStorage.setItem(MARK_KEY, userId);
        } catch {
          /* storage blocked: compared again next time */
        }
        state.current.ready = true;
        await push(); // sends this device's garden when it won, or for a new account
      } catch {
        /* offline or not reachable: the garden stays on this device and syncs next time */
      }
    })();
    return () => {
      cancelled = true;
      if (timer.current) {
        clearTimeout(timer.current);
        void push();
      }
    };
    // setG and storageKey are stable for the life of the game.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, push]);
}
