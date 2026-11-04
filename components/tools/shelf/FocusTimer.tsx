"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/tools/ui";
import { NumberField, Segmented, readStored, toNumber, writeStored } from "@/components/tools/kit";
import { useTr } from "@/lib/tools/useTr";

type Phase = "focus" | "short" | "long";
type Settings = { focus: number; short: number; long: number; rounds: number };

const SETTINGS_KEY = "toppershelf-focus-settings";
const LOG_KEY = "toppershelf-focus-log";
const defaults: Settings = { focus: 25, short: 5, long: 15, rounds: 4 };
const names: Record<Phase, string> = { focus: "Focus", short: "Short break", long: "Long break" };

const todayKey = () => new Date().toDateString();
const clock = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

/** Three soft beeps, made in the browser, so there is no sound file to download. */
function chime() {
  try {
    const ctx = new AudioContext();
    [0, 0.35, 0.7].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.32);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {
    /* no audio available */
  }
}

export default function FocusTimer() {
  const tr = useTr();
  // Tools only render in the browser, so saved settings and today's count can be read straight away.
  const [settings, setSettings] = useState<Settings>(() => ({ ...defaults, ...readStored<Partial<Settings>>(SETTINGS_KEY, {}) }));
  const [draft, setDraft] = useState<Record<keyof Settings, string>>(() => ({
    focus: String(settings.focus),
    short: String(settings.short),
    long: String(settings.long),
    rounds: String(settings.rounds),
  }));
  const [phase, setPhase] = useState<Phase>("focus");
  const [round, setRound] = useState(1);
  const [remaining, setRemaining] = useState(() => settings.focus * 60_000);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [doneToday, setDoneToday] = useState(() => {
    const log = readStored<{ day: string; count: number }>(LOG_KEY, { day: "", count: 0 });
    return log.day === todayKey() ? log.count : 0;
  });
  const [editing, setEditing] = useState(false);
  const [notify, setNotify] = useState(() => typeof Notification !== "undefined" && Notification.permission === "granted");
  const originalTitle = useRef("");

  useEffect(() => {
    originalTitle.current = document.title;
    return () => {
      document.title = originalTitle.current;
    };
  }, []);

  const lengthOf = useCallback((p: Phase) => settings[p] * 60_000, [settings]);

  // `completed` is false when the person presses Skip: no chime, and a skipped focus session isn't counted.
  const finish = useCallback((completed: boolean) => {
    if (completed) chime();
    let next: Phase;
    if (phase === "focus") {
      if (completed) {
        const count = doneToday + 1;
        setDoneToday(count);
        writeStored(LOG_KEY, { day: todayKey(), count });
      }
      next = round >= settings.rounds ? "long" : "short";
    } else {
      next = "focus";
      setRound(phase === "long" ? 1 : round + 1);
    }
    if (completed && notify) {
      try {
        new Notification(phase === "focus" ? tr("Focus session done. Take a break.") : tr("Break's over. Back to it."), { icon: "/icon.png" });
      } catch {
        /* notifications unavailable */
      }
    }
    setPhase(next);
    setEndAt(null);
    setRemaining(lengthOf(next));
  }, [phase, round, settings.rounds, doneToday, notify, lengthOf, tr]);

  // Tells anything listening (the Android app schedules a phone notification for the end time) when the timer starts or stops.
  // The website has no listener, so nothing happens there.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("toppershelf:focus-timer", { detail: { endAt, phase } }));
  }, [endAt, phase]);
  useEffect(
    () => () => {
      window.dispatchEvent(new CustomEvent("toppershelf:focus-timer", { detail: { endAt: null, phase: "focus" } }));
    },
    [],
  );

  // Count against the clock, not by counting ticks, so the time stays right when the tab sleeps.
  useEffect(() => {
    if (endAt === null) {
      document.title = originalTitle.current || document.title;
      return;
    }
    const tick = () => {
      const left = endAt - Date.now();
      if (left <= 0) finish(true);
      else {
        setRemaining(left);
        document.title = `${clock(left)} · ${tr(names[phase])}`;
      }
    };
    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [endAt, phase, finish, tr]);

  const running = endAt !== null;
  const total = lengthOf(phase);
  const progress = 1 - remaining / total;

  function switchTo(next: Phase) {
    setEndAt(null);
    setPhase(next);
    setRemaining(lengthOf(next));
  }

  function save() {
    const parsed = {
      focus: toNumber(draft.focus),
      short: toNumber(draft.short),
      long: toNumber(draft.long),
      rounds: toNumber(draft.rounds),
    };
    const valid = (n: number, max: number) => Number.isInteger(n) && n >= 1 && n <= max;
    if (!valid(parsed.focus, 180) || !valid(parsed.short, 60) || !valid(parsed.long, 90) || !valid(parsed.rounds, 12)) return;
    setSettings(parsed);
    writeStored(SETTINGS_KEY, parsed);
    setEditing(false);
    setEndAt(null);
    setRemaining(parsed[phase] * 60_000);
  }

  const ring = 2 * Math.PI * 120;

  return (
    <div className="mx-auto grid max-w-xl justify-items-center gap-6">
      <Segmented
        label={tr("Session type")}
        value={phase}
        onChange={switchTo}
        options={(["focus", "short", "long"] as Phase[]).map((p) => ({ value: p, label: tr(names[p]) }))}
      />

      <div className="relative grid size-64 place-items-center sm:size-72">
        <svg viewBox="0 0 260 260" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
          <circle cx="130" cy="130" r="120" fill="none" stroke="currentColor" strokeWidth="10" className="text-surface" />
          <circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            stroke="currentColor"
            className={phase === "focus" ? "text-blue-hover" : "text-emerald-500"}
            strokeDasharray={ring}
            strokeDashoffset={ring * (1 - progress)}
          />
        </svg>
        <div className="text-center" aria-live="off">
          <p className="m-0 text-6xl font-extrabold tracking-tight tabular-nums text-navy sm:text-7xl" role="timer">
            {clock(remaining)}
          </p>
          <p className="m-0 mt-1 text-sm font-semibold text-muted">
            {phase === "focus" ? tr("Session {n} of {total}", { n: round, total: settings.rounds }) : tr(names[phase])}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button className="min-w-36" onClick={() => setEndAt(running ? null : Date.now() + remaining)}>
          {running ? tr("Pause") : remaining < total ? tr("Resume") : tr("Start")}
        </Button>
        <Button variant="secondary" onClick={() => switchTo(phase)}>
          {tr("Reset")}
        </Button>
        <Button variant="ghost" onClick={() => finish(false)}>
          {tr("Skip")}
        </Button>
      </div>

      <p className="m-0 text-sm text-muted">
        {doneToday === 0
          ? tr("No focus sessions finished today yet.")
          : tr(doneToday === 1 ? "{n} focus session finished today." : "{n} focus sessions finished today.", { n: doneToday })}
      </p>

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
        <button type="button" onClick={() => setEditing(!editing)} className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-blue-hover underline-offset-4 hover:underline">
          {editing ? tr("Close settings") : tr("Change times")}
        </button>
        {typeof Notification !== "undefined" && !notify && (
          <button
            type="button"
            onClick={() => Notification.requestPermission().then((p) => setNotify(p === "granted"))}
            className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-blue-hover underline-offset-4 hover:underline"
          >
            {tr("Notify me when time's up")}
          </button>
        )}
      </div>

      {editing && (
        <form
          className="grid w-full grid-cols-2 gap-4 rounded-2xl bg-surface p-5"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <NumberField label={tr("Focus")} value={draft.focus} onChange={(v) => setDraft({ ...draft, focus: v })} min={1} max={180} step={1} suffix={tr("min")} />
          <NumberField label={tr("Short break")} value={draft.short} onChange={(v) => setDraft({ ...draft, short: v })} min={1} max={60} step={1} suffix={tr("min")} />
          <NumberField label={tr("Long break")} value={draft.long} onChange={(v) => setDraft({ ...draft, long: v })} min={1} max={90} step={1} suffix={tr("min")} />
          <NumberField label={tr("Sessions before a long break")} value={draft.rounds} onChange={(v) => setDraft({ ...draft, rounds: v })} min={1} max={12} step={1} />
          <Button type="submit" className="col-span-2">
            {tr("Save times")}
          </Button>
        </form>
      )}
      <p className="m-0 max-w-md text-center text-xs leading-5 text-muted">
        {tr("Keep this tab open. The timer keeps time when you switch tabs and plays a chime when a session ends.")}
      </p>
    </div>
  );
}
