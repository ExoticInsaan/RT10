import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { tools, type Tool } from "@/lib/tools/registry";

/**
 * The "Popular" chips on Home: the most opened tools, refreshed once a month (see supabase/migrations/0010).
 * The list is kept on the phone for the month, so Home shows it instantly and offline. If it cannot be loaded
 * (offline, no usage yet, database not set up) the chips fall back to the hand-picked tools below.
 */
const KEY = "toppershelf-popular";
const FALLBACK = ["cgpa-calculator", "image-compressor", "attendance-calculator"];
const thisMonth = () => new Date().toISOString().slice(0, 7); // UTC, same as the database

type Saved = { month: string; ids: string[] };
function read(): Saved | null {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null") as Saved | null;
    return saved && Array.isArray(saved.ids) ? saved : null;
  } catch {
    return null;
  }
}

export function usePopularTools(count = 4): Tool[] {
  const [ids, setIds] = useState<string[]>(() => read()?.ids ?? []);

  useEffect(() => {
    if (read()?.month === thisMonth()) return; // already have this month's list
    let stopped = false;
    try {
      void createClient()
        .rpc("get_popular_tools", { p_limit: 12 })
        .then(
          ({ data, error }) => {
            if (stopped || error || !Array.isArray(data) || data.length === 0) return;
            try {
              localStorage.setItem(KEY, JSON.stringify({ month: thisMonth(), ids: data }));
            } catch {
              /* storage blocked: it is just fetched again next time */
            }
            setIds(data as string[]);
          },
          () => undefined,
        );
    } catch {
      /* Supabase keys not set: keep the fallback */
    }
    return () => {
      stopped = true;
    };
  }, []);

  const picked = [...new Set([...ids, ...FALLBACK])]
    .map((id) => tools.find((t) => t.id === id))
    .filter((t): t is Tool => !!t && !!t.ready);
  return picked.slice(0, count);
}
