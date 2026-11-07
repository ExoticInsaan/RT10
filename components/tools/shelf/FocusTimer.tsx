"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/tools/ui";
import { NumberField, Segmented, readStored, toNumber, writeStored } from "@/components/tools/kit";
import { useTr } from "@/lib/tools/useTr";

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

// The "Change times" form works in whole minutes. Seconds are set by tapping the clock, and a length that has seconds is
// shown here as its whole minutes with a note, so nothing is hidden.
type Draft = Record<keyof Settings, string>;
const minutesText = (seconds: number) => String(Math.floor(seconds / 60));
const draftFrom = (s: Settings): Draft => ({
  focus: minutesText(s.focus),
  short: minutesText(s.short),
  long: minutesText(s.long),
  rounds: String(s.rounds),
});
// Three-digit minutes (100 and up) are one character wider, so the digits get a size smaller to stay inside the ring.
const digitSize = (small: boolean) => (small ? "text-5xl sm:text-6xl" : "text-6xl sm:text-7xl");
// Leaves the browser's own full screen too, when the page was able to enter it (not every phone or app view allows that).
function leaveBrowserFullscreen() {
  try {
    if (document.fullscreenElement) void document.exitFullscreen();
  } catch {
    /* nothing to leave */
  }
}

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
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [draft, setDraft] = useState<Draft>(() => draftFrom(settings));
  const [formError, setFormError] = useState("");
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
  // Full screen view: a big clock with Start/Pause and a minimize button. The timer itself keeps running underneath.
  const [fullscreen, setFullscreen] = useState(false);
  const usedBrowserFullscreen = useRef(false);
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
        new Notification(phase === "focus" ? tr("Focus session done. Take a break.") : tr("Break's over. Back to it."), { icon: "/icon.png" });
      } catch {
        /* notifications unavailable */
      }
    }
    setTimeEdit(null);
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
    setTimeEdit(null);
    setEndAt(null);
    setPhase(next);
    setRemaining(lengthOf(next));
  }

  // Shown under a field whose length has seconds (set on the clock), so the form never hides them. Information only.
  const secondsNote = (p: Phase) => (settings[p] % 60 === 0 ? undefined : tr("Now {time}", { time: `${Math.floor(settings[p] / 60)}:${pad(settings[p] % 60)}` }));

  function save() {
    const shown = draftFrom(settings);
    // A field the person did not touch keeps its exact length (including seconds set on the clock).
    const read = (p: Phase) => {
      if (draft[p] === shown[p]) return settings[p];
      const minutes = toNumber(draft[p]);
      return Number.isInteger(minutes) ? minutes * 60 : NaN; // whole minutes only here
    };
    const parsed: Settings = { focus: read("focus"), short: read("short"), long: read("long"), rounds: toNumber(draft.rounds) };
    const valid = (n: number, max: number) => Number.isInteger(n) && n >= 1 && n <= max;
    if (!valid(parsed.focus, limits.focus) || !valid(parsed.short, limits.short) || !valid(parsed.long, limits.long) || !valid(parsed.rounds, 12)) {
      setFormError(tr("Check the times: whole minutes only (Focus up to 180, Short break up to 60, Long break up to 90) and 1 to 12 sessions."));
      return;
    }
    setFormError("");
    setSettings(parsed);
    writeStored(SETTINGS_KEY, parsed);
    setEditing(false);
    setEndAt(null);
    setRemaining(parsed[phase] * 1000);
  }

  // Tapping the clock changes the length of the current session type (Focus, Short break or Long break).
  const typedSeconds = timeEdit === null ? NaN : Number(timeEdit.m || 0) * 60 + Number(timeEdit.s || 0);
  const typedProblem =
    timeEdit === null
      ? ""
      : Number(timeEdit.s || 0) > 59
        ? tr("Seconds must be 0 to 59")
        : typedSeconds < 1
          ? tr("Enter a time above 00:00")
          : typedSeconds > limits[phase]
            ? tr("Longest is {n} minutes", { n: limits[phase] / 60 })
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

  function openFullscreen() {
    setTimeEdit(null);
    setEditing(false);
    setFullscreen(true);
    try {
      const request = document.documentElement.requestFullscreen?.();
      if (request) {
        usedBrowserFullscreen.current = true;
        request.catch(() => {
          usedBrowserFullscreen.current = false; // not allowed here: the full screen view still covers the whole page
        });
      }
    } catch {
      usedBrowserFullscreen.current = false;
    }
  }

  function closeFullscreen() {
    setFullscreen(false);
    usedBrowserFullscreen.current = false;
    leaveBrowserFullscreen();
  }

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFullscreen(false);
        usedBrowserFullscreen.current = false;
        leaveBrowserFullscreen();
      }
    };
    // The person left the browser's full screen with the system gesture or Esc: close ours too.
    const onChange = () => {
      if (usedBrowserFullscreen.current && !document.fullscreenElement) {
        usedBrowserFullscreen.current = false;
        setFullscreen(false);
      }
    };
    // Keep the phone screen awake while the full screen clock is open, so it can be read from across a desk.
    // The browser drops this lock whenever the page is hidden, so it is asked for again when the page is back.
    let lock: WakeLockSentinel | null = null;
    let open = true;
    const keepAwake = async () => {
      try {
        if (!("wakeLock" in navigator) || document.visibilityState !== "visible" || (lock && !lock.released)) return;
        const sentinel = await navigator.wakeLock.request("screen");
        if (open) lock = sentinel;
        else void sentinel.release().catch(() => undefined);
      } catch {
        /* not allowed here (for example battery saver): the screen may dim as usual */
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void keepAwake();
    };
    void keepAwake();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      open = false;
      void lock?.release().catch(() => undefined);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fullscreen]);

  const ring = 2 * Math.PI * 120;
  // Diameter of the ring in the full screen view: as wide as the screen allows, but never so tall that it runs into the
  // top bar or the Start button (about 200px together), so short landscape screens stay clear too.
  const bigSize = "max(140px, min(84vw, calc(100dvh - 200px)))";

  return (
    <div className="mx-auto grid max-w-xl justify-items-center gap-6">
      <Segmented
        label={tr("Session type")}
        value={phase}
        onChange={switchTo}
        options={(["focus", "short", "long"] as Phase[]).map((p) => ({ value: p, label: tr(names[p]) }))}
      />

      <div className="relative grid size-64 place-items-center sm:size-72">
        <button
          type="button"
          onClick={openFullscreen}
          aria-label={tr("Full screen")}
          title={tr("Full screen")}
          className="absolute right-0 top-0 z-10 grid size-9 cursor-pointer place-items-center rounded-full border border-line bg-white text-navy shadow-sm transition hover:bg-blue-soft"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        </button>
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
                aria-label={tr("{name} is {time}. Tap to change it.", { name: tr(names[phase]), time: clock(settings[phase] * 1000) })}
                className="cursor-pointer rounded-2xl border-0 bg-transparent px-3 py-1 transition hover:bg-blue-soft focus-visible:bg-blue-soft"
              >
                <span className={`block font-extrabold tracking-tight tabular-nums text-navy underline decoration-blue-hover/40 decoration-dotted decoration-[3px] underline-offset-[12px] ${digitSize(clock(remaining).length > 5)}`} role="timer">
                  {clock(remaining)}
                </span>
              </button>
              <p className="m-0 mt-1 text-sm font-semibold text-muted">
                {phase === "focus" ? tr("Session {n} of {total}", { n: round, total: settings.rounds }) : tr(names[phase])}
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
              <div className="flex items-center justify-center" role="group" aria-label={tr("{name} length", { name: tr(names[phase]) })}>
                <input
                  autoFocus
                  onFocus={(event) => event.target.select()}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  aria-label={tr("Minutes")}
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
                  aria-label={tr("Seconds")}
                  value={timeEdit.s}
                  onChange={(event) => setTimeEdit({ ...timeEdit, s: event.target.value.replace(/\D/g, "").slice(0, 2) })}
                  style={{ width: "calc(2ch + 0.25rem)" }}
                  className={`rounded-lg bg-blue-soft px-0.5 py-0 text-center outline-none ring-2 ring-transparent focus:ring-blue font-extrabold tracking-tight tabular-nums text-navy ${digitSize(timeEdit.m.length >= 3)}`}
                />
              </div>
              <p className={`m-0 mt-1 text-xs font-semibold ${typedValid ? "text-muted" : "text-red-600"}`}>
                {typedValid ? tr("{name}: minutes and seconds", { name: tr(names[phase]) }) : typedProblem}
              </p>
              <div className="mt-2 flex justify-center gap-2">
                <button
                  type="submit"
                  disabled={!typedValid}
                  className="min-h-10 cursor-pointer rounded-full border-0 bg-blue-hover px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {tr("Save")}
                </button>
                <button
                  type="button"
                  onClick={() => setTimeEdit(null)}
                  className="min-h-10 cursor-pointer rounded-full border border-line bg-white px-4 text-sm font-bold text-navy"
                >
                  {tr("Cancel")}
                </button>
              </div>
            </form>
          )}
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
        <button type="button" onClick={() => {
            setTimeEdit(null);
            if (!editing) {
              setDraft(draftFrom(settings)); // start from the current times, including any set on the clock
              setFormError("");
            }
            setEditing(!editing);
          }} className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-blue-hover underline-offset-4 hover:underline">
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
          noValidate
          className="grid w-full grid-cols-2 gap-4 rounded-2xl bg-surface p-5"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <NumberField label={tr("Focus")} value={draft.focus} onChange={(v) => setDraft({ ...draft, focus: v })} max={180} step={1} suffix={tr("min")} hint={secondsNote("focus")} />
          <NumberField label={tr("Short break")} value={draft.short} onChange={(v) => setDraft({ ...draft, short: v })} max={60} step={1} suffix={tr("min")} hint={secondsNote("short")} />
          <NumberField label={tr("Long break")} value={draft.long} onChange={(v) => setDraft({ ...draft, long: v })} max={90} step={1} suffix={tr("min")} hint={secondsNote("long")} />
          <NumberField label={tr("Sessions before a long break")} value={draft.rounds} onChange={(v) => setDraft({ ...draft, rounds: v })} min={1} max={12} step={1} />
          {formError && <p className="col-span-2 m-0 text-sm font-semibold text-red-600">{formError}</p>}
          <Button type="submit" className="col-span-2">
            {tr("Save times")}
          </Button>
        </form>
      )}
      <p className="m-0 max-w-md text-center text-xs leading-5 text-muted">
        {tr("Keep this tab open. The timer keeps time when you switch tabs and plays a chime when a session ends.")}
      </p>

      {fullscreen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={tr("{name} timer, full screen", { name: tr(names[phase]) })}
            className="fixed inset-0 z-[1000] grid grid-rows-[auto_1fr_auto] bg-ivory px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="m-0 text-base font-bold text-muted">{phase === "focus" ? `Focus · Session ${round} of ${settings.rounds}` : names[phase]}</p>
              <button
                type="button"
                onClick={closeFullscreen}
                aria-label={tr("Minimize")}
                title={tr("Minimize")}
                className="grid size-11 cursor-pointer place-items-center rounded-full border border-line bg-white text-navy shadow-sm transition hover:bg-blue-soft"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 8h3a2 2 0 0 0 2-2V3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M21 16h-3a2 2 0 0 0-2 2v3" />
                </svg>
              </button>
            </div>
            <div className="grid place-items-center">
              <div className="relative grid place-items-center" style={{ width: bigSize, height: bigSize }}>
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
                <span
                  data-fullscreen-clock
                  className="font-extrabold leading-none tracking-tight tabular-nums text-navy"
                  style={{ fontSize: `calc(${bigSize} * ${clock(remaining).length > 5 ? 0.19 : 0.25})` }}
                >
                  {clock(remaining)}
                </span>
              </div>
            </div>
            <div className="flex justify-center">
              <Button className="min-w-44" onClick={() => setEndAt(running ? null : Date.now() + remaining)}>
                {running ? tr("Pause") : remaining < total ? tr("Resume") : tr("Start")}
              </Button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
