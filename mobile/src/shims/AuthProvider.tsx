import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./supabase-client";
import { navigate } from "./router";
import { listenForOAuthReturn } from "../auth";

/**
 * Same API as the website's AuthProvider (user, ready, openSignIn, signOut) so the shared tools work unchanged.
 * Here "open sign-in" opens the app's own Sign in screen, and Google sign-in finishes through a deep link (see src/auth.ts).
 */
type AuthCtx = { user: User | null; ready: boolean; openSignIn: () => void; signOut: () => Promise<void> };

const Ctx = createContext<AuthCtx>({ user: null, ready: false, openSignIn: () => {}, signOut: async () => {} });
export const useAuth = () => useContext(Ctx);

const MOCK = import.meta.env.VITE_MOCK_USER === "1";
const mockUser = { id: "preview-user", email: "preview@toppershelf.online", user_metadata: { name: "Aarav" } } as unknown as User;

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK ? mockUser : null);
  const [ready, setReady] = useState(MOCK);

  useEffect(() => {
    if (MOCK) return;
    let unsubscribe = () => {};
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user ?? null);
        setReady(true);
      });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
      unsubscribe = () => data.subscription.unsubscribe();
    } catch {
      // Supabase keys not set yet: the app still opens, signing in just shows a notice.
      Promise.resolve().then(() => setReady(true));
    }
    const stopLink = listenForOAuthReturn(() => navigate("/home", true));
    return () => {
      unsubscribe();
      stopLink();
    };
  }, []);

  const openSignIn = useCallback(() => navigate("/signin"), []);
  const signOut = useCallback(async () => {
    try {
      await createClient().auth.signOut();
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, openSignIn, signOut }), [user, ready, openSignIn, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
