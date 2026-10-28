"use client";

import { useEffect, useRef, useState } from "react";
import ToolIcon from "@/components/tools/ToolIcon";
import { Button } from "@/components/tools/ui";
import { Field, Hint, downloadBlob, inputClass, readStored, writeStored } from "@/components/tools/kit";

type Item = { id: string; title: string; note: string; at: number; fired: boolean };
const KEY = "toppershelf-reminders";

/** 2026-10-28T04:00:00.000Z → 20261028T040000Z (the UTC format both calendars accept). */
const utcStamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Escapes text for an .ics file: backslash, semicolon, comma and line breaks. */
const icsText = (value: string) => value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

export function buildIcs(item: Pick<Item, "id" | "title" | "note" | "at">, now = Date.now()) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TopperShelf//Reminder//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${item.id}@toppershelf.online`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${utcStamp(item.at)}`,
    `DTEND:${utcStamp(item.at + 15 * 60_000)}`,
    `SUMMARY:${icsText(item.title)}`,
    ...(item.note ? [`DESCRIPTION:${icsText(item.note)}`] : []),
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsText(item.title)}`,
    "TRIGGER:PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function googleCalendarLink(item: Pick<Item, "title" | "note" | "at">) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: item.title,
    dates: `${utcStamp(item.at)}/${utcStamp(item.at + 15 * 60_000)}`,
    details: item.note ? `${item.note}\n\nSet with TopperShelf` : "Set with TopperShelf",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

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

export default function Reminder() {
  const [items, setItems] = useState<Item[]>(() => readStored<Item[]>(KEY, []));
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [at, setAt] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [due, setDue] = useState<Item[]>([]);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(() =>
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );

  useEffect(() => writeStored(KEY, items), [items]);

  // While this page is open, check every 15 seconds and alert for anything that has come due.
  // The latest list is read from a ref so the check itself never runs inside a state update.
  const itemsRef = useRef<Item[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    const check = () => {
      const t = Date.now();
      setNow(t);
      const fresh = itemsRef.current.filter((i) => !i.fired && i.at <= t);
      if (!fresh.length) return;
      const ids = new Set(fresh.map((i) => i.id));
      itemsRef.current = itemsRef.current.map((i) => (ids.has(i.id) ? { ...i, fired: true } : i));
      setItems(itemsRef.current);
      setDue((shown) => [...fresh, ...shown]);
      for (const i of fresh) {
        try {
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(i.title, { body: i.note || "Reminder from TopperShelf", icon: "/icon.png" });
          }
        } catch {
          /* notifications unavailable */
        }
      }
    };
    check();
    const timer = setInterval(check, 15_000);
    return () => clearInterval(timer);
  }, []);

  function add() {
    if (!title.trim()) return setError("Write what to remind you about.");
    const time = at ? new Date(at).getTime() : NaN;
    if (!Number.isFinite(time)) return setError("Pick a date and time.");
    if (time <= Date.now()) return setError("Pick a time in the future.");
    const item = { id: crypto.randomUUID(), title: title.trim().slice(0, 80), note: note.trim().slice(0, 300), at: time, fired: false };
    setItems([...items, item].sort((a, b) => a.at - b.at));
    setTitle("");
    setNote("");
    setAt("");
    setError("");
    if (permission === "default") {
      Notification.requestPermission().then(setPermission);
    }
  }

  const upcoming = items.filter((i) => !i.fired);
  const done = items.filter((i) => i.fired);

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      {due.length > 0 && (
        <div className="grid gap-2" role="alert">
          {due.map((i) => (
            <div key={i.id} className="flex items-center gap-3 rounded-2xl bg-amber-100 px-5 py-4">
              <span className="text-2xl" aria-hidden="true">⏰</span>
              <span className="flex-1">
                <span className="block font-bold text-navy">{i.title}</span>
                {i.note && <span className="block text-sm text-slate-700">{i.note}</span>}
              </span>
              <button
                type="button"
                onClick={() => setDue(due.filter((d) => d.id !== i.id))}
                className="cursor-pointer rounded-lg border-0 bg-white px-3 py-1.5 text-sm font-bold text-navy"
              >
                Done
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        className="grid gap-4 rounded-2xl bg-surface p-5 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <Field label="Remind me to">
          <input className={inputClass} value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pay exam fee" />
        </Field>
        <Field label="When">
          <input className={inputClass} type="datetime-local" min={localInputValue(new Date())} value={at} onChange={(e) => setAt(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Note">
            <input className={inputClass} value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="Optional, e.g. last date, link or amount" />
          </Field>
        </div>
        <Button type="submit" className="sm:col-span-2 sm:justify-self-start">
          Add reminder
        </Button>
      </form>
      {error && <Hint error>{error}</Hint>}

      <p className="m-0 rounded-2xl border border-line bg-white px-5 py-4 text-sm leading-6 text-slate-700">
        <strong className="text-navy">Want an alert even when this site is closed?</strong> Use <em>Google Calendar</em> or{" "}
        <em>Phone calendar</em> on a reminder. Your phone&apos;s calendar then alerts you at that time. Inside TopperShelf, alerts
        only show while this page is open.
        {permission === "denied" && " Notifications are blocked for this site in your browser settings."}
      </p>

      {items.length === 0 ? (
        <Hint>Your reminders appear here and stay saved in this browser.</Hint>
      ) : (
        <div className="grid gap-6">
          {upcoming.length > 0 && <List title="Coming up" items={upcoming} now={now} onRemove={(id) => setItems(items.filter((i) => i.id !== id))} />}
          {done.length > 0 && (
            <List title="Past" items={[...done].reverse()} now={now} past onRemove={(id) => setItems(items.filter((i) => i.id !== id))} />
          )}
        </div>
      )}
    </div>
  );
}

function List({ title, items, now, past = false, onRemove }: { title: string; items: Item[]; now: number; past?: boolean; onRemove: (id: string) => void }) {
  return (
    <section>
      <h3 className="mb-3 mt-0 text-base font-bold text-navy">{title}</h3>
      <ul className="m-0 grid list-none gap-2 p-0">
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
            {!past && (
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={googleCalendarLink(i)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center rounded-lg bg-blue-soft px-3 text-sm font-semibold text-blue-hover hover:bg-blue-hover hover:text-white"
                >
                  Google Calendar
                </a>
                <button
                  type="button"
                  onClick={() => downloadBlob(new Blob([buildIcs(i)], { type: "text/calendar" }), "reminder.ics")}
                  className="inline-flex min-h-9 cursor-pointer items-center rounded-lg border-0 bg-surface px-3 text-sm font-semibold text-navy hover:bg-line"
                >
                  Phone calendar (.ics)
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
