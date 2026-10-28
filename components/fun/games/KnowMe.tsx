"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { GameShell, copyText, useTimers } from "@/components/fun/kit";

type Phase = "name" | "quiz" | "share" | "friendName" | "board";
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
const AV = ["#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6"];
const POD = [
  { i: 1, h: 96, c: "#94a3b8", top: "#cbd5e1", d: 0.25 },
  { i: 0, h: 136, c: "#eab308", top: "#fde047", d: 0.05 },
  { i: 2, h: 70, c: "#c2763a", top: "#e7a56a", d: 0.45 },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const fzBtn =
  "min-h-14 w-full cursor-pointer rounded-[18px] border-0 bg-[#0f9f8f] px-[18px] py-3.5 text-[17px] font-black text-white shadow-[0_6px_0_#0b6f64,0_14px_24px_rgba(11,111,100,.3)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_2px_0_#0b6f64] disabled:cursor-default disabled:opacity-50";
const ghost =
  "min-h-[50px] cursor-pointer rounded-2xl border-2 border-[#b8e6f0] bg-white px-3 py-2.5 text-sm font-extrabold text-[#102a4c] shadow-[0_5px_0_#b8e6f0] active:translate-y-[3px] active:shadow-[0_2px_0_#b8e6f0]";
const input =
  "box-border w-full rounded-2xl border-2 border-[#b8e6f0] bg-white px-4 py-[15px] text-base font-medium text-[#102a4c] outline-none placeholder:text-[#8ab0be] focus:border-[#0f9f8f] focus:shadow-[0_0_0_4px_rgba(15,159,143,.15)] sm:text-[17px]";
const card = "flex animate-fz-pop flex-col items-center gap-3 rounded-[26px] bg-white p-[22px] text-center shadow-[0_8px_0_#b8e6f0]";

export default function KnowMe() {
  const [phase, setPhase] = useState<Phase>("name");
  const [me, setMe] = useState("");
  const [friend, setFriend] = useState("");
  const [mode, setMode] = useState<Mode>("own");
  const [q, setQ] = useState(0);
  const [key, setKey] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [sel, setSel] = useState(-1);
  const [board, setBoard] = useState<Entry[]>([]);
  const [copied, setCopied] = useState(false);
  const [last, setLast] = useState<Entry | null>(null);
  const later = useTimers();

  const meName = me.trim() || "You";
  const own = mode === "own";
  const cur = QS[Math.min(q, 9)];
  const correct = key[q];
  const link = "toppershelf.online/fun/know-me/" + slug(meName);

  function pick(i: number) {
    if (sel >= 0) return;
    setSel(i);
    later(() => {
      if (own) {
        const next = [...key, i];
        setKey(next);
        if (next.length >= 10) { setPhase("share"); setSel(-1); } else { setQ(q + 1); setSel(-1); }
      } else {
        const next = [...guesses, i];
        setGuesses(next);
        if (next.length >= 10) {
          const score = next.filter((g, j) => g === key[j]).length;
          const name = friend.trim();
          setBoard([...board.filter((b) => b.name !== name), { name, score }]);
          setLast({ name, score });
          setPhase("board");
          setSel(-1);
        } else { setQ(q + 1); setSel(-1); }
      }
    }, own ? 380 : 1100);
  }
  const startGuess = () => { setPhase("quiz"); setMode("guess"); setQ(0); setGuesses([]); setSel(-1); };
  const asFriend = () => { setPhase("friendName"); setFriend(""); };

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
          placeholder="e.g. Kabir"
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
    if (!own && sel >= 0) {
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
            if (i < q) c = own ? "#0f9f8f" : guesses[i] === key[i] ? "#16a34a" : "#e11d48";
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
          <div className="text-[15px] leading-[1.4] text-[#3d5a80]">Send the link to friends. Everyone who plays lands on your leaderboard.</div>
          <div className="box-border flex w-full items-center gap-2 rounded-[14px] border-2 border-dashed border-[#7dd3e0] bg-[#f0fbfd] px-3 py-2.5">
            <span className="min-w-0 flex-1 truncate text-left text-sm font-bold">{link}</span>
            <button type="button" className={`${ghost} !min-h-10 !px-3 !py-1.5 !text-[13px]`} onClick={() => { copyText("https://" + link); setCopied(true); later(() => setCopied(false), 1600); }}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <button type="button" className={fzBtn} onClick={asFriend}>Play it as a friend</button>
        {board.length > 0 && <button type="button" className={ghost} onClick={() => setPhase("board")}>See leaderboard</button>}
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
            placeholder="e.g. Meera"
            maxLength={24}
            autoComplete="off"
          />
        </div>
        <button type="button" className={fzBtn} onClick={startGuess} disabled={!friend.trim()}>Start guessing</button>
      </>,
    );
  }

  const sorted = [...board].sort((a, b) => b.score - a.score);
  const podium = POD.filter((p) => sorted[p.i]).map((p) => ({ ...p, e: sorted[p.i] }));
  const ls = last ? last.score : 0;
  const lastLine = last ? last.name + (ls >= 8 ? ` is basically ${meName}’s twin` : ls >= 5 ? ` knows ${meName} pretty well` : ` needs more time with ${meName}`) : "";
  return shell(
    <>
      <div className="animate-fz-pop text-center">
        <div className="break-words text-[13px] font-extrabold text-[#3d5a80]">{lastLine}</div>
        <div className="font-display text-[56px] leading-none">{ls}<span className="text-[28px] text-[#3d5a80]">/10</span></div>
      </div>
      <div className="flex h-[276px] items-end justify-center gap-1.5 [perspective:700px]">
        {podium.map((p) => (
          <div key={p.i} className="flex min-w-0 max-w-[100px] flex-1 flex-col items-center gap-1.5">
            {p.i === 0 && (
              <svg className="animate-fz-crown" width="34" height="26" viewBox="0 0 34 26" aria-hidden="true">
                <path d="M2 24 L4 6 L11 14 L17 2 L23 14 L30 6 L32 24 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            )}
            <div className="flex size-12 items-center justify-center rounded-full text-xl font-black text-white shadow-[0_4px_0_rgba(0,0,0,.15)]" style={{ background: AV[p.i] }}>{(p.e.name[0] || "?").toUpperCase()}</div>
            <div className="max-w-full truncate text-[13px] font-extrabold">{p.e.name}</div>
            <div className="relative w-full max-w-24 [transform-style:preserve-3d] [transform:rotateX(10deg)]">
              <div className="h-4 rounded-t-[10px] [transform:skewX(-8deg)]" style={{ background: p.top }} />
              <div
                className="box-border flex animate-fz-pod flex-col items-center justify-start rounded-b-lg pt-2 text-white shadow-[inset_-10px_0_0_rgba(0,0,0,.12)]"
                style={{ height: p.h, background: p.c, animationDelay: `${p.d}s` }}
              >
                <span className="font-display text-[32px] leading-none">{p.i + 1}</span>
                <span className="text-xs font-extrabold">{p.e.score}/10</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex max-h-[110px] flex-col gap-1.5 overflow-auto">
        {sorted.slice(3).map((r, i) => (
          <div key={r.name} className="flex items-center gap-2.5 rounded-[14px] bg-white px-3 py-2">
            <span className="w-5 font-black">{i + 4}</span>
            <span className="min-w-0 flex-1 truncate font-bold">{r.name}</span>
            <span className="font-black">{r.score}/10</span>
          </div>
        ))}
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2.5">
        <button type="button" className={ghost} onClick={asFriend}>Play as another friend</button>
        <button type="button" className={ghost} onClick={() => { setPhase("name"); setMe(""); setFriend(""); setMode("own"); setQ(0); setKey([]); setGuesses([]); setBoard([]); setLast(null); }}>Make your own quiz</button>
      </div>
    </>,
  );
}
