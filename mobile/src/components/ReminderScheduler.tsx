import { useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useAccountData } from "@/lib/tools/useAccountData";
import { cancelAllReminders, syncReminders, type ReminderItem } from "../reminders";

/**
 * Runs once when the app opens: schedules the phone alerts for the signed-in person's saved reminders
 * (including ones added on another device), and clears them when the person signs out. Renders nothing.
 * The Reminder screen keeps the alerts up to date after that.
 */
export default function ReminderScheduler() {
  const { user, ready } = useAuth();
  const [items, , status] = useAccountData<ReminderItem[]>("reminder", []);
  const done = useRef(false);

  useEffect(() => {
    if (status === "ready" && !done.current) {
      done.current = true;
      void syncReminders(items);
    }
  }, [items, status]);

  useEffect(() => {
    if (ready && !user) void cancelAllReminders();
  }, [ready, user]);

  return null;
}
