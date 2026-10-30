"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import CardFriend from "@/components/fun/cards/CardFriend";
import CardActions from "@/components/fun/CardActions";
import { GameShell, copyText, useTimers } from "@/components/fun/kit";
import { SITE_URL } from "@/lib/site";
import { createLink, friendRank, getLink, latestLink, linkLabel, linkUrl, listResponses, submitResponse, type FriendAnswer, type FriendRank } from "@/lib/fun/friends";
import ShareButton from "@/components/fun/ShareButton";

type Phase = "loading" | "missing" | "create" | "share" | "results" | "friendName" | "quiz" | "result";

const BADGES = ["#0ea5e9", "#6366f1", "#d946ef", "#f59e0b"];
const HEART_COLORS = ["#f472b6", "#60a5fa", "#facc15", "#a78bfa", "#fb7185"];
const HEARTS = Array.from({ length: 7 }, (_, i) => ({ x: ((20 + i * 46) / 340) * 100, d: (i * 0.37).toFixed(2), s: 16 + (i % 3) * 8, c: HEART_COLORS[i % 5] }));

function questions(me: string): [string, [string, number][]][] {
  return [
    [`How did you and ${me} meet?`, [["Same class", 12], ["Through friends", 10], ["Online, somehow", 8], ["Honestly no idea", 6]]],
    ["How often do you two talk?", [["Every single day", 14], ["Few times a week", 11], ["When something happens", 7], ["Birthdays only", 3]]],
    [`Would you share your last Maggi with ${me}?`, [["Instantly", 14], ["Half of it", 9], ["After some drama", 7], ["Never. It is mine.", 2]]],
    ["Who is the chaotic one?", [["Both of us", 14], [me, 11], ["Me", 11], ["Neither, we are boring", 6]]],
    [`Do you know ${me}’s crush?`, [["Every detail", 13], ["Just a hint", 9], ["They keep that secret", 7], ["No clue", 4]]],
    [`3am emergency call. Does ${me} pick up?`, [["Always", 14], ["Usually", 10], ["If awake", 7], ["Phone on silent forever", 3]]],
    ["How many inside jokes do you have?", [["Too many to count", 13], ["A few good ones", 10], ["Just one", 6], ["None yet", 2]]],
    ["Rate the vibe when you are together", [["Unmatched", 14], ["Solid", 10], ["Okay", 6], ["Complicated", 4]]],
  ];
}

/** Score out of 100 from the friend's answers: same picks, same score. */
export function friendScore(me: string, picks: number[]) {
  const Q = questions(me);
  let s = 0;
  let max = 0;
  picks.forEach((p, i) => {
    s += Q[i][1][p][1];
    max += 14;
  });
  return Math.round(Math.min(100, (s / Math.max(max, 1)) * 100));
}

const verdict = (sc: number): [string, string] =>
  sc >= 90 ? ["Ride or die", "You two would split the last samosa without even asking."]
  : sc >= 75 ? ["Partners in crime", "Certified duo. Teachers separate you for a reason."]
  : sc >= 60 ? ["Chai buddies", "Good talks, good tea, good times."]
  : sc >= 40 ? ["Friendly neighbours", "The foundation is there. More inside jokes needed."]
  : ["Just getting started", "Every legendary duo starts somewhere."];

const fzBtn =
  "flex min-h-14 w-full cursor-pointer items-center justify-center rounded-[18px] border-0 bg-[#0284c7] px-[18px] py-3.5 text-[17px] font-black text-white no-underline shadow-[0_6px_0_#075985,0_14px_24px_rgba(7,89,133,.3)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_2px_0_#075985] disabled:cursor-default disabled:opacity-50";
const ghost =
  "min-h-[52px] cursor-pointer rounded-2xl border-2 border-[#bfdbfe] bg-white px-3.5 py-3 text-[15px] font-extrabold text-[#102a4c] shadow-[0_5px_0_#bfdbfe] active:translate-y-[3px] active:shadow-[0_2px_0_#bfdbfe]";
const input =
  "box-border w-full rounded-2xl border-2 border-[#bfdbfe] bg-white px-4 py-[15px] text-base font-medium text-[#102a4c] outline-none placeholder:text-[#8aa3c4] focus:border-[#0284c7] focus:shadow-[0_0_0_4px_rgba(2,132,199,.15)] sm:text-[17px]";
const heartPath = "M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.9 4.5c2.1 0 3.9 1.2 5.1 3 1.2-1.8 3-3 5.1-3 3.9 0 6 3.9 4.5 7.3C19.5 16.4 12 21 12 21z";

function Hearts() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {HEARTS.map((h, i) => (
        <svg key={i} className="absolute bottom-0 animate-fz-heart" style={{ left: `${h.x}%`, animationDelay: `${h.d}s` }} width={h.s} height={h.s} viewBox="0 0 24 24">
          <path d={heartPath} fill={h.c} />
        </svg>
      ))}
    </div>
  );
}

/**
 * Owner (signed in): makes a link, sends it, sees every friend's score.
 * Friend (opens the link, no account): answers 8 questions about the owner and sees the score. `friendCode` switches to this side.
 */
export default function FriendshipScore({ friendCode }: { friendCode?: string } = {}) {
  const { user, ready } = useAuth();
  const [rawPhase, setPhase] = useState<Phase>("loading");
  const [me, setMe] = useState("");
  const [friend, setFriend] = useState("");
  const [q, setQ] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [sel, setSel] = useState(-1);
  const [shown, setShown] = useState(0);
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<"sending" | "sent" | "error">("sending");
  const [results, setResults] = useState<FriendAnswer[] | null>(null);
  const [rank, setRank] = useState<FriendRank | null>(null);
  const later = useTimers();
  const raf = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // Friend side: who made this link?
  useEffect(() => {
    if (!friendCode) return;
    let cancelled = false;
    getLink(friendCode).then((r) => {
      if (cancelled) return;
      if (!r.ok) { setError(r.error); setPhase("missing"); return; }
      if (!r.data || r.data.game !== "friendship-score") { setPhase("missing"); return; }
      setMe(r.data.owner_name);
      setPhase("friendName");
    });
    return () => { cancelled = true; };
  }, [friendCode]);

  // Owner side: find the link they already made (works on any device they sign in on).
  const userId = user?.id ?? null;
  // A signed-out owner has nothing to load, so they go straight to the first screen.
  const phase: Phase = rawPhase === "loading" && !friendCode && ready && !userId ? "create" : rawPhase;
  useEffect(() => {
    if (friendCode) return;
    if (!ready) return;
    if (!userId) return;
    let cancelled = false;
    latestLink("friendship-score").then((r) => {
      if (cancelled) return;
      if (r.ok && r.data) { setCode(r.data.code); setMe(r.data.owner_name); setPhase("share"); } else setPhase("create");
    });
    return () => { cancelled = true; };
  }, [friendCode, ready, userId]);

  const meName = me.trim() || "You";
  const Q = questions(meName);
  const cur = Q[Math.min(q, 7)];
  const sc = phase === "result" ? friendScore(meName, picks) : 0;
  const titles = verdict(sc);
  const url = code ? linkUrl("friendship-score", code) : "";
  const shareText = `${meName} wants to know how strong your friendship is. Answer 8 quick questions:`;
  const friendName = friend.trim() || "Friend";

  async function makeLink() {
    if (busy || !me.trim()) return;
    setBusy(true);
    setError("");
    const r = await createLink("friendship-score", me);
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setCode(r.data);
    setResults(null);
    setPhase("share");
  }
  async function showResults() {
    if (!code) return;
    setBusy(true);
    setError("");
    const r = await listResponses(code);
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setResults(r.data);
    setPhase("results");
  }
  async function send(finalPicks: number[], score: number) {
    if (!friendCode) return;
    setSent("sending");
    const r = await submitResponse(friendCode, friendName, { picks: finalPicks, score });
    setSent(r.ok ? "sent" : "error");
    if (r.ok) {
      const k = await friendRank(friendCode, friendName);
      if (k.ok) setRank(k.data);
    }
  }

  function pick(i: number) {
    if (sel >= 0) return;
    setSel(i);
    later(() => {
      const next = [...picks, i];
      if (next.length >= 8) {
        setPicks(next);
        setPhase("result");
        setSel(-1);
        setShown(0);
        const target = friendScore(meName, next);
        void send(next, target);
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0 - 400) / 1600);
          const e = p < 0 ? 0 : 1 - Math.pow(1 - p, 3);
          setShown(Math.round(target * e));
          if (p < 1) raf.current = requestAnimationFrame(step);
        };
        raf.current = requestAnimationFrame(step);
      } else {
        setPicks(next);
        setQ(q + 1);
        setSel(-1);
      }
    }, 420);
  }
  const startQuiz = () => { setRank(null); setPhase("quiz"); setQ(0); setPicks([]); setSel(-1); setShown(0); };

  const shellProps = {
    gradient: "linear-gradient(150deg,#0ea5e9 0%,#6366f1 55%,#d946ef 100%)",
    icon: "/fun-zone/friendship-score.webp",
    iconBg: "#b6ddfd",
    title: "Friendship Score",
    subtitle: "How strong is your friendship, really?",
    status: "FRIENDS" as const,
    stickerShadow: "rgba(8,30,70,.6)",
    panelClass: "bg-[#e6f4ff] px-[22px] text-[#102a4c]",
    rootClass: "bg-[#e6f4ff]",
  };
  const single = (children: React.ReactNode) => <div className="mx-auto flex w-full max-w-md flex-col gap-3.5 lg:col-span-2">{children}</div>;

  if (phase === "loading") {
    return <GameShell {...shellProps} body={single(<p className="m-0 py-16 text-center text-[15px] font-bold text-[#3d5a80]" role="status">Loading…</p>)} />;
  }

  if (phase === "missing") {
    return (
      <GameShell
        {...shellProps}
        body={single(
          <>
            <div className="flex flex-col items-center gap-3 rounded-[26px] bg-white p-[22px] text-center shadow-[0_8px_0_#bfdbfe]">
              <Image src="/mascot/owl-peek.webp" alt="" width={150} height={118} className="h-auto w-[150px]" />
              <div className="font-display text-[28px] leading-[1.1]">{error || "This link does not exist"}</div>
              <div className="text-[15px] leading-[1.4] text-[#3d5a80]">It may have been typed wrong. Ask your friend to send it again, or make your own.</div>
            </div>
            <Link className={fzBtn} href="/tool/friendship-score">Make your own link</Link>
          </>,
        )}
      />
    );
  }

  if (phase === "create") {
    const stage = (
      <div className="relative flex h-[250px] items-center justify-center [perspective:800px]">
        <Hearts />
        <div className="relative h-[150px] w-[220px] animate-fz-float8 [transform-style:preserve-3d]" style={{ transform: "rotateX(14deg) rotateY(-18deg)" }}>
          <div className="absolute left-0 top-5 flex size-[120px] items-center justify-center rounded-[30px] bg-[#0ea5e9] font-display text-[52px] text-white shadow-[0_10px_0_#0369a1] [transform:translateZ(10px)_rotate(-8deg)]">
            {(me.trim()[0] || "Y").toUpperCase()}
          </div>
          <div className="absolute right-0 top-0 flex size-[120px] items-center justify-center rounded-[30px] bg-[#d946ef] font-display text-[52px] text-white shadow-[0_10px_0_#a21caf] [transform:translateZ(30px)_rotate(8deg)]">?</div>
        </div>
      </div>
    );
    const controls = (
      <>
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-extrabold text-[#0369a1]">
          <span className="rounded-full bg-[#0284c7] px-2.5 py-1 text-white">1 You make a link</span>
          <span className="rounded-full bg-white px-2.5 py-1">2 Friend answers</span>
          <span className="rounded-full bg-white px-2.5 py-1">3 Score</span>
        </div>
        <label htmlFor="fs-me" className="text-sm font-bold text-[#3d5a80]">Your name</label>
        <input
          id="fs-me"
          className={`${input} -mt-1.5`}
          value={me}
          onChange={(e) => setMe(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void makeLink()}
          placeholder="e.g. Jatin"
          maxLength={24}
          autoComplete="off"
        />
        {error && <p role="alert" className="m-0 text-sm font-bold text-[#b91c1c]">{error}</p>}
        <button type="button" className={fzBtn} onClick={() => void makeLink()} disabled={!me.trim() || busy}>{busy ? "Making your link…" : "Make my friendship link"}</button>
      </>
    );
    return <GameShell {...shellProps} stage={stage} controls={controls} />;
  }

  if (phase === "share") {
    return (
      <GameShell
        {...shellProps}
        body={single(
          <>
            <div className="flex animate-fz-pop flex-col items-center gap-3.5 rounded-[26px] bg-white p-[22px] text-center shadow-[0_8px_0_#bfdbfe]">
              <Image src="/mascot/owl-peek.webp" alt="" width={150} height={118} className="h-auto w-[150px]" />
              <div className="break-words font-display text-[30px] leading-[1.05]">Your link is ready, {meName}!</div>
              <div className="text-[15px] leading-[1.4] text-[#3d5a80]">Send it to a friend. They answer 8 quick questions about you two, and you see their score here.</div>
              <div className="box-border flex w-full items-center gap-2 rounded-[14px] border-2 border-dashed border-[#93c5fd] bg-[#f0f7ff] px-3 py-2.5">
                <span className="min-w-0 flex-1 truncate text-left text-sm font-bold">{code ? linkLabel("friendship-score", code) : ""}</span>
                <button type="button" className={`${ghost} !min-h-10 !px-3 !py-1.5 !text-[13px]`} onClick={() => { copyText(url); setCopied(true); later(() => setCopied(false), 1600); }}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <ShareButton
              title="Friendship Score"
              text={shareText}
              url={url}
              shareClass={fzBtn}
              whatsappClass={`${fzBtn} !bg-[#25a244] !shadow-[0_6px_0_#17762f,0_14px_24px_rgba(23,118,47,.3)]`}
              onFallback={() => { copyText(url); setCopied(true); later(() => setCopied(false), 1600); }}
            />
            <button type="button" className={ghost} onClick={() => void showResults()} disabled={busy}>{busy ? "Loading…" : "See who answered"}</button>
            {error && <p role="alert" className="m-0 text-center text-sm font-bold text-[#b91c1c]">{error}</p>}
            <div className="grid grid-cols-1 gap-3">
              <button type="button" className={ghost} onClick={() => { setPhase("create"); setError(""); }}>New link</button>
            </div>
          </>,
        )}
      />
    );
  }

  if (phase === "results") {
    const list = results ?? [];
    const average = list.length ? Math.round(list.reduce((a, r) => a + (r.score ?? 0), 0) / list.length) : 0;
    return (
      <GameShell
        {...shellProps}
        body={single(
          <>
            <div className="flex animate-fz-pop flex-col gap-1 rounded-[26px] bg-white p-[22px] shadow-[0_8px_0_#bfdbfe]">
              <div className="text-xs font-black tracking-[.12em] text-[#0284c7]">YOUR FRIENDSHIP SCORES</div>
              <div className="break-words font-display text-[34px] leading-none">{list.length ? `${list.length} ${list.length === 1 ? "friend" : "friends"} answered` : "Nobody yet"}</div>
              {list.length > 0 && <div className="text-[15px] text-[#3d5a80]">Average score {average} out of 100</div>}
            </div>
            {list.length === 0 && <div className="rounded-2xl border-2 border-dashed border-[#93c5fd] p-4 text-center text-sm text-[#3d5a80]">No answers yet. Send your link to a friend!</div>}
            {list.map((r) => (
              <div key={r.responder_name + r.created_at} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_0_#dbeafe]">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0284c7] font-display text-xl text-white">{(r.responder_name[0] || "?").toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-extrabold">{r.responder_name}</div>
                  <div className="truncate text-[13px] text-[#3d5a80]">{verdict(r.score ?? 0)[0]}</div>
                </div>
                <div className="font-display text-[30px] leading-none">{r.score ?? 0}</div>
              </div>
            ))}
            {error && <p role="alert" className="m-0 text-center text-sm font-bold text-[#b91c1c]">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className={ghost} onClick={() => setPhase("share")}>Back to my link</button>
              <button type="button" className={`${fzBtn} !min-h-[52px] !text-[15px]`} onClick={() => void showResults()} disabled={busy}>{busy ? "Loading…" : "Refresh"}</button>
            </div>
          </>,
        )}
      />
    );
  }

  if (phase === "friendName") {
    return (
      <GameShell
        {...shellProps}
        body={single(
          <>
            <div className="flex animate-fz-pop flex-col gap-3 rounded-[26px] bg-white p-[22px] shadow-[0_8px_0_#bfdbfe]">
              <div className="text-xs font-black tracking-[.12em] text-[#0284c7]">A FRIENDSHIP TEST FROM</div>
              <div className="break-words font-display text-[40px] leading-none">{meName}</div>
              <div className="text-[15px] leading-[1.4] text-[#3d5a80]">Answer 8 quick questions about you two. Be honest. {meName} will see the score.</div>
              <div className="text-[13px] leading-[1.4] text-[#3d5a80]">Your name and score can also be seen by other friends who answer this link.</div>
              <label htmlFor="fs-friend" className="mt-1.5 text-sm font-bold text-[#3d5a80]">Your name</label>
              <input
                id="fs-friend"
                className={input}
                value={friend}
                onChange={(e) => setFriend(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && friend.trim() && startQuiz()}
                placeholder="e.g. Aryan"
                maxLength={24}
                autoComplete="off"
              />
            </div>
            <button type="button" className={fzBtn} onClick={startQuiz} disabled={!friend.trim()}>Start the test</button>
          </>,
        )}
      />
    );
  }

  if (phase === "quiz") {
    return (
      <GameShell
        {...shellProps}
        body={single(
          <>
            <div className="flex items-center gap-2.5">
              <span className="whitespace-nowrap text-[13px] font-extrabold text-[#0369a1]">Question {q + 1}/8</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#dbeafe]">
                <div className="h-full rounded-full bg-[#0284c7] transition-[width] duration-[400ms]" style={{ width: `${((q / 8) * 100).toFixed(0)}%` }} />
              </div>
            </div>
            <div className="[perspective:1000px]">
              <div key={q} className={`flex origin-left flex-col gap-2.5 rounded-[26px] bg-white p-5 shadow-[0_8px_0_#bfdbfe] ${q % 2 ? "animate-fz-cube2" : "animate-fz-cube"}`}>
                <div className="min-h-[60px] font-display text-[26px] leading-[1.15]">{cur[0]}</div>
                {cur[1].map((a, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pick(i)}
                    className={`flex min-h-[54px] min-w-0 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-base font-bold text-[#102a4c] shadow-[0_4px_0_#dbeafe] transition-[transform,border-color] duration-100 hover:border-[#60a5fa] active:translate-y-[3px] active:shadow-[0_1px_0_#dbeafe] ${sel === i ? "border-[#0284c7] bg-[#e0f2fe]" : "border-[#dbeafe] bg-white"}`}
                  >
                    <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[10px] text-sm font-black text-white" style={{ background: BADGES[i] }}>{"ABCD"[i]}</span>
                    <span className="min-w-0 break-words">{a[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </>,
        )}
      />
    );
  }

  const stage = (
    <div className="animate-fz-popin w-full">
      <CardFriend cardRef={cardRef} data={{ me: meName, friend: friendName, score: shown, title: titles[0], line: titles[1] }} />
    </div>
  );
  const controls = (
    <>
      <p role="status" className={`m-0 text-center text-[13px] font-bold ${sent === "error" ? "text-[#b91c1c]" : "text-[#3d5a80]"}`}>
        {sent === "sending" ? `Sending your answers to ${meName}…` : sent === "sent" ? `${meName} can now see your score.` : `Could not send your answers to ${meName}.`}
      </p>
      {sent === "sent" && rank && (
        <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-[0_4px_0_#dbeafe]" role="status">
          <div className="text-xs font-black tracking-[.12em] text-[#0284c7]">YOUR RANK</div>
          <div className="font-display text-[28px] leading-none">#{rank.rank} of {rank.total} {rank.total === 1 ? "friend" : "friends"}</div>
          {rank.ahead === 0 ? (
            <div className="text-sm text-[#3d5a80]">{rank.total > 1 ? "Nobody beats you." : `You are the first to answer for ${meName}.`}</div>
          ) : (
            <>
              <div className="text-sm text-[#3d5a80]">Ahead of you:</div>
              {rank.above.map((a) => (
                <div key={a.name + a.score} className="flex items-center justify-between gap-3 text-sm font-extrabold">
                  <span className="min-w-0 truncate">{a.name}</span>
                  <span className="font-display text-lg">{a.score}</span>
                </div>
              ))}
              {rank.ahead > rank.above.length && <div className="text-[13px] text-[#3d5a80]">and {rank.ahead - rank.above.length} more</div>}
            </>
          )}
        </div>
      )}
      <CardActions
        getNode={() => cardRef.current}
        fileName="friendship-score-toppershelf.png"
        shareText={`${meName} + ${friendName}: ${sc}/100 friendship score. Test yours!`}
        shareUrl={`${SITE_URL}/tool/friendship-score`}
        btnClass={fzBtn}
        ghostClass={ghost}
      />
      <div className="mt-auto grid grid-cols-2 gap-3 lg:mt-0">
        {sent === "error" ? (
          <button type="button" className={ghost} onClick={() => void send(picks, friendScore(meName, picks))}>Try sending again</button>
        ) : (
          <button type="button" className={ghost} onClick={startQuiz}>{rank && rank.ahead > 0 ? "Retry to climb" : "Answer again"}</button>
        )}
        <Link className={`${fzBtn} !min-h-[52px] !text-[15px]`} href="/tool/friendship-score">Make your own</Link>
      </div>
    </>
  );
  return <GameShell {...shellProps} stage={stage} controls={controls} />;
}
