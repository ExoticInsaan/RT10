"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/tools/ui";
import { tools } from "@/lib/tools/registry";

/*
 * Admin dashboard. Everything here is protected by the database, not by this page:
 * - admin_stats() and the "read every tool request" rule only answer people listed in the app_admins table.
 * - Anyone else just gets "no access", whatever they type into the address bar.
 * It shows totals, anonymous tool-open counts and tool requests only, never people's saved flashcards, reminders or emails.
 */

type Stats = {
  users_total: number;
  users_7d: number;
  users_30d: number;
  signups_by_day: { day: string; count: number }[];
  requests_total: number;
  users_with_favourites: number;
  top_favourites: { tool: string; count: number }[];
  saved_data: { tool: string; users: number }[];
  friend_games: { game: string; links: number }[];
  friend_responses: number;
};

type Usage = { days: number; by_tool: { tool: string; opens: number; signed_in_opens: number; app_opens: number }[] };

type Request = { id: string; tool_name: string; details: string | null; created_at: string };

const toolName = (id: string) => tools.find((tool) => tool.id === id)?.name ?? id;
const dateText = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function Card({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <p className="m-0 text-sm font-semibold text-muted">{label}</p>
      <p className="mb-0 mt-1 text-3xl font-extrabold text-navy">{value}</p>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="m-0 text-xl font-extrabold text-navy">{title}</h2>
      {hint && <p className="mb-0 mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BarList({ rows, empty }: { rows: { label: string; value: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  if (rows.length === 0) return <p className="m-0 text-sm text-muted">{empty}</p>;
  return (
    <ul className="m-0 grid list-none gap-2 p-0">
      {rows.map((row) => (
        <li key={row.label} className="grid grid-cols-[minmax(0,10rem)_1fr_2.5rem] items-center gap-3 text-sm">
          <span className="truncate font-semibold text-navy">{row.label}</span>
          <span className="h-3 overflow-hidden rounded-full bg-blue-soft">
            <span className="block h-full rounded-full bg-blue" style={{ width: `${(row.value / max) * 100}%` }} />
          </span>
          <span className="text-right font-bold text-navy">{row.value}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AdminDashboard() {
  const { user, ready, openSignIn } = useAuth();
  const [state, setState] = useState<"idle" | "loading" | "denied" | "error" | "ok">("idle");
  const [stats, setStats] = useState<Stats | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  // null = tracking is not set up in the database yet (migration 0009), which should not break the rest of the page.
  const [usage, setUsage] = useState<Usage | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => {
    setState("loading");
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    let supabase;
    try {
      supabase = createClient();
    } catch {
      Promise.resolve().then(() => !cancelled && setState("error"));
      return () => {
        cancelled = true;
      };
    }
    Promise.all([
      supabase.rpc("admin_stats"),
      supabase.from("tool_requests").select("id, tool_name, details, created_at").order("created_at", { ascending: false }).limit(300),
      supabase.rpc("admin_tool_usage", { p_days: 30 }),
    ])
      .then(([statsResult, listResult, usageResult]) => {
        if (cancelled) return;
        if (statsResult.error) {
          const code = statsResult.error.code;
          setState(code === "42501" || /not allowed/i.test(statsResult.error.message) ? "denied" : "error");
          return;
        }
        if (listResult.error) {
          setState("error");
          return;
        }
        setStats(statsResult.data as Stats);
        setUsage(usageResult.error ? null : (usageResult.data as Usage));
        setRequests((listResult.data ?? []) as Request[]);
        setState("ok");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [user, reloadKey]);

  // The same tool asked for in different words or capitals is grouped, most-asked first.
  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; count: number; latest: string; details: string[] }>();
    for (const r of requests) {
      const key = r.tool_name.trim().toLowerCase();
      const entry = map.get(key) ?? { name: r.tool_name.trim(), count: 0, latest: r.created_at, details: [] };
      entry.count += 1;
      if (r.created_at > entry.latest) entry.latest = r.created_at;
      if (r.details?.trim()) entry.details.push(r.details.trim());
      map.set(key, entry);
    }
    return [...map.values()].sort((a, b) => b.count - a.count || (a.latest < b.latest ? 1 : -1));
  }, [requests]);

  if (!ready) return <p className="text-sm text-muted">Loading…</p>;

  if (!user) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <h1 className="m-0 text-2xl font-extrabold text-navy">Admin</h1>
        <p className="mb-4 mt-2 text-sm text-muted">Sign in with the admin account to continue.</p>
        <Button onClick={openSignIn}>Continue with Google</Button>
      </div>
    );
  }

  if (state === "idle" || state === "loading") return <p className="text-sm text-muted">Loading…</p>;

  if (state === "denied") {
    return (
      <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <h1 className="m-0 text-2xl font-extrabold text-navy">No access</h1>
        <p className="mb-0 mt-2 text-sm text-muted">This account is not an admin.</p>
      </div>
    );
  }

  if (state === "error" || !stats) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p role="alert" className="m-0 text-sm text-red-700">Could not load the numbers. Please try again.</p>
        <div className="mt-4"><Button onClick={reload}>Try again</Button></div>
      </div>
    );
  }

  const days = stats.signups_by_day;
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="eyebrow">Only you can see this</span>
          <h1 className="mb-0 mt-3 text-3xl font-extrabold tracking-tight text-navy">Admin</h1>
        </div>
        <Button variant="secondary" onClick={reload}>Refresh</Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card label="People signed up" value={stats.users_total} />
        <Card label="New in 7 days" value={stats.users_7d} />
        <Card label="New in 30 days" value={stats.users_30d} />
        <Card label="Tool requests" value={stats.requests_total} />
      </div>

      <Section
        title="Most opened tools, last 30 days"
        hint={
          usage
            ? `${usage.by_tool.reduce((n, r) => n + r.opens, 0)} opens in total (once per tool per visit). ${usage.by_tool.reduce((n, r) => n + r.app_opens, 0)} of them in the Android app.`
            : undefined
        }
      >
        {usage === null ? (
          <p className="m-0 text-sm text-muted">Usage tracking is not set up yet. Run supabase/migrations/0009_tool_events.sql once in the Supabase SQL editor.</p>
        ) : (
          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            <BarList rows={usage.by_tool.slice(0, 12).map((r) => ({ label: toolName(r.tool), value: r.opens }))} empty="No opens recorded yet." />
            <div>
              <p className="mb-3 mt-0 text-sm font-semibold text-navy">Opened without signing in</p>
              <BarList
                rows={usage.by_tool
                  .map((r) => ({ label: toolName(r.tool), value: r.opens - r.signed_in_opens }))
                  .filter((r) => r.value > 0)
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 12)}
                empty="Nothing yet."
              />
              <p className="mb-0 mt-3 text-xs text-muted">These visitors saw the sign-in prompt. Someone who then signs in is counted in both lists.</p>
            </div>
          </div>
        )}
      </Section>

      <Section title="Tool requests" hint="The same tool asked for more than once is grouped. Build the most-asked first.">
        {grouped.length === 0 ? (
          <p className="m-0 text-sm text-muted">No requests yet.</p>
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {grouped.map((g) => (
              <li key={g.name.toLowerCase()} className="rounded-2xl border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="m-0 text-base font-bold text-navy">{g.name}</p>
                  <p className="m-0 shrink-0 text-sm text-muted">
                    <span className="font-bold text-navy">{g.count}</span> {g.count === 1 ? "request" : "requests"} · last {dateText(g.latest)}
                  </p>
                </div>
                {g.details.slice(0, 3).map((d, i) => (
                  <p key={i} className="mb-0 mt-2 text-sm leading-6 text-slate-700">“{d}”</p>
                ))}
                {g.details.length > 3 && <p className="mb-0 mt-2 text-xs text-muted">+ {g.details.length - 3} more notes</p>}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="New sign-ups, last 14 days" hint="Days with no sign-ups are not shown.">
        {days.length === 0 ? (
          <p className="m-0 text-sm text-muted">No sign-ups in the last 14 days.</p>
        ) : (
          <div className="flex h-32 items-end gap-2 rounded-2xl border border-line bg-white p-4">
            {days.map((d) => (
              <div key={d.day} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                <span className="text-xs font-bold text-navy">{d.count}</span>
                <span className="w-full rounded-t-md bg-blue" style={{ height: `${(d.count / maxDay) * 60}px`, minHeight: 4 }} />
                <span className="text-[10px] text-muted">{dateText(d.day)}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="grid gap-x-8 sm:grid-cols-2">
        <Section title="Most favourited tools" hint={`${stats.users_with_favourites} ${stats.users_with_favourites === 1 ? "person has" : "people have"} saved favourites.`}>
          <BarList rows={stats.top_favourites.map((r) => ({ label: toolName(r.tool), value: r.count }))} empty="No favourites yet." />
        </Section>
        <Section title="People with saved data" hint="How many people saved something in each tool.">
          <BarList rows={stats.saved_data.map((r) => ({ label: toolName(r.tool), value: r.users }))} empty="Nothing saved yet." />
        </Section>
      </div>

      <Section title="Friend games" hint={`${stats.friend_responses} answers from friends so far.`}>
        <BarList rows={stats.friend_games.map((r) => ({ label: toolName(r.game), value: r.links }))} empty="No friend links yet." />
      </Section>

      <p className="mt-10 text-xs text-muted">
        Totals only. This page never shows emails, flashcards, reminders or anything people typed into a tool.
      </p>
    </>
  );
}
