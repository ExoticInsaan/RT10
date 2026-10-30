"use client";

import { createClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/site";

/*
 * Friend games (Friendship Score, What Am I to You, How Well Do You Know Me, Grow a Sapling buddy).
 * The owner (signed in) makes a link; friends open it with no account. See supabase/migrations/0003_friend_games.sql.
 * Every function returns { ok: true, data } or { ok: false, error } with a message that is safe to show.
 */
export type FriendGame = "friendship-score" | "what-am-i-to-you" | "how-well-do-you-know-me" | "grow-a-sapling";
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const SEGMENT: Record<FriendGame, string> = {
  "friendship-score": "friends",
  "what-am-i-to-you": "notes",
  "how-well-do-you-know-me": "know-me",
  "grow-a-sapling": "garden",
};

export const linkPath = (game: FriendGame, code: string) => `/fun/${SEGMENT[game]}/${code}`;
export const linkUrl = (game: FriendGame, code: string) => `${SITE_URL}${linkPath(game, code)}`;
/** The link without https://, as shown on screen. */
export const linkLabel = (game: FriendGame, code: string) => linkUrl(game, code).replace(/^https?:\/\//, "");

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export function newCode(length = 10) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

const GENERIC = "Something went wrong. Please check your internet connection and try again.";
type DbError = { message?: string; code?: string } | null;
// The database functions raise short sentences meant for people (see the migration); anything else gets the generic text.
const KNOWN = ["This link does not exist.", "Please enter a name", "This link has reached its limit.", "This garden does not exist.", "Check your phone date and time.", "This garden already has a buddy."];
function explain(error: DbError): string {
  const message = error?.message ?? "";
  return KNOWN.some((k) => message.startsWith(k)) ? message : GENERIC;
}

async function run<T>(fn: () => PromiseLike<{ data: T | null; error: DbError }>): Promise<Result<T>> {
  try {
    const { data, error } = await fn();
    if (error) return { ok: false, error: explain(error) };
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, error: GENERIC };
  }
}

export type MyLink = { code: string; owner_name: string; secret: { key?: number[] }; public: Record<string, unknown>; created_at: string };

/** Make a link for the signed-in person. `code` is chosen here (garden uses the garden's own code). */
export async function createLink(game: FriendGame, ownerName: string, extra: { secret?: object; public?: object; code?: string } = {}): Promise<Result<string>> {
  try {
    const supabase = createClient();
    for (let attempt = 0; attempt < 3; attempt++) {
      const code = extra.code ?? newCode();
      const { error } = await supabase.from("fun_links").insert({ code, game, owner_name: ownerName.trim(), secret: extra.secret ?? {}, public: extra.public ?? {} });
      if (!error) return { ok: true, data: code };
      if (error.code !== "23505" || extra.code) return { ok: false, error: explain(error) };
    }
    return { ok: false, error: GENERIC };
  } catch {
    return { ok: false, error: GENERIC };
  }
}

/** The person's newest link for a game, so they find their results again on any device. */
export async function latestLink(game: FriendGame): Promise<Result<MyLink | null>> {
  return run<MyLink | null>(async () => {
    const { data, error } = await createClient()
      .from("fun_links")
      .select("code, owner_name, secret, public, created_at")
      .eq("game", game)
      .order("created_at", { ascending: false })
      .limit(1);
    return { data: ((data as MyLink[] | null)?.[0] ?? null) as MyLink | null, error };
  });
}

export async function updateLinkPublic(code: string, snapshot: object): Promise<Result<true>> {
  return run<true>(async () => {
    const { error } = await createClient().from("fun_links").update({ public: snapshot }).eq("code", code);
    return { data: true, error };
  });
}

export type LinkInfo = { game: FriendGame; owner_name: string; public: Record<string, unknown>; responses: number; buddy: string | null };

/** What a friend sees when they open a link. Null when the link does not exist. */
export async function getLink(code: string): Promise<Result<LinkInfo | null>> {
  return run<LinkInfo | null>(async () => {
    const { data, error } = await createClient().rpc("fun_get_link", { p_code: code });
    return { data: ((data as LinkInfo[] | null)?.[0] ?? null) as LinkInfo | null, error };
  });
}

export async function submitResponse(code: string, name: string, answers: object): Promise<Result<{ score: number | null }>> {
  return run<{ score: number | null }>(async () => {
    const { data, error } = await createClient().rpc("fun_submit_response", { p_code: code, p_name: name, p_answers: answers });
    return { data: data as { score: number | null } | null, error };
  });
}

export type FriendRank = { rank: number; total: number; score: number; ahead: number; above: { name: string; score: number }[] };

/** Friendship Score, friend side: where this friend ranks among everyone who answered. Null if their answers are not saved yet. */
export async function friendRank(code: string, name: string): Promise<Result<FriendRank | null>> {
  return run<FriendRank | null>(async () => {
    const { data, error } = await createClient().rpc("fun_friend_rank", { p_code: code, p_name: name });
    return { data: (data as FriendRank | null) ?? null, error };
  });
}

export type FriendAnswer = { responder_name: string; answers: Record<string, unknown>; score: number | null; created_at: string };

/** Answers on the signed-in person's own link (newest first). */
export async function listResponses(code: string): Promise<Result<FriendAnswer[]>> {
  return run<FriendAnswer[]>(async () => {
    const { data, error } = await createClient()
      .from("fun_responses")
      .select("responder_name, answers, score, created_at")
      .eq("code", code)
      .order("created_at", { ascending: false })
      .limit(300);
    return { data: (data as FriendAnswer[] | null) ?? [], error };
  });
}

/** Know Me: the right answer for one question, revealed after the friend picks. */
export async function knowCheck(code: string, q: number, guess: number): Promise<Result<number | null>> {
  return run<number | null>(async () => {
    const { data, error } = await createClient().rpc("fun_know_check", { p_code: code, p_q: q, p_guess: guess });
    return { data: typeof data === "number" ? data : null, error };
  });
}

export async function waterGarden(code: string, name: string, day: number): Promise<Result<true>> {
  return run<true>(async () => {
    const { error } = await createClient().rpc("fun_garden_water", { p_code: code, p_name: name, p_day: day });
    return { data: true, error };
  });
}

export type Watering = { day: number; buddy_name: string };
export async function listWaters(code: string): Promise<Result<Watering[]>> {
  return run<Watering[]>(async () => {
    const { data, error } = await createClient().from("fun_garden_waters").select("day, buddy_name").eq("code", code).order("day", { ascending: true }).limit(60);
    return { data: (data as Watering[] | null) ?? [], error };
  });
}

export const whatsappHref = (text: string, url: string) => "https://wa.me/?text=" + encodeURIComponent(`${text} ${url}`);

type ShareBridge = (o: { title: string; text: string; url: string }) => Promise<void>;
const nativeBridge = () => (typeof window !== "undefined" ? (window as unknown as { __tsShare?: ShareBridge }).__tsShare : undefined);

/** True when this device can open a system share sheet (the Android app, or a phone/desktop browser that supports it). */
export const canNativeShare = () => Boolean(nativeBridge()) || (typeof navigator !== "undefined" && typeof navigator.share === "function");

/**
 * Opens the system share sheet. Returns true when the sheet was used, including when the person closed it
 * without sharing (so callers do not copy the link behind their back). Returns false only when there is no
 * share sheet or it failed, so the caller can fall back to Copy.
 */
export async function nativeShare(title: string, text: string, url: string): Promise<boolean> {
  try {
    // Inside the Android app the system share sheet comes from the Capacitor plugin (set up in mobile/src/native.ts).
    const native = nativeBridge();
    if (native) {
      await native({ title, text, url });
      return true;
    }
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      await navigator.share({ title, text, url });
      return true;
    }
  } catch (error) {
    const e = error as { name?: string; message?: string };
    if (e?.name === "AbortError" || /cancel/i.test(e?.message ?? "")) return true;
  }
  return false;
}

/** Remove a link. Its answers and waterings are removed with it. */
export async function deleteLink(code: string): Promise<Result<true>> {
  return run<true>(async () => {
    const { error } = await createClient().from("fun_links").delete().eq("code", code);
    return { data: true, error };
  });
}
