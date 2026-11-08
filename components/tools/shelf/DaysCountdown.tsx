"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/tools/ui";
import { Field, Hint, inputClass } from "@/components/tools/kit";
import { useAccountData } from "@/lib/tools/useAccountData";
import ToolIcon from "@/components/tools/ToolIcon";
import { useLocale, useTr } from "@/lib/tools/useTr";

type Countdown = { id: string; title: string; date: string };

/** Whole calendar days from today to the date (YYYY-MM-DD), in the visitor's own time zone. Negative once passed. */
export function daysUntil(date: string, now = new Date()) {
  const [y, m, d] = date.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86_400_000);
}

const pretty = (date: string, locale: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "long", year: "numeric" });

const todayIso = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export default function DaysCountdown() {
  const tr = useTr();
  const locale = useLocale();
  const [items, setItems, status] = useAccountData<Countdown[]>("days-countdown", []);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => new Date());

  // Refresh each minute so a countdown left open overnight rolls over at midnight.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Tells anything listening (the Android app keeps its home-screen widget up to date) the saved countdowns. The website ignores it.
  useEffect(() => {
    if (status === "ready") window.dispatchEvent(new CustomEvent("toppershelf:countdowns", { detail: items }));
  }, [items, status]);

  function add() {
    if (!title.trim()) return setError(tr("Give the countdown a name, like “Physics exam”."));
    if (!date) return setError(tr("Pick a date."));
    setItems(
      [...items, { id: crypto.randomUUID(), title: title.trim().slice(0, 60), date }].sort((a, b) => a.date.localeCompare(b.date)),
    );
    setTitle("");
    setDate("");
    setError("");
  }

  const [next, ...rest] = items.filter((item) => daysUntil(item.date, now) >= 0);
  const past = items.filter((item) => daysUntil(item.date, now) < 0);

  if (status === "loading") return <p className="m-0 py-16 text-center text-sm text-muted">{tr("Loading your countdowns…")}</p>;
  if (status === "error") return <p className="m-0 py-16 text-center text-sm text-muted">{tr("Could not load your countdowns. Please refresh the page.")}</p>;

  return (
    <div className="mx-auto grid grid-cols-1 max-w-3xl gap-8">
      <form
        className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_12rem_auto] sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <Field label={tr("What are you counting down to?")}>
          <input className={inputClass} value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} placeholder={tr("e.g. Physics exam")} />
        </Field>
        <Field label={tr("Date")}>
          <input className={inputClass} type="date" min={todayIso()} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Button type="submit">{tr("Add countdown")}</Button>
      </form>
      {error && <Hint error>{error}</Hint>}

      {items.length === 0 ? (
        <Hint>{tr("Your countdowns appear here and are saved to your account.")}</Hint>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {next && <Big item={next} days={daysUntil(next.date, now)} onRemove={() => setItems(items.filter((i) => i.id !== next.id))} />}
          {[...rest, ...past].length > 0 && (
            <ul className="m-0 grid grid-cols-1 list-none gap-2 p-0">
              {[...rest, ...past].map((item) => {
                const days = daysUntil(item.date, now);
                return (
                  <li key={item.id} className="flex items-center gap-4 rounded-2xl border border-line bg-card px-5 py-4">
                    <span className="min-w-16 text-2xl font-extrabold tabular-nums text-navy">{Math.abs(days)}</span>
                    <span className="flex-1">
                      <span className="block font-bold text-navy">{item.title}</span>
                      <span className="block text-sm text-muted">
                        {days < 0 ? tr(days === -1 ? "{n} day ago" : "{n} days ago", { n: Math.abs(days) }) : tr("days to go")} · {pretty(item.date, locale)}
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
  const tr = useTr();
  const locale = useLocale();
  const weeks = Math.floor(days / 7);
  const leftover = days % 7;
  const weeksText = tr(weeks === 1 ? "{n} week" : "{n} weeks", { n: weeks });
  const extra = leftover
    ? tr("{weeks} and {days}", { weeks: weeksText, days: tr(leftover === 1 ? "{n} day" : "{n} days", { n: leftover }) })
    : weeksText;
  return (
    <div className="relative rounded-3xl bg-deep p-6 text-white sm:p-8" aria-live="polite">
      <div className="absolute right-4 top-4">
        <RemoveButton title={item.title} onClick={onRemove} dark />
      </div>
      <p className="m-0 text-sm font-semibold text-slate-300">{tr("Next up")}</p>
      <h3 className="m-0 mt-1 pr-10 text-2xl font-extrabold">{item.title}</h3>
      <p className="m-0 mt-6 text-7xl font-extrabold tracking-tight tabular-nums">{days === 0 ? tr("Today") : days}</p>
      {days > 0 && (
        <p className="m-0 mt-1 text-lg text-slate-300">
          {tr(days === 1 ? "day to go" : "days to go")}
          {weeks > 0 && ` · ${extra}`}
        </p>
      )}
      <p className="m-0 mt-4 text-sm text-slate-400">{pretty(item.date, locale)}</p>
    </div>
  );
}

function RemoveButton({ title, onClick, dark = false }: { title: string; onClick: () => void; dark?: boolean }) {
  const tr = useTr();
  return (
    <button
      type="button"
      aria-label={tr("Remove {title}", { title })}
      onClick={onClick}
      className={`grid size-10 cursor-pointer place-items-center rounded-full border-0 bg-transparent transition ${
        dark ? "text-slate-300 hover:bg-white/10 hover:text-white" : "text-muted hover:bg-surface hover:text-navy"
      }`}
    >
      <ToolIcon name="close" size={18} />
    </button>
  );
}
