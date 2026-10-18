"use client";

import { Suspense, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import AuthPanel from "@/components/AuthPanel";
import WelcomeGate from "@/components/welcome/WelcomeGate";

export type Profile = { name: string | null; welcomedAt: string | null };

type AuthCtx = {
  user: User | null;
  ready: boolean;
  /** The student's profile (name and whether they have seen the welcome screen). Null until loaded. */
  profile: Profile | null;
  /** True once the profile has been looked up for the signed-in user. */
  profileReady: boolean;
  /** Update the profile in memory after it has been saved. */
  setProfile: (p: Profile) => void;
  openSignIn: () => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  ready: false,
  profile: null,
  profileReady: false,
  setProfile: () => {},
  openSignIn: () => {},
  signOut: async () => {},
});


export const useAuth = () => useContext(Ctx);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileFor, setProfileFor] = useState<string | null>(null); // id of the user the profile belongs to

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user ?? null);
        setReady(true);
      });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) setOpen(false);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch {
      // Supabase keys not set yet: the site still works, sign-in just shows a notice.
      Promise.resolve().then(() => setReady(true));
    }
    return unsubscribe;
  }, []);

  // Look up the student's profile once they are signed in.
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!userId) {
      Promise.resolve().then(() => {
        setProfile(null);
        setProfileFor(null);
      });
      return;
    }
    let cancelled = false;
    createClient()
      .from("profiles")
      .select("name, welcomed_at")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setProfile({ name: data?.name ?? null, welcomedAt: data?.welcomed_at ?? null });
        setProfileFor(userId);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const profileReady = Boolean(userId) && profileFor === userId;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const openSignIn = useCallback(() => setOpen(true), []);
  const signOut = useCallback(async () => {
    try {
      await createClient().auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, profile, profileReady, setProfile, openSignIn, signOut }),
    [user, ready, profile, profileReady, openSignIn, signOut],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <WelcomeGate />
      </Suspense>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md rounded-t-3xl bg-white p-6 pb-8 shadow-xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xl text-slate-500 hover:bg-slate-100"
            >
              ×
            </button>
            <AuthPanel
              next={typeof window !== "undefined" ? window.location.pathname : "/"}
              onDone={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
