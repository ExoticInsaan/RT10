"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/tools/ui";
import { NumberField, Segmented, readStored, toNumber, writeStored } from "@/components/tools/kit";

type Phase = "focus" | "short" | "long";
// focus, short and long are lengths in SECONDS, so the clock can be set to any minutes and seconds.
type Settings = { focus: number; short: number; long: number; rounds: number };

const SETTINGS_KEY = "toppershelf-focus-settings-v2";
const OLD_SETTINGS_KEY = "toppershelf-focus-settings"; // the first version saved whole minutes
const LOG_KEY = "toppershelf-focus-log";
const defaults: Settings = { focus: 25 * 60, short: 5 * 60, long: 15 * 60, rounds: 4 };
const limits: Record<"focus" | "short" | "long", number> = { focus: 180 * 60, short: 60 * 60, long: 90 * 60 };

function loadSettings(): Settings {
  const saved = readStored<Partial<Settings>>(SETTINGS_KEY, {});
  if (Object.keys(saved).length > 0) return { ...defaults, ...saved };
  // Carry over times saved by the first version (whole minutes) so nobody loses their setup.
  const old = readStored<Partial<Settings>>(OLD_SETTINGS_KEY, {});
  return {
    focus: (old.focus ?? 25) * 60,
    short: (old.short ?? 5) * 60,
    long: (old.long ?? 15) * 60,
    rounds: old.rounds ?? defaults.rounds,
  };
}
const pad = (n: number) => String(n).padStart(2, "0");
// Three-digit minutes (100 and up) are one character wider, so the digits get a size smaller to stay inside the ring.
const digitSize = (small: boolean) => (small ? "text-5xl sm:text-6xl" : "text-6xl sm:text-7xl");
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
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [roundsDraft, setRoundsDraft] = useState(() => String(settings.rounds));
  const [phase, setPhase] = useState<Phase>("focus");
  const [round, setRound] = useState(1);
  const [remaining, setRemaining] = useState(() => settings.focus * 1000);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [doneToday, setDoneToday] = useState(() => {
    const log = readStored<{ day: string; count: number }>(LOG_KEY, { day: "", count: 0 });
    return log.day === todayKey() ? log.count : 0;
  });
  const [editing, setEditing] = useState(false);
  // Minutes and seconds typed into the clock when the person taps it. null = not editing.
  const [timeEdit, setTimeEdit] = useState<{ m: string; s: string } | null>(null);
  const secondsInput = useRef<HTMLInputElement>(null);
  const [notify, setNotify] = useState(() => typeof Notification !== "undefined" && Notification.permission === "granted");
  const originalTitle = useRef("");

  useEffect(() => {
    originalTitle.current = document.title;
    return () => {
      document.title = originalTitle.current;
    };
  }, []);

  const lengthOf = useCallback((p: Phase) => settings[p] * 1000, [settings]);

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
    const rounds = toNumber(roundsDraft);
    if (!Number.isInteger(rounds) || rounds < 1 || rounds > 12) return;
    const next = { ...settings, rounds };
    setSettings(next);
    writeStored(SETTINGS_KEY, next);
    setEditing(false);
  }

  // Tapping the clock changes the length of the current session type (Focus, Short break or Long break).
  const typedSeconds = timeEdit === null ? NaN : Number(timeEdit.m || 0) * 60 + Number(timeEdit.s || 0);
  const typedProblem =
    timeEdit === null
      ? ""
      : Number(timeEdit.s || 0) > 59
        ? "Seconds must be 0 to 59"
        : typedSeconds < 1
          ? "Enter a time above 00:00"
          : typedSeconds > limits[phase]
            ? `Longest is ${limits[phase] / 60} minutes`
            : "";
  const typedValid = timeEdit !== null && typedProblem === "";

  function startTimeEdit() {
    setEndAt(null); // pause first: the length is not something to change while it counts down
    setEditing(false);
    setTimeEdit({ m: pad(Math.floor(settings[phase] / 60)), s: pad(settings[phase] % 60) });
  }

  function saveTime() {
    if (!typedValid) return;
    const next = { ...settings, [phase]: typedSeconds };
    setSettings(next);
    writeStored(SETTINGS_KEY, next);
    setRemaining(typedSeconds * 1000);
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
                aria-label={`${names[phase]} is ${clock(settings[phase] * 1000)}. Tap to change it.`}
                className="cursor-pointer rounded-2xl border-0 bg-transparent px-3 py-1 transition hover:bg-blue-soft focus-visible:bg-blue-soft"
              >
                <span className={`block font-extrabold tracking-tight tabular-nums text-navy underline decoration-blue-hover/40 decoration-dotted decoration-[3px] underline-offset-[12px] ${digitSize(clock(remaining).length > 5)}`} role="timer">
                  {clock(remaining)}
                </span>
              </button>
              <p className="m-0 mt-1 text-sm font-semibold text-muted">
                {phase === "focus" ? `Session ${round} of ${settings.rounds}` : names[phase]}
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
              <div className="flex items-center justify-center" role="group" aria-label={`${names[phase]} length`}>
                <input
                  autoFocus
                  onFocus={(event) => event.target.select()}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  aria-label="Minutes"
                  value={timeEdit.m}
                  onChange={(event) => setTimeEdit({ ...timeEdit, m: event.target.value.replace(/\D/g, "").slice(0, 3) })}
                  onKeyDown={(event) => {
                    if (event.key === ":" || event.key === ".") {
                      event.preventDefault();
                      secondsInput.current?.focus();
                    }
                  }}
                  style={{ width: `calc(${Math.max(2, timeEdit.m.length)}ch + 0.25rem)` }}
                  className={`rounded-lg bg-blue-soft px-0.5 py-0 text-center outline-none ring-2 ring-transparent focus:ring-blue font-extrabold tracking-tight tabular-nums text-navy ${digitSize(timeEdit.m.length >= 3)}`}
                />
                <span className={`font-extrabold tracking-tight tabular-nums text-navy ${digitSize(timeEdit.m.length >= 3)}`} aria-hidden="true">:</span>
                <input
                  ref={secondsInput}
                  onFocus={(event) => event.target.select()}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  aria-label="Seconds"
                  value={timeEdit.s}
                  onChange={(event) => setTimeEdit({ ...timeEdit, s: event.target.value.replace(/\D/g, "").slice(0, 2) })}
                  style={{ width: "calc(2ch + 0.25rem)" }}
                  className={`rounded-lg bg-blue-soft px-0.5 py-0 text-center outline-none ring-2 ring-transparent focus:ring-blue font-extrabold tracking-tight tabular-nums text-navy ${digitSize(timeEdit.m.length >= 3)}`}
                />
              </div>
              <p className={`m-0 mt-1 text-xs font-semibold ${typedValid ? "text-muted" : "text-red-600"}`}>
                {typedValid ? `${names[phase]}: minutes and seconds` : typedProblem}
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
          {editing ? "Close settings" : "Session settings"}
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
          className="grid w-full gap-4 rounded-2xl bg-surface p-5"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <NumberField label="Sessions before a long break" value={roundsDraft} onChange={setRoundsDraft} min={1} max={12} step={1} />
          <Button type="submit">Save</Button>
        </form>
      )}
      <p className="m-0 max-w-md text-center text-xs leading-5 text-muted">
        Keep this tab open. The timer keeps time when you switch tabs and plays a chime when a session ends.
      </p>
    </div>
  );
}
