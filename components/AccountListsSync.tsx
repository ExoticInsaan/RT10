"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { FAVOURITES_KEY, RECENT_KEY } from "@/components/tools/ui";
import { createClient } from "@/lib/supabase/client";
import { LIST_EVENT, readList, writeList } from "@/lib/tools/useStoredList";

/**
 * Keeps favourite and recently used tools in the signed-in person's account (table user_tools, one row per user),
 * so they follow the person to a new phone or browser. The lists still live in this device's storage first, so
 * guests and offline use work as before. Renders nothing.
 *
 * First sign-in on a device: what is already on the device is merged with the account copy (nothing is lost).
 * After that the account copy wins when the page opens, and every change here is saved a moment later.
 */
const MARK = "toppershelf-lists-user";
const MAX_FAVOURITES = 60;
const MAX_RECENT = 8;
const SAVE_DELAY_MS = 1000;

const clean = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((x): x is string => typeof x === "string" && x.length > 0 && x.length <= 64) : [];
const unique = (list: string[]) => [...new Set(list)];

export default function AccountListsSync() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let ready = false;
    let lastSent = "";
    let timer: ReturnType<typeof setTimeout> | null = null;
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      return; // Supabase keys not set: lists stay on this device
    }

    const push = async () => {
      timer = null;
      const favourites = readList(FAVOURITES_KEY).slice(0, MAX_FAVOURITES);
      const recents = readList(RECENT_KEY).slice(0, MAX_RECENT);
      const json = JSON.stringify([favourites, recents]);
      if (json === lastSent) return;
      const { error } = await supabase
        .from("user_tools")
        .upsert({ user_id: userId, favourites, recents, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (!error) lastSent = json;
    };
    const schedule = () => {
      if (!ready) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(push, SAVE_DELAY_MS);
    };

    (async () => {
      try {
        const { data, error } = await supabase.from("user_tools").select("favourites, recents").maybeSingle();
        if (error || cancelled) return;
        const localFav = readList(FAVOURITES_KEY);
        const localRecent = readList(RECENT_KEY);
        let firstOnDevice = true;
        try {
          firstOnDevice = localStorage.getItem(MARK) !== userId;
        } catch {
          /* storage blocked: treat as first time */
        }
        if (data) {
          const remoteFav = clean(data.favourites);
          const remoteRecent = clean(data.recents);
          writeList(FAVOURITES_KEY, unique(firstOnDevice ? [...localFav, ...remoteFav] : remoteFav).slice(0, MAX_FAVOURITES));
          writeList(RECENT_KEY, unique([...localRecent, ...remoteRecent]).slice(0, MAX_RECENT));
          lastSent = JSON.stringify([remoteFav, remoteRecent]);
        }
        try {
          localStorage.setItem(MARK, userId);
        } catch {
          /* storage blocked: merged again next time */
        }
        ready = true;
        await push(); // sends the merged lists, or this device's lists for a brand-new account
      } catch {
        /* offline or not reachable: lists stay on this device and sync next time */
      }
    })();

    window.addEventListener(LIST_EVENT, schedule);
    return () => {
      cancelled = true;
      window.removeEventListener(LIST_EVENT, schedule);
      if (timer) {
        clearTimeout(timer);
        void push();
      }
    };
  }, [userId]);

  return null;
}
