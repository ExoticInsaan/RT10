"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import CardKnowMe from "@/components/fun/cards/CardKnowMe";
import CardActions from "@/components/fun/CardActions";
import { GameShell, copyText, useTimers } from "@/components/fun/kit";
import { createLink, getLink, knowCheck, latestLink, linkLabel, linkUrl, listResponses, submitResponse } from "@/lib/fun/friends";
import ShareButton from "@/components/fun/ShareButton";

type Phase = "loading" | "missing" | "name" | "quiz" | "saving" | "saveFail" | "share" | "friendName" | "score" | "board";
type Mode = "own" | "guess";
type Entry = { name: string; score: number };

const QS: [string, string[]][] = [
  ["My go-to snack?", ["Maggi", "Samosa", "Chips", "Fruit (honestly)"]],
  ["My dream holiday?", ["Mountains", "Beach", "Big city", "My bed"]],
  ["My study style?", ["Night owl", "Early bird", "Last-minute panic", "What is studying?"]],
  ["My favourite subject?", ["Maths", "Science", "Languages", "Lunch break"]],
  ["What do I do when bored?", ["Scroll reels", "Sleep", "Snack", "Annoy friends"]],
  ["My comfort drink?", ["Chai", "Coffee", "Cold drink", "Water, responsibly"]],
  ["What scares me most?", ["Exams", "Cockroaches", "Phone at 1%", "Parent-teacher meeting"]],
  ["My superpower would be?", ["Teleport", "Read minds", "Never get tired", "Unlimited data"]],
  ["My music vibe?", ["Bollywood", "Lo-fi", "Pop", "Whatever is trending"]],
  ["How do I reply to texts?", ["Instantly", "After 3 hours", "Seen, then forget", "Voice notes only"]],
];
const BADGES = ["#0f9f8f", "#3b82f6", "#8b5cf6", "#f59e0b"];

const fzBtn =
  "min-h-14 w-full cursor-pointer rounded-[18px] border-0 bg-[#0f9f8f] px-[18px] py-3.5 text-[17px] font-black text-white shadow-[0_6px_0_#0b6f64,0_14px_24px_rgba(11,111,100,.3)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_2px_0_#0b6f64] disabled:cursor-default disabled:opacity-50";
const ghost =
  "min-h-[50px] cursor-pointer rounded-2xl border-2 border-[#b8e6f0] bg-white px-3 py-2.5 text-sm font-extrabold text-[#102a4c] shadow-[0_5px_0_#b8e6f0] active:translate-y-[3px] active:shadow-[0_2px_0_#b8e6f0]";
const input =
  "box-border w-full rounded-2xl border-2 border-[#b8e6f0] bg-white px-4 py-[15px] text-base font-medium text-[#102a4c] outline-none placeholder:text-[#8ab0be] focus:border-[#0f9f8f] focus:shadow-[0_0_0_4px_rgba(15,159,143,.15)] sm:text-[17px]";
const card = "flex animate-fz-pop flex-col items-center gap-3 rounded-[26px] bg-white p-[22px] text-center shadow-[0_8px_0_#b8e6f0]";

/**
 * Owner (signed in): answers 10 questions about themselves, makes a link and reads the leaderboard of friends who guessed.
 * Friend (opens the link, no account): guesses the owner's answers and gets a score. `friendCode` switches to this side.
 * The owner's answers stay on the server; a friend only learns the right answer to a question after guessing it.
 */
export default function KnowMe({ friendCode }: { friendCode?: string } = {}) {
  const { user, ready } = useAuth();
  const [rawPhase, setPhase] = useState<Phase>("loading");
  const [me, setMe] = useState("");
  const [friend, setFriend] = useState("");
  const [mode, setMode] = useState<Mode>(friendCode ? "guess" : "own");
  const [q, setQ] = useState(0);
  const [key, setKey] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [sel, setSel] = useState(-1);
  const [board, setBoard] = useState<Entry[]>([]);
  const [copied, setCopied] = useState(false);
  const [last, setLast] = useState<Entry | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<"sending" | "sent" | "error">("sending");
  const later = useTimers();
  const cardRef = useRef<HTMLDivElement>(null);

  // Friend side: who made this quiz?
  useEffect(() => {
    if (!friendCode) return;
    let cancelled = false;
    getLink(friendCode).then((r) => {
      if (cancelled) return;
      if (!r.ok) { setError(r.error); setPhase("missing"); return; }
      if (!r.data || r.data.game !== "how-well-do-you-know-me") { setPhase("missing"); return; }
      setMe(r.data.owner_name);
      setPhase("friendName");
    });
    return () => { cancelled = true; };
  }, [friendCode]);

  // Owner side: find the quiz they already made.
  const userId = user?.id ?? null;
  // A signed-out owner has nothing to load, so they go straight to the first screen.
  const phase: Phase = rawPhase === "loading" && !friendCode && ready && !userId ? "name" : rawPhase;
  useEffect(() => {
    if (friendCode || !ready) return;
    if (!userId) return;
    let cancelled = false;
    latestLink("how-well-do-you-know-me").then((r) => {
      if (cancelled) return;
      if (r.ok && r.data) { setCode(r.data.code); setMe(r.data.owner_name); setPhase("share"); } else setPhase("name");
    });
    return () => { cancelled = true; };
  }, [friendCode, ready, userId]);

  const meName = me.trim() || "You";
  const own = mode === "own";
  const cur = QS[Math.min(q, 9)];
  const correct = own ? key[q] : revealed[q];
  const url = code ? linkUrl("how-well-do-you-know-me", code) : "";
  const shareText = `How well do you know ${meName}? Guess 10 answers and see your score:`;
  const friendName = friend.trim();

  async function makeQuizLink(answers: number[]) {
    setPhase("saving");
    setError("");
    const r = await createLink("how-well-do-you-know-me", me, { secret: { key: answers } });
    if (!r.ok) { setError(r.error); setPhase("saveFail"); return; }
    setCode(r.data);
    setBoard([]);
    setPhase("share");
  }
  async function showBoard() {
    if (!code) return;
    setBusy(true);
    setError("");
    const r = await listResponses(code);
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setBoard(r.data.map((x) => ({ name: x.responder_name, score: Math.round((x.score ?? 0) / 10) })));
    setLast(null);
    setPhase("board");
  }
  async function sendGuesses(all: number[]) {
    if (!friendCode) return;
    setSent("sending");
    const r = await submitResponse(friendCode, friendName, { guesses: all });
    if (r.ok) {
      setSent("sent");
      setLast({ name: friendName, score: Math.round((r.data.score ?? 0) / 10) });
    } else {
      setSent("error");
      setLast({ name: friendName, score: all.filter((g, j) => g === revealed[j]).length });
    }
  }

  function pick(i: number) {
    if (sel >= 0) return;
    setSel(i);
    if (own) {
      later(() => {
        const next = [...key, i];
        setKey(next);
        setSel(-1);
        if (next.length >= 10) void makeQuizLink(next);
        else setQ(q + 1);
      }, 380);
      return;
    }
    const at = q;
    // The right answer comes from the server, so it arrives a moment after the tap. Until then the chosen option
    // stays neutral (see `checking` below); it must never show "NOPE" before we know.
    const check = friendCode
      ? knowCheck(friendCode, at, i).then((r) => {
          const right = r.ok && r.data !== null ? r.data : -1;
          setRevealed((a) => { const n = [...a]; n[at] = right; return n; });
        })
      : Promise.resolve();
    // Move on after at least 1.1 s, but wait for the answer to show (up to 4 s on a slow connection).
    const shown = new Promise<void>((done) => later(done, 1100));
    const giveUp = new Promise<void>((done) => later(done, 4000));
    void Promise.race([Promise.all([check, shown]), giveUp]).then(() => {
      const next = [...guesses, i];
      setGuesses(next);
      setSel(-1);
      if (next.length >= 10) {
        void sendGuesses(next);
        setPhase("score");
      } else setQ(q + 1);
    });
  }
  const startGuess = () => { setPhase("quiz"); setMode("guess"); setQ(0); setGuesses([]); setRevealed([]); setSel(-1); };

  const shell = (body: ReactNode) => (
    <GameShell
      gradient="linear-gradient(150deg,#0f9f8f 0%,#3b82f6 55%,#8b5cf6 100%)"
      icon="/fun-zone/how-well-do-you-know-me.webp"
      iconBg="#b6dafd"
      title="How Well Do You Know Me?"
      subtitle="A quiz about you that friends take."
      status="FRIENDS"
      stickerShadow="rgba(8,30,70,.6)"
      panelClass="bg-[#e8f7fb] px-[22px] text-[#102a4c]"
      rootClass="bg-[#e8f7fb]"
      body={<div className="mx-auto flex w-full max-w-[34rem] flex-col gap-3.5 lg:col-span-2">{body}</div>}
    />
  );

  if (phase === "loading" || phase === "saving") {
    return shell(<p className="m-0 py-16 text-center text-[15px] font-bold text-[#3d5a80]" role="status">{phase === "saving" ? "Making your link…" : "Loading…"}</p>);
  }

  if (phase === "saveFail") {
    return shell(
      <>
        <div className={card}>
          <div className="font-display text-[28px] leading-[1.1]">Could not save your quiz</div>
          <div className="text-[15px] leading-[1.4] text-[#3d5a80]">{error}</div>
        </div>
        <button type="button" className={fzBtn} onClick={() => void makeQuizLink(key)}>Try again</button>
      </>,
    );
  }

  if (phase === "missing") {
    return shell(
      <>
        <div className={card}>
          <Image src="/mascot/owl-peek.webp" alt="" width={150} height={118} className="h-auto w-[150px]" />
          <div className="font-display text-[28px] leading-[1.1]">{error || "This quiz does not exist"}</div>
          <div className="text-[15px] leading-[1.4] text-[#3d5a80]">It may have been typed wrong. Ask your friend to send it again, or make your own.</div>
        </div>
        <Link className={`${fzBtn} flex items-center justify-center no-underline`} href="/tool/how-well-do-you-know-me">Make my own quiz</Link>
      </>,
    );
  }

  if (phase === "name") {
    return shell(
      <>
        <div className={card}>
          <Image src="/mascot/owl-peek.webp" alt="" width={160} height={126} className="h-auto w-[160px]" />
          <div className="font-display text-[28px] leading-[1.1]">Answer 10 questions about yourself. Friends try to guess.</div>
          <div className="text-sm text-[#3d5a80]">You get a leaderboard of who knows you best.</div>
        </div>
        <label htmlFor="km-me" className="text-sm font-bold text-[#3d5a80]">Your name</label>
        <input
          id="km-me"
          className={`${input} -mt-1.5`}
          value={me}
          onChange={(e) => setMe(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && me.trim()) { setPhase("quiz"); setMode("own"); setQ(0); setKey([]); } }}
          placeholder="e.g. Jatin"
          maxLength={24}
          autoComplete="off"
        />
        <button type="button" className={fzBtn} onClick={() => { setPhase("quiz"); setMode("own"); setQ(0); setKey([]); setSel(-1); }} disabled={!me.trim()}>Make my quiz</button>
      </>,
    );
  }

  if (phase === "quiz") {
    const qText = own ? cur[0] : cur[0].replace(/\bMy\b/, meName + "’s").replace(/\bI\b/, meName).replace(/\bme\b/, meName);
    let feedback = "";
    let fbBad = false;
    // Friend side: the person has tapped but the server has not told us the right answer yet (or the check failed).
    const checking = !own && sel >= 0 && (correct === undefined || correct < 0);
    if (!own && sel >= 0 && correct !== undefined && correct >= 0) {
      if (sel === correct) feedback = ["Nailed it!", `You really know ${meName}.`, "Correct!"][q % 3];
      else { feedback = "Not quite!"; fbBad = true; }
    }
    return shell(
      <>
        <div className="flex items-center justify-between gap-2">
          <span className="break-words text-xs font-black tracking-[.12em]" style={{ color: own ? "#0f9f8f" : "#3b82f6" }}>{own ? "ABOUT YOU" : `GUESS ${meName.toUpperCase()}’S ANSWER`}</span>
          <span className="shrink-0 text-[13px] font-extrabold text-[#3d5a80]">{q + 1}/10</span>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }, (_, i) => {
            let c = i === q ? "#5eead4" : "#cdeef4";
            if (i < q) c = own ? "#0f9f8f" : revealed[i] === undefined || revealed[i] < 0 ? "#5eead4" : guesses[i] === revealed[i] ? "#16a34a" : "#e11d48";
            return <div key={i} className="h-2 rounded-full transition-[background] duration-300" style={{ background: c }} />;
          })}
        </div>
        <div className="[perspective:1000px]">
          <div key={q} className="flex animate-fz-flip flex-col gap-2.5 rounded-[26px] bg-white p-5 shadow-[0_8px_0_#b8e6f0]">
            <div className="min-h-[60px] break-words font-display text-[26px] leading-[1.15]">{qText}</div>
            {cur[1].map((t, i) => {
              let cls = "border-[#d5eef3] bg-white shadow-[0_4px_0_#d5eef3]";
              let tag = "";
              let tagC = "#16a34a";
              if (sel >= 0) {
                if (own) {
                  if (i === sel) cls = "border-[#0f9f8f] bg-[#ccfbf1] shadow-[0_4px_0_#d5eef3]";
                } else if (checking) {
                  if (i === sel) {
                    cls = "border-[#3b82f6] bg-[#dbeafe] shadow-[0_4px_0_#bfdbfe]";
                    tag = correct === undefined ? "CHECKING…" : "";
                    tagC = "#3b82f6";
                  }
                } else if (i === correct) {
                  cls = "border-[#16a34a] bg-[#dcfce7] shadow-[0_4px_0_#86efac]";
                  tag = i === sel ? "CORRECT" : meName.toUpperCase() + "’S PICK";
                } else if (i === sel) {
                  cls = "animate-fz-shake border-[#e11d48] bg-[#ffe4e6] shadow-[0_4px_0_#fda4af]";
                  tag = "NOPE";
                  tagC = "#e11d48";
                }
              }
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(i)}
                  disabled={sel >= 0}
                  className={`flex min-h-[52px] min-w-0 cursor-pointer items-center gap-3 rounded-2xl border-2 px-3.5 py-2.5 text-left text-[15px] font-bold text-[#102a4c] transition-[transform,border-color,background] duration-100 hover:border-[#5eead4] disabled:cursor-default ${sel < 0 ? "active:translate-y-[3px]" : ""} ${cls}`}
                >
                  <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[10px] text-sm font-black text-white" style={{ background: BADGES[i] }}>{"ABCD"[i]}</span>
                  <span className="min-w-0 flex-1 break-words">{t}</span>
                  <span className="max-w-[40%] shrink-0 break-words text-right text-xs font-black" style={{ color: tagC }}>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="min-h-[22px] text-center text-[15px] font-extrabold" style={{ color: fbBad ? "#e11d48" : "#0f766e" }}>{feedback}</div>
      </>,
    );
  }

  if (phase === "share") {
    return shell(
      <>
        <div className={`${card} gap-3.5`}>
          <div className="flex size-[84px] -rotate-6 items-center justify-center rounded-[26px] bg-[#0f9f8f] shadow-[0_8px_0_#0b6f64]">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <div className="break-words font-display text-[30px] leading-[1.05]">Your quiz is ready, {meName}!</div>
          <div className="text-[15px] leading-[1.4] text-[#3d5a80]">Send the link to friends. Everyone who plays lands on your leaderboard. Your answers stay hidden until they guess.</div>
          <div className="box-border flex w-full items-center gap-2 rounded-[14px] border-2 border-dashed border-[#7dd3e0] bg-[#f0fbfd] px-3 py-2.5">
            <span className="min-w-0 flex-1 truncate text-left text-sm font-bold">{code ? linkLabel("how-well-do-you-know-me", code) : ""}</span>
            <button type="button" className={`${ghost} !min-h-10 !px-3 !py-1.5 !text-[13px]`} onClick={() => { copyText(url); setCopied(true); later(() => setCopied(false), 1600); }}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <ShareButton
          title="How well do you know me?"
          text={shareText}
          url={url}
          shareClass={fzBtn}
          whatsappClass={`${fzBtn} flex items-center justify-center no-underline !bg-[#25a244] !shadow-[0_6px_0_#17762f,0_14px_24px_rgba(23,118,47,.3)]`}
          onFallback={() => { copyText(url); setCopied(true); later(() => setCopied(false), 1600); }}
        />
        <button type="button" className={ghost} onClick={() => void showBoard()} disabled={busy}>{busy ? "Loading…" : "See my leaderboard"}</button>
        {error && <p role="alert" className="m-0 text-center text-sm font-bold text-[#b91c1c]">{error}</p>}
        <div className="grid grid-cols-1 gap-2.5">
          <button type="button" className={ghost} onClick={() => { setPhase("name"); setMode("own"); setQ(0); setKey([]); setSel(-1); setError(""); }}>New quiz</button>
        </div>
      </>,
    );
  }

  if (phase === "friendName") {
    return shell(
      <>
        <div className="flex animate-fz-pop flex-col gap-3 rounded-[26px] bg-white p-[22px] shadow-[0_8px_0_#b8e6f0]">
          <div className="text-xs font-black tracking-[.12em] text-[#0f9f8f]">A QUIZ FROM</div>
          <div className="break-words font-display text-[40px] leading-none">{meName}</div>
          <div className="text-[15px] leading-[1.4] text-[#3d5a80]">How well do you know {meName}? Guess 10 answers and climb the leaderboard.</div>
          <label htmlFor="km-friend" className="mt-1.5 text-sm font-bold text-[#3d5a80]">Your name</label>
          <input
            id="km-friend"
            className={input}
            value={friend}
            onChange={(e) => setFriend(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && friend.trim() && startGuess()}
            placeholder="e.g. Aryan"
            maxLength={24}
            autoComplete="off"
          />
        </div>
        <button type="button" className={fzBtn} onClick={startGuess} disabled={!friend.trim()}>Start guessing</button>
      </>,
    );
  }

  if (phase === "score") {
    const ls = last ? last.score : 0;
    const line = ls >= 8 ? `You are basically ${meName}’s twin.` : ls >= 5 ? `You know ${meName} pretty well.` : `You need more time with ${meName}.`;
    return shell(
      <>
        <div className="flex animate-fz-pop flex-col items-center gap-1 rounded-[26px] bg-white p-[22px] text-center shadow-[0_8px_0_#b8e6f0]">
          <div className="break-words text-[13px] font-extrabold text-[#3d5a80]">{friendName || "You"} guessed {meName}</div>
          <div className="font-display text-[72px] leading-none">{ls}<span className="text-[32px] text-[#3d5a80]">/10</span></div>
          <div className="text-[15px] font-bold text-[#102a4c]">{line}</div>
        </div>
        <p role="status" className={`m-0 text-center text-[13px] font-bold ${sent === "error" ? "text-[#b91c1c]" : "text-[#3d5a80]"}`}>
          {sent === "sending" ? `Sending your score to ${meName}…` : sent === "sent" ? `${meName} can see your score on their leaderboard.` : `Could not send your score to ${meName}.`}
        </p>
        <div className="mt-auto grid grid-cols-2 gap-2.5">
          {sent === "error" ? (
            <button type="button" className={ghost} onClick={() => void sendGuesses(guesses)}>Try sending again</button>
          ) : (
            <button type="button" className={ghost} onClick={startGuess}>Guess again</button>
          )}
          <Link className={`${fzBtn} flex !min-h-[50px] items-center justify-center !text-[15px] no-underline`} href="/tool/how-well-do-you-know-me">Make my own quiz</Link>
        </div>
      </>,
    );
  }

  const sorted = [...board].sort((a, b) => b.score - a.score);
  return shell(
    <>
      <div className="animate-fz-pop text-center">
        <div className="break-words text-[13px] font-extrabold text-[#3d5a80]">{meName.toUpperCase()}&apos;S LEADERBOARD</div>
        <div className="font-display text-[34px] leading-none">{sorted.length ? `${sorted.length} ${sorted.length === 1 ? "friend" : "friends"} played` : "Nobody has played yet"}</div>
      </div>
      {sorted.length === 0 && <div className="rounded-2xl border-2 border-dashed border-[#7dd3e0] p-4 text-center text-sm text-[#3d5a80]">Send your link to friends and watch the leaderboard fill up.</div>}
      {sorted.length > 0 && (
        <div className="flex animate-fz-pop flex-col items-center gap-3">
          <CardKnowMe cardRef={cardRef} data={{ owner: meName, top: sorted.slice(0, 3).map((e) => ({ name: e.name, score: e.score })) }} />
          <CardActions
            getNode={() => cardRef.current}
            fileName="who-knows-me-toppershelf.png"
            shareText={`${meName}'s quiz: who knows me best? Think you can beat ${sorted[0].name}?`}
            shareUrl={url}
            btnClass={fzBtn}
            ghostClass={ghost}
          />
        </div>
      )}
      <div className="flex max-h-[170px] flex-col gap-1.5 overflow-auto">
        {sorted.slice(3).map((r, i) => (
          <div key={r.name} className="flex items-center gap-2.5 rounded-[14px] bg-white px-3 py-2">
            <span className="w-5 font-black">{i + 4}</span>
            <span className="min-w-0 flex-1 truncate font-bold">{r.name}</span>
            <span className="font-black">{r.score}/10</span>
          </div>
        ))}
      </div>
      {error && <p role="alert" className="m-0 text-center text-sm font-bold text-[#b91c1c]">{error}</p>}
      <div className="mt-auto grid grid-cols-2 gap-2.5">
        <button type="button" className={ghost} onClick={() => setPhase("share")}>Back to my link</button>
        <button type="button" className={ghost} onClick={() => void showBoard()} disabled={busy}>{busy ? "Loading…" : "Refresh"}</button>
      </div>
    </>,
  );
}
