import { useEffect, useState } from "react";
import ToolIcon from "@/components/tools/ToolIcon";
import { Button } from "@/components/tools/ui";
import { Field, Hint, inputClass } from "@/components/tools/kit";
import { useAccountData } from "@/lib/tools/useAccountData";
import { allowReminders, remindersAllowed, syncReminders, type ReminderItem } from "../reminders";

/**
 * The Reminder tool for the Android app. Same saved list as the website (so reminders follow the account),
 * but each reminder is scheduled as a real phone notification and there are no calendar buttons.
 */
const when = (ms: number) =>
  new Date(ms).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

function relative(ms: number, now: number) {
  const minutes = Math.round((ms - now) / 60_000);
  const abs = Math.abs(minutes);
  const text = abs < 60 ? `${abs} min` : abs < 48 * 60 ? `${Math.round(abs / 60)} h` : `${Math.round(abs / 1440)} days`;
  return minutes >= 0 ? `in ${text}` : `${text} ago`;
}

const localInputValue = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function AppReminder() {
  const [items, setItems, status] = useAccountData<ReminderItem[]>("reminder", []);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [at, setAt] = useState("");
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Keep "in 5 min" fresh and move reminders to Past once their time has come.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, []);

  // Make the phone's alerts match the list whenever it loads or changes.
  useEffect(() => {
    if (status === "ready") void syncReminders(items);
  }, [items, status]);

  // Tell the person if Android notifications are off.
  useEffect(() => {
    void remindersAllowed().then((ok) => setBlocked(!ok));
  }, []);

  async function add() {
    if (!title.trim()) return setError("Write what to remind you about.");
    const time = at ? new Date(at).getTime() : NaN;
    if (!Number.isFinite(time)) return setError("Pick a date and time.");
    if (time <= Date.now()) return setError("Pick a time in the future.");
    const ok = await allowReminders();
    setBlocked(!ok);
    const item: ReminderItem = { id: crypto.randomUUID(), title: title.trim().slice(0, 80), note: note.trim().slice(0, 300), at: time, fired: false };
    setItems([...items, item].sort((a, b) => a.at - b.at));
    setTitle("");
    setNote("");
    setAt("");
    setError("");
  }

  const isPast = (i: ReminderItem) => i.fired || i.at <= now;
  const upcoming = items.filter((i) => !isPast(i));
  const done = items.filter(isPast);

  if (status === "loading") return <p className="m-0 py-16 text-center text-sm text-muted">Loading your reminders…</p>;
  if (status === "error") return <p className="m-0 py-16 text-center text-sm text-muted">Could not load your reminders. Check your internet and try again.</p>;

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6">
      <form
        className="grid grid-cols-1 gap-4 rounded-2xl bg-surface p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <Field label="Remind me to">
          <input className={inputClass} value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pay exam fee" />
        </Field>
        <Field label="When">
          <input className={inputClass} type="datetime-local" min={localInputValue(new Date())} value={at} onChange={(e) => setAt(e.target.value)} />
        </Field>
        <Field label="Note">
          <input className={inputClass} value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="Optional, e.g. last date, link or amount" />
        </Field>
        <Button type="submit">Add reminder</Button>
      </form>
      {error && <Hint error>{error}</Hint>}
      {blocked && (
        <Hint error>Notifications are off, so reminders cannot alert you. Turn them on in Android Settings → Apps → TopperShelf → Notifications.</Hint>
      )}

      {items.length === 0 ? (
        <Hint>Your reminders appear here. TopperShelf alerts you with a notification at the time you pick.</Hint>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {upcoming.length > 0 && <List title="Coming up" items={upcoming} now={now} onRemove={(id) => setItems(items.filter((i) => i.id !== id))} />}
          {done.length > 0 && <List title="Past" items={[...done].reverse()} now={now} past onRemove={(id) => setItems(items.filter((i) => i.id !== id))} />}
        </div>
      )}
    </div>
  );
}

function List({ title, items, now, past = false, onRemove }: { title: string; items: ReminderItem[]; now: number; past?: boolean; onRemove: (id: string) => void }) {
  return (
    <section>
      <h3 className="mb-3 mt-0 text-base font-bold text-navy">{title}</h3>
      <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0">
        {items.map((i) => (
          <li key={i.id} className={`rounded-2xl border border-line bg-white px-5 py-4 ${past ? "opacity-70" : ""}`}>
            <div className="flex items-start gap-3">
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-navy">{i.title}</span>
                <span className="block text-sm text-muted">
                  {when(i.at)} · {relative(i.at, now)}
                </span>
                {i.note && <span className="mt-1 block text-sm text-slate-700">{i.note}</span>}
              </span>
              <button
                type="button"
                aria-label={`Delete ${i.title}`}
                onClick={() => onRemove(i.id)}
                className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-muted hover:bg-surface hover:text-navy"
              >
                <ToolIcon name="close" size={17} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
