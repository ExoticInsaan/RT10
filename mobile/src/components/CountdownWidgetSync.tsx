import { useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useAccountData } from "@/lib/tools/useAccountData";
import { syncCountdownWidget, type CountdownItem } from "../widget";

/**
 * Runs once when the app opens: fills the home-screen widget with the signed-in person's countdowns (including ones added
 * on another device), and empties it on sign-out so no private titles stay on the home screen. Renders nothing.
 * The Countdown screen keeps the widget up to date after that.
 */
export default function CountdownWidgetSync() {
  const { user, ready } = useAuth();
  const [items, , status] = useAccountData<CountdownItem[]>("days-countdown", []);
  const done = useRef(false);

  useEffect(() => {
    if (status === "ready" && !done.current) {
      done.current = true;
      void syncCountdownWidget(items);
    }
  }, [items, status]);

  useEffect(() => {
    if (ready && !user) void syncCountdownWidget([]);
  }, [ready, user]);

  return null;
}
