import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isAuthRetryableFetchError, type User } from "@supabase/supabase-js";
import { createClient } from "./supabase-client";
import { navigate } from "./router";
import { listenForOAuthReturn } from "../auth";
import { OFFLINE_USER_KEY, clearOfflineCache } from "./offlineCache";

/**
 * Same API as the website's AuthProvider (user, ready, openSignIn, signOut) so the shared tools work unchanged.
 * Here "open sign-in" opens the app's own Sign in screen, and Google sign-in finishes through a deep link (see src/auth.ts).
 *
 * Offline: the app opens signed in even with no internet. The login is read from the phone (no server call needed), and if the
 * saved login has expired and cannot be renewed because there is no internet, the last known person is kept until it can.
 */
type AuthCtx = { user: User | null; ready: boolean; openSignIn: () => void; signOut: () => Promise<void> };

const Ctx = createContext<AuthCtx>({ user: null, ready: false, openSignIn: () => {}, signOut: async () => {} });
export const useAuth = () => useContext(Ctx);

const MOCK = import.meta.env.VITE_MOCK_USER === "1";
const mockUser = { id: "preview-user", email: "preview@toppershelf.online", user_metadata: { name: "Aryan" } } as unknown as User;

function rememberUser(user: User | null) {
  try {
    if (user) localStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(OFFLINE_USER_KEY);
  } catch {
    /* storage blocked: only the offline fallback is lost */
  }
}
function rememberedUser(): User | null {
  try {
    const raw = localStorage.getItem(OFFLINE_USER_KEY);
    const user = raw ? (JSON.parse(raw) as User) : null;
    return user && typeof user.id === "string" ? user : null;
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK ? mockUser : null);
  const [ready, setReady] = useState(MOCK);

  useEffect(() => {
    if (MOCK) return;
    let unsubscribe = () => {};
    try {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data, error }) => {
        const session = data.session;
        if (session) {
          setUser(session.user);
          rememberUser(session.user);
          // Online: make sure the account still exists (deleted or blocked accounts are signed out).
          if (navigator.onLine) {
            void supabase.auth.getUser().then(({ error: userError }) => {
              if (userError && !isAuthRetryableFetchError(userError) && (userError.status === 401 || userError.status === 403)) {
                void supabase.auth.signOut({ scope: "local" });
              }
            });
          }
        } else if ((error && isAuthRetryableFetchError(error)) || !navigator.onLine) {
          setUser(rememberedUser()); // offline and the saved login could not be renewed yet
        } else {
          setUser(null);
        }
        setReady(true);
      });
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          setUser(session.user);
          rememberUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          rememberUser(null);
        }
      });
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
    clearOfflineCache(); // the next person on this phone must not see this account's saved copies
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, openSignIn, signOut }), [user, ready, openSignIn, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
