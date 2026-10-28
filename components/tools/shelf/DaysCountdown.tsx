"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/tools/ui";
import { Field, Hint, inputClass, readStored, writeStored } from "@/components/tools/kit";
import ToolIcon from "@/components/tools/ToolIcon";

type Countdown = { id: string; title: string; date: string };
const KEY = "toppershelf-countdowns";

/** Whole calendar days from today to the date (YYYY-MM-DD), in the visitor's own time zone. Negative once passed. */
export function daysUntil(date: string, now = new Date()) {
  const [y, m, d] = date.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86_400_000);
}

const pretty = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

const todayIso = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export default function DaysCountdown() {
  // Tools only render in the browser, so saved data can be read straight away.
  const [items, setItems] = useState<Countdown[]>(() => readStored<Countdown[]>(KEY, []));
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => writeStored(KEY, items), [items]);
  // Refresh each minute so a countdown left open overnight rolls over at midnight.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  function add() {
    if (!title.trim()) return setError("Give the countdown a name, like “Physics exam”.");
    if (!date) return setError("Pick a date.");
    setItems((current) =>
      [...current, { id: crypto.randomUUID(), title: title.trim().slice(0, 60), date }].sort((a, b) => a.date.localeCompare(b.date)),
    );
    setTitle("");
    setDate("");
    setError("");
  }

  const [next, ...rest] = items.filter((item) => daysUntil(item.date, now) >= 0);
  const past = items.filter((item) => daysUntil(item.date, now) < 0);

  return (
    <div className="mx-auto grid max-w-3xl gap-8">
      <form
        className="grid gap-4 sm:grid-cols-[1fr_12rem_auto] sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <Field label="What are you counting down to?">
          <input className={inputClass} value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Physics exam" />
        </Field>
        <Field label="Date">
          <input className={inputClass} type="date" min={todayIso()} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Button type="submit">Add countdown</Button>
      </form>
      {error && <Hint error>{error}</Hint>}

      {items.length === 0 ? (
        <Hint>Your countdowns appear here and stay saved in this browser.</Hint>
      ) : (
        <div className="grid gap-4">
          {next && <Big item={next} days={daysUntil(next.date, now)} onRemove={() => setItems(items.filter((i) => i.id !== next.id))} />}
          {[...rest, ...past].length > 0 && (
            <ul className="m-0 grid list-none gap-2 p-0">
              {[...rest, ...past].map((item) => {
                const days = daysUntil(item.date, now);
                return (
                  <li key={item.id} className="flex items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4">
                    <span className="min-w-16 text-2xl font-extrabold tabular-nums text-navy">{Math.abs(days)}</span>
                    <span className="flex-1">
                      <span className="block font-bold text-navy">{item.title}</span>
                      <span className="block text-sm text-muted">
                        {days < 0 ? `${Math.abs(days)} day${days === -1 ? "" : "s"} ago` : `days to go`} · {pretty(item.date)}
                      </span>
                    </span>
                    <RemoveButton title={item.title} onClick={() => setItems(items.filter((i) => i.id !== item.id))} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Big({ item, days, onRemove }: { item: Countdown; days: number; onRemove: () => void }) {
  const weeks = Math.floor(days / 7);
  return (
    <div className="relative rounded-3xl bg-navy p-6 text-white sm:p-8" aria-live="polite">
      <div className="absolute right-4 top-4">
        <RemoveButton title={item.title} onClick={onRemove} dark />
      </div>
      <p className="m-0 text-sm font-semibold text-slate-300">Next up</p>
      <h3 className="m-0 mt-1 pr-10 text-2xl font-extrabold">{item.title}</h3>
      <p className="m-0 mt-6 text-7xl font-extrabold tracking-tight tabular-nums">{days === 0 ? "Today" : days}</p>
      {days > 0 && (
        <p className="m-0 mt-1 text-lg text-slate-300">
          day{days === 1 ? "" : "s"} to go{weeks > 0 && ` · ${weeks} week${weeks === 1 ? "" : "s"}${days % 7 ? ` and ${days % 7} day${days % 7 === 1 ? "" : "s"}` : ""}`}
        </p>
      )}
      <p className="m-0 mt-4 text-sm text-slate-400">{pretty(item.date)}</p>
    </div>
  );
}

function RemoveButton({ title, onClick, dark = false }: { title: string; onClick: () => void; dark?: boolean }) {
  return (
    <button
      type="button"
      aria-label={`Remove ${title}`}
      onClick={onClick}
      className={`grid size-10 cursor-pointer place-items-center rounded-full border-0 bg-transparent transition ${
        dark ? "text-slate-300 hover:bg-white/10 hover:text-white" : "text-muted hover:bg-surface hover:text-navy"
      }`}
    >
      <ToolIcon name="close" size={18} />
    </button>
  );
}
