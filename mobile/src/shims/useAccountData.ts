import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "./supabase-client";
import { OFFLINE_PREFIX } from "./offlineCache";
import { useAuth } from "@/components/AuthProvider";

/*
 * App version of the website's lib/tools/useAccountData.ts (same API: [data, setData, status]).
 * The website version needs the internet to open a tool. This one keeps a copy on the phone, so Flashcards, Countdown and
 * Reminders open instantly and keep working offline:
 *   - opening a tool shows the copy on the phone straight away, then refreshes it from the account when online;
 *   - every change is saved on the phone first, then sent to the account (retried when the internet or the app comes back);
 *   - changes made offline are never overwritten by an older account copy: the phone's copy is sent first.
 * If two phones edit the same tool while offline, the one that reconnects last wins (same as before).
 */
export type AccountToolId = "flashcard-maker" | "reminder" | "days-countdown" | "grow-a-sapling";
export type AccountStatus = "loading" | "ready" | "error";

const SAVE_DELAY_MS = 800;

type Cached<T> = { data: T; dirty: boolean };

const cacheKey = (userId: string, toolId: string) => `${OFFLINE_PREFIX}${userId}:${toolId}`;
function readCache<T>(userId: string, toolId: string): Cached<T> | null {
  try {
    const raw = localStorage.getItem(cacheKey(userId, toolId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cached<T>;
    return parsed && "data" in parsed ? parsed : null;
  } catch {
    return null;
  }
}
function writeCache<T>(userId: string, toolId: string, data: T, dirty: boolean) {
  try {
    localStorage.setItem(cacheKey(userId, toolId), JSON.stringify({ data, dirty } satisfies Cached<T>));
  } catch {
    /* storage full or blocked: the account copy still works */
  }
}

export function useAccountData<T>(toolId: AccountToolId, empty: T): [T, (next: T) => void, AccountStatus] {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [data, setData] = useState<T>(empty);
  const [status, setStatus] = useState<AccountStatus>("loading");
  const statusRef = useRef<AccountStatus>("loading");
  const lastSaved = useRef<string>(JSON.stringify(empty));
  const latest = useRef<T>(empty);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);

  const markReady = useCallback(() => {
    statusRef.current = "ready";
    setStatus("ready");
  }, []);

  /** Sends the phone's copy to the account. Returns true when the account has it. */
  const push = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;
    const body = latest.current;
    const json = JSON.stringify(body);
    if (!dirty.current && json === lastSaved.current) return true;
    try {
      const { error } = await createClient()
        .from("user_tool_data")
        .upsert({ user_id: userId, tool_id: toolId, data: body, updated_at: new Date().toISOString() }, { onConflict: "user_id,tool_id" });
      if (error) return false;
      lastSaved.current = json;
      // Only clear "waiting to sync" if nothing changed while the request was running.
      if (JSON.stringify(latest.current) === json) {
        dirty.current = false;
        writeCache(userId, toolId, latest.current, false);
      }
      return true;
    } catch {
      return false;
    }
  }, [userId, toolId]);

  /** Brings the phone and the account together: send waiting changes, otherwise take the account copy. */
  const sync = useCallback(async () => {
    if (!userId || busy.current) return;
    busy.current = true;
    try {
      if (dirty.current) {
        await push();
        return;
      }
      const { data: row, error } = await createClient().from("user_tool_data").select("data").eq("tool_id", toolId).maybeSingle();
      if (error) throw error;
      if (dirty.current) return; // the person edited while we were reading: keep their change
      const loaded = (row?.data ?? empty) as T;
      const json = JSON.stringify(loaded);
      lastSaved.current = json;
      if (json !== JSON.stringify(latest.current)) {
        latest.current = loaded;
        setData(loaded);
      }
      writeCache(userId, toolId, loaded, false);
      markReady();
    } catch {
      // Offline or unreachable: fine if we already show the copy from the phone, otherwise tell the person.
      if (statusRef.current !== "ready") {
        statusRef.current = "error";
        setStatus("error");
      }
    } finally {
      busy.current = false;
    }
    // `empty` is a constant passed by the caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, toolId, push, markReady]);

  // Open: show the phone's copy at once, then refresh from the account.
  useEffect(() => {
    if (!userId) return;
    const cached = readCache<T>(userId, toolId);
    if (cached) {
      latest.current = cached.data;
      dirty.current = cached.dirty;
      lastSaved.current = cached.dirty ? "" : JSON.stringify(cached.data);
      setData(cached.data);
      markReady();
    }
    void sync();
    // `empty` is a constant passed by the caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, toolId]);

  // Try again when the internet comes back or the app is reopened.
  useEffect(() => {
    if (!userId) return;
    const retry = () => {
      if (document.visibilityState === "visible") void sync();
    };
    window.addEventListener("online", retry);
    document.addEventListener("visibilitychange", retry);
    return () => {
      window.removeEventListener("online", retry);
      document.removeEventListener("visibilitychange", retry);
    };
  }, [userId, sync]);

  const update = useCallback(
    (next: T) => {
      if (statusRef.current !== "ready" || !userId) return;
      latest.current = next;
      dirty.current = true;
      setData(next);
      writeCache(userId, toolId, next, true); // safe on the phone before anything is sent
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        void push();
      }, SAVE_DELAY_MS);
    },
    [userId, toolId, push],
  );

  // Send any pending change when the tool closes.
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
        void push();
      }
    },
    [push],
  );

  return [data, update, status];
}
