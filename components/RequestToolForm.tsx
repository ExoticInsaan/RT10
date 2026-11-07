"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/tools/ui";
import { Field, inputClass } from "@/components/tools/kit";
import { useTr } from "@/lib/tools/useTr";

const NAME_MAX = 100;
const DETAILS_MAX = 1000;

/**
 * "Request a tool" form on the Contact page. Saves into the table tool_requests (see supabase/migrations/0007).
 * People must be signed in (the table only accepts signed-in people, and each person can read only their own requests).
 */
export default function RequestToolForm() {
  const tr = useTr();
  const { user, ready, openSignIn } = useAuth();
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const trimmedName = name.trim();
  const canSend = trimmedName.length >= 2 && status !== "sending";

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!canSend) return;
    setStatus("sending");
    try {
      const { error } = await createClient()
        .from("tool_requests")
        .insert({ tool_name: trimmedName, details: details.trim() || null });
      if (error) throw error;
      setName("");
      setDetails("");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="request-a-tool" aria-labelledby="request-title" className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-card">
      <h2 id="request-title" className="m-0 text-xl font-extrabold text-navy">
        {tr("Request a tool")}
      </h2>
      <p className="mb-5 mt-1 text-sm leading-6 text-muted">
        {tr("Tell us the small job you keep doing the hard way. The most-asked tools get built first.")}
      </p>

      {!ready ? (
        <p className="m-0 text-sm text-muted">{tr("Loading…")}</p>
      ) : !user ? (
        <div>
          <p className="mb-4 mt-0 text-sm leading-6 text-slate-700">
            {tr("Sign in with Google (one tap, free) so we can keep your request and avoid spam.")}
          </p>
          <Button onClick={openSignIn}>{tr("Continue with Google")}</Button>
        </div>
      ) : status === "sent" ? (
        <div role="status">
          <p className="m-0 text-base font-bold text-navy">{tr("Thank you, we got your request.")}</p>
          <p className="mb-4 mt-1 text-sm leading-6 text-muted">{tr("We read every one. Have another idea?")}</p>
          <Button variant="secondary" onClick={() => setStatus("idle")}>
            {tr("Send another request")}
          </Button>
        </div>
      ) : (
        <form onSubmit={send} className="grid gap-4">
          <Field label={tr("What should the tool be called?")} hint={tr("For example: Resume maker, or Photo to 50 KB.")}>
            <input
              className={inputClass}
              value={name}
              maxLength={NAME_MAX}
              onChange={(e) => setName(e.target.value)}
              placeholder={tr("Tool name")}
              autoComplete="off"
            />
          </Field>
          <Field label={tr("What should it do? (optional)")} hint={tr("What would you type or upload, and what result do you want?")}>
            <textarea
              className={`${inputClass} h-28 py-3`}
              value={details}
              maxLength={DETAILS_MAX}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={tr("Tell us more")}
            />
          </Field>
          {status === "error" && (
            <p role="alert" className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {tr("We could not send that. Please try again, or email us instead.")}
            </p>
          )}
          <div>
            <Button type="submit" disabled={!canSend}>
              {status === "sending" ? tr("Sending…") : tr("Send request")}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
