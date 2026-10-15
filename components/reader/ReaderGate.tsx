"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import AuthPanel from "@/components/AuthPanel";
import Button from "@/components/ui/Button";
import PdfViewer from "@/components/reader/PdfViewer";

const SUPPORT_EMAIL = "support@toppershelf.online";

type State =
  | { kind: "loading" }
  | { kind: "ready"; url: string; title: string; email: string }
  | { kind: "message"; heading: string; text: string; action: "product" | "browse" | "retry" | "none" };

function Notice({ heading, text, children }: { heading: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-lg rounded-lg border border-line bg-white p-6">
      <p className="m-0 text-lg font-semibold text-navy">{heading}</p>
      <p className="mb-4 mt-2 text-sm leading-relaxed text-muted">{text}</p>
      {children}
    </div>
  );
}

/** Decides what to show: sign in, "you have not bought this", an error, or the reader itself. */
export default function ReaderGate({ slug }: { slug: string }) {
  const { user, ready } = useAuth();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/read/${encodeURIComponent(slug)}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok) return setState({ kind: "ready", url: data.url, title: data.title, email: data.email });
        if (data.code === "not_owned")
          return setState({
            kind: "message",
            heading: "You have not bought this yet",
            text: "Buy it once and it stays in your library, ready to read on any device.",
            action: "product",
          });
        if (data.code === "not_found")
          return setState({
            kind: "message",
            heading: "We could not find this resource",
            text: "It may have been removed. You can look for something else in the shop.",
            action: "browse",
          });
        if (data.code === "file_missing")
          return setState({
            kind: "message",
            heading: "This PDF is not ready yet",
            text: `You own it, but the file is not uploaded yet. Please email ${SUPPORT_EMAIL} and we will fix it quickly.`,
            action: "none",
          });
        setState({
          kind: "message",
          heading: "We could not open this PDF",
          text: data.error ?? "Please try again in a moment.",
          action: "retry",
        });
      } catch {
        if (!cancelled)
          setState({
            kind: "message",
            heading: "We could not open this PDF",
            text: "Check your internet and try again.",
            action: "retry",
          });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, slug, attempt]);

  if (!ready) return <p className="text-muted">Loading…</p>;

  if (!user) {
    return (
      <div className="max-w-sm rounded-lg border border-line bg-white p-6">
        <AuthPanel next={`/read/${slug}`} />
      </div>
    );
  }

  if (state.kind === "loading") {
    return (
      <p className="flex items-center gap-3 py-10 text-muted" role="status">
        <span
          aria-hidden
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
        Checking your purchase…
      </p>
    );
  }

  if (state.kind === "message") {
    return (
      <Notice heading={state.heading} text={state.text}>
        {state.action === "product" && <Button href={`/p/${slug}`}>View this resource</Button>}
        {state.action === "browse" && <Button href="/browse">Browse resources</Button>}
        {state.action === "retry" && (
          <Button
            onClick={() => {
              setState({ kind: "loading" });
              setAttempt((n) => n + 1);
            }}
          >
            Try again
          </Button>
        )}
      </Notice>
    );
  }

  return <PdfViewer url={state.url} title={state.title} email={state.email} />;
}
