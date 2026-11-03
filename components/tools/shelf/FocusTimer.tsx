"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/tools/ui";
import { NumberField, Segmented, readStored, toNumber, writeStored } from "@/components/tools/kit";

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
  // Text typed into the clock when the person taps it to change the length of this session type. null = not editing.
  const [timeEdit, setTimeEdit] = useState<string | null>(null);
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
        new Notification(phase === "focus" ? "Focus session done. Take a break." : "Break's over. Back to it.", { icon: "/icon.png" });
      } catch {
        /* notifications unavailable */
      }
    }
    setTimeEdit(null);
    setPhase(next);
    setEndAt(null);
    setRemaining(lengthOf(next));
  }, [phase, round, settings.rounds, doneToday, notify, lengthOf]);

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
        document.title = `${clock(left)} · ${names[phase]}`;
      }
    };
    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [endAt, phase, finish]);

  const running = endAt !== null;
  const total = lengthOf(phase);
  const progress = 1 - remaining / total;

  function switchTo(next: Phase) {
    setTimeEdit(null);
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

  // Tapping the clock changes the length of the current session type (Focus, Short break or Long break).
  const limits: Record<Phase, number> = { focus: 180, short: 60, long: 90 };
  const typedMinutes = timeEdit === null ? NaN : toNumber(timeEdit);
  const typedValid = Number.isInteger(typedMinutes) && typedMinutes >= 1 && typedMinutes <= limits[phase];

  function startTimeEdit() {
    setEndAt(null); // pause first: the length is not something to change while it counts down
    setEditing(false);
    setTimeEdit(String(settings[phase]));
  }

  function saveTime() {
    if (!typedValid) return;
    const next = { ...settings, [phase]: typedMinutes };
    setSettings(next);
    writeStored(SETTINGS_KEY, next);
    setDraft((d) => ({ ...d, [phase]: String(typedMinutes) })); // keep the "Change times" form in step
    setRemaining(typedMinutes * 60_000);
    setEndAt(null);
    setTimeEdit(null);
  }

  const ring = 2 * Math.PI * 120;

  return (
    <div className="mx-auto grid max-w-xl justify-items-center gap-6">
      <Segmented
        label="Session type"
        value={phase}
        onChange={switchTo}
        options={(["focus", "short", "long"] as Phase[]).map((p) => ({ value: p, label: names[p] }))}
      />

      <div className="relative grid size-64 place-items-center sm:size-72">
        <svg viewBox="0 0 260 260" className="pointer-events-none absolute inset-0 size-full -rotate-90" aria-hidden="true">
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
          {timeEdit === null ? (
            <>
              <button
                type="button"
                onClick={startTimeEdit}
                aria-label={`${names[phase]} is ${settings[phase]} minutes. Tap to change it.`}
                className="cursor-pointer rounded-2xl border-0 bg-transparent px-3 py-1 transition hover:bg-blue-soft focus-visible:bg-blue-soft"
              >
                <span className="block text-6xl font-extrabold tracking-tight tabular-nums text-navy sm:text-7xl" role="timer">
                  {clock(remaining)}
                </span>
              </button>
              <p className="m-0 mt-1 text-sm font-semibold text-muted">
                {phase === "focus" ? `Session ${round} of ${settings.rounds}` : names[phase]}
              </p>
              <p className="m-0 mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-hover">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
                </svg>
                Tap the time to change it
              </p>
            </>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                saveTime();
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") setTimeEdit(null);
              }}
            >
              <div className="flex items-baseline justify-center gap-1.5">
                <input
                  autoFocus
                  onFocus={(event) => event.target.select()}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  aria-label={`${names[phase]} length in minutes`}
                  value={timeEdit}
                  onChange={(event) => setTimeEdit(event.target.value.replace(/\D/g, "").slice(0, 3))}
                  className={`w-28 rounded-xl border-2 bg-white py-0.5 text-center text-6xl font-extrabold tabular-nums text-navy outline-none sm:text-7xl ${
                    typedValid ? "border-blue" : "border-red-400"
                  }`}
                />
                <span className="text-lg font-bold text-muted">min</span>
              </div>
              <p className={`m-0 mt-1 text-xs font-semibold ${typedValid ? "text-muted" : "text-red-600"}`}>
                {typedValid ? `${names[phase]} length` : `Enter 1 to ${limits[phase]} minutes`}
              </p>
              <div className="mt-2 flex justify-center gap-2">
                <button
                  type="submit"
                  disabled={!typedValid}
                  className="min-h-10 cursor-pointer rounded-full border-0 bg-blue-hover px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setTimeEdit(null)}
                  className="min-h-10 cursor-pointer rounded-full border border-line bg-white px-4 text-sm font-bold text-navy"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button className="min-w-36" onClick={() => setEndAt(running ? null : Date.now() + remaining)}>
          {running ? "Pause" : remaining < total ? "Resume" : "Start"}
        </Button>
        <Button variant="secondary" onClick={() => switchTo(phase)}>
          Reset
        </Button>
        <Button variant="ghost" onClick={() => finish(false)}>
          Skip
        </Button>
      </div>

      <p className="m-0 text-sm text-muted">
        {doneToday === 0 ? "No focus sessions finished today yet." : `${doneToday} focus session${doneToday === 1 ? "" : "s"} finished today.`}
      </p>

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
        <button type="button" onClick={() => {
            setTimeEdit(null);
            setEditing(!editing);
          }} className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-blue-hover underline-offset-4 hover:underline">
          {editing ? "Close settings" : "Change times"}
        </button>
        {typeof Notification !== "undefined" && !notify && (
          <button
            type="button"
            onClick={() => Notification.requestPermission().then((p) => setNotify(p === "granted"))}
            className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-blue-hover underline-offset-4 hover:underline"
          >
            Notify me when time&apos;s up
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
          <NumberField label="Focus" value={draft.focus} onChange={(v) => setDraft({ ...draft, focus: v })} min={1} max={180} step={1} suffix="min" />
          <NumberField label="Short break" value={draft.short} onChange={(v) => setDraft({ ...draft, short: v })} min={1} max={60} step={1} suffix="min" />
          <NumberField label="Long break" value={draft.long} onChange={(v) => setDraft({ ...draft, long: v })} min={1} max={90} step={1} suffix="min" />
          <NumberField label="Sessions before a long break" value={draft.rounds} onChange={(v) => setDraft({ ...draft, rounds: v })} min={1} max={12} step={1} />
          <Button type="submit" className="col-span-2">
            Save times
          </Button>
        </form>
      )}
      <p className="m-0 max-w-md text-center text-xs leading-5 text-muted">
        Keep this tab open. The timer keeps time when you switch tabs and plays a chime when a session ends.
      </p>
    </div>
  );
}
