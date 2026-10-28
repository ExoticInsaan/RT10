"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import CardWhatAmI from "@/components/fun/cards/CardWhatAmI";
import CardActions from "@/components/fun/CardActions";
import { GameShell, copyText, useTimers } from "@/components/fun/kit";
import { createLink, getLink, latestLink, linkLabel, linkUrl, listResponses, nativeShare, submitResponse, whatsappHref } from "@/lib/fun/friends";

type Phase = "loading" | "missing" | "create" | "share" | "friend" | "sent" | "inbox";
type Answer = { l: number; note: string; name: string };

const LABELS = [
  { t: "Best friend", c: "#ec4899", e: "#be185d", top: "#f9a8d4", icon: "M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.9 4.5c2.1 0 3.9 1.2 5.1 3 1.2-1.8 3-3 5.1-3 3.9 0 6 3.9 4.5 7.3C19.5 16.4 12 21 12 21z" },
  { t: "Sibling vibe", c: "#f59e0b", e: "#b45309", top: "#fcd34d", icon: "M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6" },
  { t: "Chaos partner", c: "#ef4444", e: "#b91c1c", top: "#fca5a5", icon: "M13 2L4 14h7l-1 8 9-12h-7z" },
  { t: "Study buddy", c: "#3b82f6", e: "#1d4ed8", top: "#93c5fd", icon: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7" },
  { t: "Therapist", c: "#14b8a6", e: "#0f766e", top: "#5eead4", icon: "M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.6A8 8 0 1 1 21 12z" },
  { t: "Meme supplier", c: "#8b5cf6", e: "#6d28d9", top: "#c4b5fd", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" },
  { t: "Food partner", c: "#f97316", e: "#c2410c", top: "#fdba74", icon: "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9" },
  { t: "Mystery", c: "#475569", e: "#1e293b", top: "#94a3b8", icon: "M9 9a3 3 0 1 1 4 2.8c-.6.3-1 .9-1 1.6V14M12 18h.01" },
];
const ROT = [-4, 3, -2, 5, 3, -5, 2, -3];
const NOTE_BGS = ["#fef08a", "#fbcfe8", "#bfdbfe", "#bbf7d0", "#fed7aa"];
const NOTE_ROT = [-3, 2, -1.5, 3];
const fzBtn =
  "min-h-14 w-full cursor-pointer rounded-[18px] border-0 bg-[#8b5cf6] px-[18px] py-3.5 text-[17px] font-black text-white shadow-[0_6px_0_#6d28d9,0_14px_24px_rgba(109,40,217,.3)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_2px_0_#6d28d9] disabled:cursor-default disabled:opacity-50";
const ghost =
  "min-h-[50px] cursor-pointer rounded-2xl border-2 border-[#ddd0fe] bg-white px-3 py-2.5 text-sm font-extrabold text-[#3b0764] shadow-[0_5px_0_#ddd0fe] active:translate-y-[3px] active:shadow-[0_2px_0_#ddd0fe] disabled:cursor-default";
const input =
  "box-border w-full rounded-2xl border-2 border-[#ddd0fe] bg-white px-4 py-3.5 text-base font-medium text-[#3b0764] outline-none placeholder:text-[#a592cf] focus:border-[#8b5cf6] focus:shadow-[0_0_0_4px_rgba(139,92,246,.15)]";

function Icon({ d, size, stroke = "#fff", sw = 2.2 }: { d: string; size: number; stroke?: string; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/**
 * Owner (signed in): makes a link and reads what friends call them. Friend (opens the link, no account): picks one label,
 * adds an optional note and sends it. `friendCode` switches to the friend side.
 */
export default function WhatAmI({ friendCode }: { friendCode?: string } = {}) {
  const { user, ready } = useAuth();
  const [rawPhase, setPhase] = useState<Phase>("loading");
  const [me, setMe] = useState("");
  const [friendName, setFriendName] = useState("");
  const [sel, setSel] = useState(-1);
  const [note, setNote] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [flying, setFlying] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const later = useTimers();
  const cardRef = useRef<HTMLDivElement>(null);

  // Friend side: who made this link?
  useEffect(() => {
    if (!friendCode) return;
    let cancelled = false;
    getLink(friendCode).then((r) => {
      if (cancelled) return;
      if (!r.ok) { setError(r.error); setPhase("missing"); return; }
      if (!r.data || r.data.game !== "what-am-i-to-you") { setPhase("missing"); return; }
      setMe(r.data.owner_name);
      setPhase("friend");
    });
    return () => { cancelled = true; };
  }, [friendCode]);

  // Owner side: find the link they already made.
  const userId = user?.id ?? null;
  // A signed-out owner has nothing to load, so they go straight to the first screen.
  const phase: Phase = rawPhase === "loading" && !friendCode && ready && !userId ? "create" : rawPhase;
  useEffect(() => {
    if (friendCode || !ready) return;
    if (!userId) return;
    let cancelled = false;
    latestLink("what-am-i-to-you").then((r) => {
      if (cancelled) return;
      if (r.ok && r.data) { setCode(r.data.code); setMe(r.data.owner_name); setPhase("share"); } else setPhase("create");
    });
    return () => { cancelled = true; };
  }, [friendCode, ready, userId]);

  const meName = me.trim() || "You";
  const url = code ? linkUrl("what-am-i-to-you", code) : "";
  const shareText = `What am I to you? Tell ${meName} what you really call them (one tap, with an optional note):`;
  const counts = LABELS.map((_, i) => answers.filter((a) => a.l === i).length);
  const max = Math.max(1, ...counts);
  const top = counts.indexOf(Math.max(...counts));
  const notes = answers
    .map((a, i) => ({ a, i }))
    .filter((x) => x.a.note)
    .map((x, j) => ({ text: `“${x.a.note}”`, label: `${LABELS[x.a.l].t.toUpperCase()} · ${x.a.name.toUpperCase()}`, bg: NOTE_BGS[x.i % 5], r: NOTE_ROT[j % 4], d: (j * 0.08).toFixed(2) }));

  async function makeLink() {
    if (busy || !me.trim()) return;
    setBusy(true);
    setError("");
    const r = await createLink("what-am-i-to-you", me);
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setCode(r.data);
    setAnswers([]);
    setPhase("share");
  }
  async function showInbox() {
    if (!code) return;
    setBusy(true);
    setError("");
    const r = await listResponses(code);
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setAnswers(r.data.map((x) => ({ l: Number(x.answers.l) || 0, note: String(x.answers.note ?? ""), name: x.responder_name })));
    setPhase("inbox");
  }
  async function send() {
    if (sel < 0 || flying || !friendCode || !friendName.trim()) return;
    setFlying(true);
    setError("");
    const r = await submitResponse(friendCode, friendName, { l: sel, note: note.trim() });
    later(() => {
      setFlying(false);
      if (!r.ok) { setError(r.error); return; }
      setPhase("sent");
    }, 850);
  }

  const shell = (p: { stage?: ReactNode; controls?: ReactNode; body?: ReactNode }) => (
    <GameShell
      gradient="linear-gradient(150deg,#8b5cf6 0%,#d946ef 50%,#fb7185 100%)"
      icon="/fun-zone/what-am-i-to-you.webp"
      iconBg="#dccefd"
      title="What Am I to You?"
      subtitle="Find out how your friends see you."
      status="FRIENDS"
      panelClass="bg-[#f3eeff] px-[22px] text-[#3b0764]"
      rootClass="bg-[#f3eeff]"
      {...p}
    />
  );
  const single = (children: ReactNode) => <div className="mx-auto flex w-full max-w-[34rem] flex-col gap-3.5 lg:col-span-2">{children}</div>;

  if (phase === "loading") return shell({ body: single(<p className="m-0 py-16 text-center text-[15px] font-bold text-[#5b3a86]" role="status">Loading…</p>) });

  if (phase === "missing") {
    return shell({
      body: single(
        <>
          <div className="flex flex-col items-center gap-3 rounded-[26px] bg-white p-[22px] text-center shadow-[0_6px_0_#ddd0fe]">
            <Image src="/mascot/owl-peek.webp" alt="" width={150} height={118} className="h-auto w-[150px]" />
            <div className="font-display text-[28px] leading-[1.1]">{error || "This link does not exist"}</div>
            <div className="text-[15px] leading-[1.4] text-[#5b3a86]">It may have been typed wrong. Ask your friend to send it again, or make your own.</div>
          </div>
          <Link className={`${fzBtn} flex items-center justify-center no-underline`} href="/tool/what-am-i-to-you">Make your own link</Link>
        </>,
      ),
    });
  }

  if (phase === "create") {
    return shell({
      stage: (
        <div className="grid grid-cols-4 gap-2 [perspective:600px]">
          {LABELS.map((l, i) => (
            <div
              key={l.t}
              className="flex h-[72px] animate-fz-pop items-center justify-center rounded-[18px]"
              style={{ background: l.c, boxShadow: `0 6px 0 ${l.e}`, animationDelay: `${(i * 0.06).toFixed(2)}s`, transform: `rotate(${ROT[i]}deg)` }}
            >
              <Icon d={l.icon} size={28} />
            </div>
          ))}
        </div>
      ),
      controls: (
        <>
          <div className="flex flex-col gap-2.5 rounded-[22px] bg-white p-[18px] shadow-[0_6px_0_#ddd0fe]">
            <div className="text-[15px] leading-[1.45] text-[#5b3a86]">Share your link. Friends pick one label for you, like best friend, sibling vibe or chaos partner, and can leave a note.</div>
            <label htmlFor="wa-me" className="text-sm font-bold text-[#5b3a86]">Your name</label>
            <input
              id="wa-me"
              className={input}
              value={me}
              onChange={(e) => setMe(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void makeLink()}
              placeholder="e.g. Ananya"
              maxLength={24}
              autoComplete="off"
            />
          </div>
          {error && <p role="alert" className="m-0 text-sm font-bold text-[#b91c1c]">{error}</p>}
          <button type="button" className={fzBtn} onClick={() => void makeLink()} disabled={!me.trim() || busy}>{busy ? "Making your link…" : "Make my link"}</button>
        </>
      ),
    });
  }

  if (phase === "share") {
    return shell({
      body: single(
        <>
          <div className="flex animate-fz-pop flex-col items-center gap-3.5 rounded-[26px] bg-white p-[22px] text-center shadow-[0_6px_0_#ddd0fe]">
            <Image src="/mascot/owl-peek.webp" alt="" width={150} height={118} className="h-auto w-[150px]" />
            <div className="break-words font-display text-[30px] leading-[1.05]">Your link is ready, {meName}!</div>
            <div className="text-[15px] leading-[1.4] text-[#5b3a86]">Send it to friends. Each one picks a label for you and can leave a note. You see them in your inbox.</div>
            <div className="box-border flex w-full items-center gap-2 rounded-[14px] border-2 border-dashed border-[#c4b5fd] bg-[#f8f4ff] px-3 py-2.5">
              <span className="min-w-0 flex-1 truncate text-left text-sm font-bold">{code ? linkLabel("what-am-i-to-you", code) : ""}</span>
              <button type="button" className={`${ghost} !min-h-10 !px-3 !py-1.5 !text-[13px]`} onClick={() => { copyText(url); setCopied(true); later(() => setCopied(false), 1600); }}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <CardWhatAmI cardRef={cardRef} data={{ owner: meName, link: code ? linkLabel("what-am-i-to-you", code).replace(/^www\./, "") : "" }} />
            <CardActions
              getNode={() => cardRef.current}
              fileName="what-am-i-to-you-toppershelf.png"
              shareText={shareText}
              shareUrl={url}
              btnClass={fzBtn}
              ghostClass={ghost}
            />
          </div>
          <a className={`${fzBtn} flex items-center justify-center no-underline !bg-[#25a244] !shadow-[0_6px_0_#17762f,0_14px_24px_rgba(23,118,47,.3)]`} href={whatsappHref(shareText, url)} target="_blank" rel="noopener">Send on WhatsApp</a>
          <button type="button" className={ghost} onClick={async () => { if (!(await nativeShare("What am I to you?", shareText, url))) { copyText(url); setCopied(true); later(() => setCopied(false), 1600); } }}>Share another way</button>
          <button type="button" className={fzBtn} onClick={() => void showInbox()} disabled={busy}>{busy ? "Loading…" : "Open my inbox"}</button>
          {error && <p role="alert" className="m-0 text-center text-sm font-bold text-[#b91c1c]">{error}</p>}
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" className={ghost} onClick={() => window.open(url, "_blank", "noopener")}>Preview as a friend</button>
            <button type="button" className={ghost} onClick={() => { setPhase("create"); setError(""); }}>New link</button>
          </div>
        </>,
      ),
    });
  }

  if (phase === "sent") {
    return shell({
      body: single(
        <>
          <div className="flex animate-fz-pop flex-col items-center gap-3 rounded-[26px] bg-white p-[22px] text-center shadow-[0_6px_0_#ddd0fe]">
            <Image src="/mascot/owl-peek.webp" alt="" width={150} height={118} className="h-auto w-[150px]" />
            <div className="break-words font-display text-[30px] leading-[1.05]">Sent to {meName}!</div>
            <div className="text-[15px] leading-[1.4] text-[#5b3a86]">They can see what you picked. Curious what your friends call you?</div>
          </div>
          <Link className={`${fzBtn} flex items-center justify-center no-underline`} href="/tool/what-am-i-to-you">Make your own link</Link>
          <button type="button" className={ghost} onClick={() => { setPhase("friend"); setSel(-1); setNote(""); }}>Change my answer</button>
        </>,
      ),
    });
  }

  if (phase === "friend") {
    return shell({
      body: single(
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-black tracking-[.12em] text-[#a21caf]">FRIEND VIEW</div>
              <div className="break-words font-display text-[26px] leading-[1.05]">What is {meName} to you?</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {LABELS.map((l, i) => {
              const on = sel === i;
              return (
                <button key={l.t} type="button" onClick={() => setSel(i)} aria-pressed={on} className="group h-[92px] min-w-0 cursor-pointer border-0 bg-transparent p-0 [perspective:500px]">
                  <span
                    className={`relative flex h-[84px] flex-col items-center justify-center gap-1.5 rounded-[20px] text-[11px] font-extrabold text-white transition-[transform,box-shadow] duration-[350ms] ease-[cubic-bezier(.3,1.6,.5,1)] [transform-style:preserve-3d] sm:text-[13px] ${on ? "-translate-y-2 scale-[1.06]" : "group-hover:-translate-y-[3px] group-hover:[transform:rotateX(14deg)]"}`}
                    style={{ background: l.c, boxShadow: `0 7px 0 ${l.e},0 12px 18px -8px rgba(59,7,100,.4)`, outline: on ? "3px solid #3b0764" : "none" }}
                  >
                    <Icon d={l.icon} size={26} />
                    <span className="px-0.5 text-center leading-[1.1] [overflow-wrap:anywhere]">{l.t}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <label htmlFor="wa-name" className="text-sm font-bold text-[#5b3a86]">Your name</label>
          <input id="wa-name" className={`${input} -mt-1.5`} value={friendName} onChange={(e) => setFriendName(e.target.value)} placeholder="e.g. Rohan" maxLength={24} autoComplete="off" />
          <label htmlFor="wa-note" className="text-sm font-bold text-[#5b3a86]">Add a note (optional)</label>
          <input id="wa-note" className={`${input} -mt-1.5`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="You always share your notes before exams" maxLength={70} autoComplete="off" />
          {error && <p role="alert" className="m-0 text-sm font-bold text-[#b91c1c]">{error}</p>}
          <div className="relative">
            {flying && <div className="absolute left-1/2 top-0 z-[3] -ml-10 h-14 w-20 animate-fz-fly rounded-xl" style={{ background: sel >= 0 ? LABELS[sel].c : "#8b5cf6" }} />}
            <button type="button" className={fzBtn} onClick={() => void send()} disabled={sel < 0 || flying || !friendName.trim()}>Send to {meName}</button>
          </div>
        </>,
      ),
    });
  }

  return shell({
    body: single(
      <>
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="break-words text-xs font-black tracking-[.12em] text-[#a21caf]">{meName.toUpperCase()}&apos;S INBOX</div>
            <div className="font-display text-[26px] leading-[1.05]">{answers.length ? `Mostly your ${LABELS[top].t.toLowerCase()}` : "Waiting for answers"}</div>
          </div>
          <div className="whitespace-nowrap text-[13px] font-extrabold text-[#6b21a8]">{answers.length} answers</div>
        </div>
        <div className="rounded-[22px] bg-white px-3 pb-2.5 pt-4 shadow-[0_6px_0_#ddd0fe] [--d:7px] sm:[--d:9px]">
          <div className="flex h-[168px] items-end justify-between gap-1 border-b-2 border-[#efe7ff]">
            {LABELS.map((l, i) => (
              <div key={l.t} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                <span className="mb-3 text-[13px] font-black">{counts[i]}</span>
                <div
                  className="relative mr-[var(--d)] w-[18px] animate-fz-colrise sm:w-6"
                  style={{ height: Math.round(8 + (counts[i] / max) * 120), background: l.c, animationDelay: `${(i * 0.07).toFixed(2)}s` }}
                >
                  <div className="absolute left-0 top-[calc(var(--d)*-1)] h-[var(--d)] w-full origin-[0_100%] -skew-x-45" style={{ background: l.top }} />
                  <div className="absolute -right-[var(--d)] top-0 h-full w-[var(--d)] origin-[0_0] -skew-y-45" style={{ background: l.e }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between gap-1 pt-2">
            {LABELS.map((l) => (
              <div key={l.t} className="flex flex-1 justify-center" role="img" aria-label={l.t}>
                <Icon d={l.icon} size={20} stroke={l.c} sw={2.4} />
              </div>
            ))}
          </div>
        </div>
        <div className="grid max-h-[190px] grid-cols-2 gap-2.5 overflow-auto p-1">
          {notes.map((n, j) => (
            <div
              key={j}
              className="min-w-0 animate-fz-note rounded-md px-3 py-2.5 shadow-[0_8px_14px_-8px_rgba(59,7,100,.4)]"
              style={{ ["--r" as string]: `${n.r}deg`, background: n.bg, animationDelay: `${n.d}s` }}
            >
              <div className="break-words font-hand text-xl leading-[1.1] text-[#3b0764]">{n.text}</div>
              <div className="mt-1.5 text-[11px] font-extrabold text-[#6b21a8]">{n.label}</div>
            </div>
          ))}
          {notes.length === 0 && <div className="col-span-full rounded-2xl border-2 border-dashed border-[#ddd0fe] p-3.5 text-center text-sm text-[#6b21a8]">{answers.length ? "No notes yet, only labels." : "Nobody has answered yet. Share your link!"}</div>}
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2.5">
          <button type="button" className={ghost} onClick={() => setPhase("share")}>Back to my link</button>
          <button type="button" className={ghost} onClick={() => void showInbox()} disabled={busy}>{busy ? "Loading…" : "Refresh"}</button>
        </div>
      </>,
    ),
  });
}
