"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import AuthPanel from "@/components/AuthPanel";
import { createClient } from "@/lib/supabase/client";
import { NAME_MAX, checkName, cleanName, firstName, googleName, safeNext } from "@/lib/profile";

const AUTO_MS = 3200; // how long the hello screen stays before going on (keep in sync with ts-fill below)

const card = "w-full rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8";
const rise = "[animation:ts-rise_.6s_ease_both] motion-reduce:[animation:none]";

type Step = "name" | "hello";

export default function WelcomeFlow() {
  const router = useRouter();
  const { user, ready, profile, profileReady, setProfile } = useAuth();
  const [next, setNext] = useState("/");
  const [edit, setEdit] = useState(false);
  const [paramsRead, setParamsRead] = useState(false);
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [prefilled, setPrefilled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Where to go afterwards, and whether this is "change my name" instead of the first welcome.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    Promise.resolve().then(() => {
      setNext(safeNext(q.get("next"), "/"));
      setEdit(q.get("edit") === "1");
      setParamsRead(true);
    });
  }, []);

  // Start the box with the student's saved name, or the name Google gave us.
  useEffect(() => {
    if (!profileReady || !user || prefilled) return;
    const start = cleanName(profile?.name ?? "") || googleName(user.user_metadata);
    Promise.resolve().then(() => {
      setName(start);
      setPrefilled(true);
    });
  }, [profileReady, user, profile, prefilled]);

  // Someone who has already been welcomed does not need this page (unless they came to change their name).
  useEffect(() => {
    if (!paramsRead || !profileReady || edit || step !== "name" || !profile?.welcomedAt) return;
    router.replace(next);
  }, [paramsRead, profileReady, edit, step, profile, next, router]);

  // The hello screen carries on by itself after a few seconds.
  useEffect(() => {
    if (step !== "hello") return;
    const t = setTimeout(() => router.push(next), AUTO_MS);
    return () => clearTimeout(t);
  }, [step, next, router]);

  async function save(skip: boolean) {
    if (!user) return;
    setError("");
    const clean = cleanName(name);
    if (!skip) {
      const problem = checkName(name);
      if (problem) {
        setError(problem);
        return;
      }
    }
    setBusy(true);
    const supabase = createClient();
    const welcomedAt = profile?.welcomedAt ?? new Date().toISOString();
    const fields = skip ? { welcomed_at: welcomedAt } : { name: clean, welcomed_at: welcomedAt };

    const updated = await supabase.from("profiles").update(fields).eq("id", user.id).select("id");
    let failure = updated.error?.message ?? "";
    if (!failure && !updated.data?.length) {
      // No profile row yet: create it.
      const created = await supabase.from("profiles").insert({ id: user.id, ...fields });
      failure = created.error?.message ?? "";
    }
    setBusy(false);
    if (failure) {
      setError("We could not save that. Please check your internet and try again.");
      return;
    }
    setProfile({ name: skip ? (profile?.name ?? null) : clean, welcomedAt });
    if (skip || edit) router.push(next);
    else setStep("hello");
  }

  // ---- gates ----
  if (!ready || (user && !profileReady) || !paramsRead) {
    return <p className="mx-auto text-muted">Loading…</p>;
  }
  if (!user) {
    return (
      <div className={card}>
        <p className="mb-4 text-center text-sm text-muted">Sign in to set up your profile.</p>
        <AuthPanel next="/welcome" />
      </div>
    );
  }

  // ---- step 2: hello ----
  if (step === "hello") {
    const hi = firstName(profile?.name);
    return (
      <div className={`${card} overflow-hidden text-center`} role="status" aria-live="polite">
        <div className={`mx-auto mb-4 inline-block origin-[70%_70%] text-6xl [animation:ts-wave_1.8s_ease-in-out_.5s_1_both] motion-reduce:[animation:none]`} aria-hidden="true">
          👋
        </div>
        <h1 className={`font-display text-4xl leading-tight text-navy ${rise}`}>Hi, {hi}!</h1>
        <p className={`mt-3 text-lg font-semibold text-navy ${rise} [animation-delay:.25s]`}>Welcome to Toppershelf</p>
        <p className={`mt-1 text-[15px] text-muted ${rise} [animation-delay:.45s]`}>
          Everything you need for your nursing exams, in one place.
        </p>
        <button
          type="button"
          onClick={() => router.push(next)}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-navy px-5 text-[14px] font-semibold text-white hover:opacity-90"
        >
          Let&apos;s go
        </button>
        <div className="mt-5 h-1 overflow-hidden rounded-full bg-surface" aria-hidden="true">
          <div className="h-full rounded-full bg-blue [animation:ts-fill_3.2s_linear_both]" />
        </div>
      </div>
    );
  }

  // ---- step 1: name ----
  return (
    <form
      className={card}
      onSubmit={(e) => {
        e.preventDefault();
        void save(false);
      }}
      noValidate
    >
      <Image src="/logo-icon.png" alt="" width={156} height={160} className="mx-auto mb-4 h-12 w-auto" priority />
      <h1 className="text-center font-display text-3xl leading-tight text-navy">
        {edit ? "Change your name" : "Welcome to Toppershelf"}
      </h1>
      <p className="mt-2 text-center text-[15px] text-muted">
        {edit ? "This is how we greet you on the site." : "Before you start: what should we call you?"}
      </p>

      <label htmlFor="display-name" className="mt-6 block text-sm font-semibold text-navy">
        Your name
      </label>
      <input
        id="display-name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (error) setError("");
        }}
        maxLength={NAME_MAX}
        autoComplete="name"
        autoFocus
        placeholder="e.g. Priya"
        aria-invalid={Boolean(error)}
        aria-describedby="display-name-help"
        className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/30"
      />
      <p id="display-name-help" className="mt-1.5 text-xs text-muted">
        We&apos;ll use this to greet you. You can change it any time.
      </p>
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-navy px-5 text-[15px] font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Saving…" : edit ? "Save name" : "Continue"}
      </button>
      <div className="mt-3 text-center">
        {edit ? (
          <button type="button" onClick={() => router.push(next)} className="text-sm font-medium text-muted hover:text-navy">
            Cancel
          </button>
        ) : (
          <button type="button" disabled={busy} onClick={() => void save(true)} className="text-sm font-medium text-muted hover:text-navy">
            Skip for now
          </button>
        )}
      </div>
    </form>
  );
}
