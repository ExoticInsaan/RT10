"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = "choose" | "code";

export default function AuthPanel({
  next = "/",
  onDone,
}: {
  next?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function getClient() {
    try {
      return createClient();
    } catch {
      setError("Sign-in is not set up yet. Please try again later.");
      return null;
    }
  }

  async function withGoogle() {
    setError("");
    const supabase = getClient();
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = getClient();
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = getClient();
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    setBusy(false);
    if (error) {
      setError("That code did not work. Check it and try again.");
      return;
    }
    if (onDone) onDone();
    else router.push(next);
  }

  return (
    <div>
      <h2 className="text-center text-xl font-bold text-slate-900">
        {step === "choose" ? "Sign in to continue" : "Enter your code"}
      </h2>
      <p className="mt-1 text-center text-sm text-slate-600">
        {step === "choose"
          ? "No password needed. Your purchases are saved to your account."
          : `We sent a code to ${email}. It may take a minute.`}
      </p>

      {step === "choose" ? (
        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={withGoogle}
            disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-4 py-3 font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
              <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={sendCode} className="space-y-3">
            <label className="block text-sm font-medium text-slate-700" htmlFor="auth-email">
              Email address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              placeholder="you@example.com"
            />
            <button
              type="submit"
              disabled={busy || !email}
              className="w-full rounded-full bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              Continue with email
            </button>
          </form>
        </div>
      ) : (
        <form onSubmit={verifyCode} className="mt-5 space-y-3">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={10}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            placeholder="123456"
          />
          <button
            type="submit"
            disabled={busy || code.length < 6}
            className="w-full rounded-full bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            Verify and continue
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("choose");
              setCode("");
              setError("");
            }}
            className="w-full text-sm font-medium text-teal-700"
          >
            Use a different email
          </button>
        </form>
      )}

      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="underline">Terms of Use</Link> and{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>, and confirm that you are 18 or older,
        or a parent or guardian using this account for your child.
      </p>
    </div>
  );
}
