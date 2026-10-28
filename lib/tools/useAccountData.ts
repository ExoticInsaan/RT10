"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export type AccountToolId = "flashcard-maker" | "reminder" | "days-countdown";
export type AccountStatus = "loading" | "ready" | "error";

// Browser copies from before tools were tied to accounts. They are deleted, never imported.
const LEGACY_KEYS = ["toppershelf-flashcards", "toppershelf-reminders", "toppershelf-countdowns"];

const SAVE_DELAY_MS = 800;

/**
 * Saves a tool's data (a list) in the signed-in user's account (table user_tool_data, one row per user per tool).
 * Works like useState, plus a status: "loading" until the account copy is read, "error" if it could not be read.
 * Nothing is saved until the account copy has loaded, so a failed read can never wipe the saved data.
 */
export function useAccountData<T>(toolId: AccountToolId, empty: T): [T, (next: T) => void, AccountStatus] {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [data, setData] = useState<T>(empty);
  const [status, setStatus] = useState<AccountStatus>("loading");
  const statusRef = useRef<AccountStatus>("loading");
  const lastSaved = useRef<string>(JSON.stringify(empty));
  const latest = useRef<T>(empty);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drop old browser-only data.
  useEffect(() => {
    try {
      LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch {
      /* storage blocked: nothing to remove */
    }
  }, []);

  // Read the account copy.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: row, error } = await createClient()
          .from("user_tool_data")
          .select("data")
          .eq("tool_id", toolId)
          .maybeSingle();
        if (cancelled) return;
        if (error) throw error;
        const loaded = (row?.data ?? empty) as T;
        lastSaved.current = JSON.stringify(loaded);
        latest.current = loaded;
        setData(loaded);
        statusRef.current = "ready";
        setStatus("ready");
      } catch {
        if (!cancelled) {
          statusRef.current = "error";
          setStatus("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // `empty` is a constant passed by the caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, toolId]);

  const save = useCallback(async () => {
    if (!userId) return;
    const json = JSON.stringify(latest.current);
    if (json === lastSaved.current) return;
    const { error } = await createClient()
      .from("user_tool_data")
      .upsert(
        { user_id: userId, tool_id: toolId, data: latest.current, updated_at: new Date().toISOString() },
        { onConflict: "user_id,tool_id" },
      );
    if (!error) lastSaved.current = json;
  }, [userId, toolId]);

  const update = useCallback(
    (next: T) => {
      if (statusRef.current !== "ready") return;
      latest.current = next;
      setData(next);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(save, SAVE_DELAY_MS);
    },
    [save],
  );

  // Save any pending change when the tool closes.
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        void save();
      }
    },
    [save],
  );

  return [data, update, status];
}
