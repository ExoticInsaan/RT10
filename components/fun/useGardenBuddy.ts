"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { saveJSON } from "@/components/fun/kit";
import { createLink, deleteLink, latestLink, listWaters, updateLinkPublic } from "@/lib/fun/friends";

/*
 * The garden buddy for Grow a Sapling. The owner's garden (their saved game) is the one truth. A buddy opens the garden link, waters
 * the tree, and that watering is stored on the server. Here the owner's game pulls those waterings in as if the buddy had watered it.
 *
 * Merge rule: a buddy watering counts only if it is on a day after the garden's last watered day, so nothing is ever counted twice
 * and a day the owner already watered is not watered again ("one watering keeps your streak alive").
 */
type Who = "a" | "b";
type GardenLike = {
  offset: number;
  cared: number;
  streak: number;
  best: number;
  lastW: number | null;
  names: { a: string; b: string };
  log: Record<string, Who>;
  code: string;
};

const dayNow = () => {
  const n = new Date();
  return Math.floor((n.getTime() - n.getTimezoneOffset() * 60000) / 86400000);
};

export function useGardenBuddy<G extends GardenLike>(g: G, setG: (next: G) => void, storageKey: string) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [linked, setLinked] = useState(false);
  const [error, setError] = useState("");
  const latest = useRef(g);
  useEffect(() => {
    latest.current = g;
  }, [g]);

  // Is there already a link for this garden?
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    latestLink("grow-a-sapling").then((r) => {
      if (!cancelled && r.ok && r.data && r.data.code === latest.current.code) setLinked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const apply = useCallback(
    (next: G) => {
      latest.current = next;
      saveJSON(storageKey, next);
      setG(next);
    },
    [setG, storageKey],
  );

  /** Bring the buddy's waterings into the garden. */
  const pull = useCallback(async () => {
    const cur = latest.current;
    const r = await listWaters(cur.code);
    if (!r.ok || r.data.length === 0) return;
    const today = dayNow() + cur.offset;
    let { cared, streak, best, lastW } = cur;
    let log = { ...cur.log };
    let changed = false;
    for (const w of r.data) {
      if (w.day > today) continue;
      if (lastW !== null && w.day <= lastW) continue;
      streak = lastW !== null && w.day === lastW + 1 ? streak + 1 : 1;
      cared += 1;
      lastW = w.day;
      best = Math.max(best, streak);
      log[w.day] = "b";
      changed = true;
    }
    const buddy = r.data[0].buddy_name;
    if (!changed && cur.names.b === buddy) return;
    const keepFrom = (lastW ?? today) - 14;
    log = Object.fromEntries(Object.entries(log).filter(([day]) => +day > keepFrom)) as Record<string, Who>;
    apply({ ...cur, cared, streak, best, lastW, log, names: { ...cur.names, b: buddy } });
  }, [apply]);

  // Pull when the garden opens, and again whenever the owner comes back to the page.
  useEffect(() => {
    if (!linked) return;
    void pull();
    const again = () => {
      if (document.visibilityState === "visible") void pull();
    };
    document.addEventListener("visibilitychange", again);
    window.addEventListener("focus", again);
    return () => {
      document.removeEventListener("visibilitychange", again);
      window.removeEventListener("focus", again);
    };
  }, [linked, pull]);

  // Keep the small public snapshot (what the buddy sees) up to date.
  useEffect(() => {
    if (!linked) return;
    const t = setTimeout(() => void updateLinkPublic(g.code, { cared: g.cared, streak: g.streak, lastW: g.lastW }), 1200);
    return () => clearTimeout(t);
  }, [linked, g.code, g.cared, g.streak, g.lastW]);

  /** Make the invite link for this garden. */
  const invite = useCallback(
    async (ownerName: string) => {
      setError("");
      const cur = latest.current;
      const r = await createLink("grow-a-sapling", ownerName, { code: cur.code, public: { cared: cur.cared, streak: cur.streak, lastW: cur.lastW } });
      if (!r.ok) {
        // A link for this garden may already exist from another device; that is fine.
        const existing = await latestLink("grow-a-sapling");
        if (existing.ok && existing.data && existing.data.code === cur.code) {
          setLinked(true);
          return true;
        }
        setError(r.error);
        return false;
      }
      setLinked(true);
      return true;
    },
    [],
  );

  /** Remove the buddy (or start over): the old link stops working and the garden gets a fresh code. */
  const unlink = useCallback(async () => {
    const old = latest.current.code;
    const r = await deleteLink(old);
    if (!r.ok) {
      setError(r.error);
      return false;
    }
    setLinked(false);
    return true;
  }, []);

  return { linked, error, invite, unlink, pull };
}
