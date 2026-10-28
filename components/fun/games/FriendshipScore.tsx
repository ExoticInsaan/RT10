"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GameShell, copyText, hash, useTimers } from "@/components/fun/kit";

type Phase = "create" | "share" | "friendName" | "quiz" | "result";

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

export default function FriendshipScore() {
  const [phase, setPhase] = useState<Phase>("create");
  const [me, setMe] = useState("");
  const [friend, setFriend] = useState("");
  const [q, setQ] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [sel, setSel] = useState(-1);
  const [shown, setShown] = useState(0);
  const [copied, setCopied] = useState(false);
  const later = useTimers();
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const meName = me.trim() || "You";
  const Q = questions(meName);
  const cur = Q[Math.min(q, 7)];
  const sc = phase === "result" ? friendScore(meName, picks) : 0;
  const titles =
    sc >= 90 ? ["Ride or die", "You two would split the last samosa without even asking."]
    : sc >= 75 ? ["Partners in crime", "Certified duo. Teachers separate you for a reason."]
    : sc >= 60 ? ["Chai buddies", "Good talks, good tea, good times."]
    : sc >= 40 ? ["Friendly neighbours", "The foundation is there. More inside jokes needed."]
    : ["Just getting started", "Every legendary duo starts somewhere."];
  const link = "toppershelf.online/fun/friends/" + meName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + ((hash(meName) % 9000) + 1000);
  const friendName = friend.trim() || "Friend";

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
  const startQuiz = () => { setPhase("quiz"); setQ(0); setPicks([]); setSel(-1); setShown(0); };

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
          onKeyDown={(e) => e.key === "Enter" && me.trim() && setPhase("share")}
          placeholder="e.g. Priya"
          maxLength={24}
          autoComplete="off"
        />
        <button type="button" className={fzBtn} onClick={() => setPhase("share")} disabled={!me.trim()}>Make my friendship link</button>
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
              <div className="text-[15px] leading-[1.4] text-[#3d5a80]">Send it to a friend. They answer 8 quick questions about you two, and you both get a score.</div>
              <div className="box-border flex w-full items-center gap-2 rounded-[14px] border-2 border-dashed border-[#93c5fd] bg-[#f0f7ff] px-3 py-2.5">
                <span className="min-w-0 flex-1 truncate text-left text-sm font-bold">{link}</span>
                <button type="button" className={`${ghost} !min-h-10 !px-3 !py-1.5 !text-[13px]`} onClick={() => { copyText("https://" + link); setCopied(true); later(() => setCopied(false), 1600); }}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <button type="button" className={fzBtn} onClick={() => setPhase("friendName")}>Open it as a friend</button>
            <p className="m-0 text-center text-[13px] text-[#3d5a80]">Preview what your friend will see.</p>
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
              <label htmlFor="fs-friend" className="mt-1.5 text-sm font-bold text-[#3d5a80]">Your name</label>
              <input
                id="fs-friend"
                className={input}
                value={friend}
                onChange={(e) => setFriend(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && friend.trim() && startQuiz()}
                placeholder="e.g. Rohan"
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

  const ringC = sc >= 75 ? "#ec4899" : sc >= 50 ? "#0284c7" : "#f59e0b";
  const stage = (
    <div className="relative flex h-[290px] items-center justify-center [perspective:900px]">
      <Hearts />
      <div className="relative size-[240px] animate-fz-medal [transform-style:preserve-3d]">
        <div className="absolute inset-0 rounded-full bg-[#facc15] [transform:translateZ(-10px)]" />
        <div className="absolute inset-0 rounded-full bg-[#eab308] [transform:translateZ(-5px)]" />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white shadow-[inset_0_0_0_10px_#fde047,0_24px_40px_-12px_rgba(16,42,76,.45)]">
          <svg width="220" height="220" viewBox="0 0 220 220" className="absolute left-2.5 top-2.5" aria-hidden="true">
            <circle cx="110" cy="110" r="86" stroke="#e0f2fe" strokeWidth="16" fill="none" />
            <circle className="animate-fz-ring" cx="110" cy="110" r="86" stroke={ringC} strokeWidth="16" fill="none" strokeLinecap="round" strokeDasharray="540" strokeDashoffset={(540 - (540 * sc) / 100).toFixed(1)} transform="rotate(-90 110 110)" />
          </svg>
          <div className="relative text-center">
            <div className="font-display text-[70px] leading-[.9]">{shown}</div>
            <div className="text-[13px] font-extrabold text-[#3d5a80]">out of 100</div>
          </div>
        </div>
      </div>
    </div>
  );
  const controls = (
    <>
      <div className="flex animate-fz-pop flex-col gap-1.5 text-center [animation-delay:1.2s]">
        <div className="break-words text-[13px] font-extrabold text-[#0369a1]">{meName} + {friendName}</div>
        <div className="font-display text-[40px] leading-none">{titles[0]}</div>
        <div className="text-[15px] leading-[1.4] text-[#3d5a80]">{titles[1]}</div>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-3 lg:mt-0">
        <button type="button" className={ghost} onClick={startQuiz}>Answer again</button>
        <button type="button" className={`${fzBtn} !min-h-[52px] !text-[15px]`} onClick={() => { setPhase("create"); setMe(""); setFriend(""); setQ(0); setPicks([]); setShown(0); }}>Make your own</button>
      </div>
    </>
  );
  return <GameShell {...shellProps} stage={stage} controls={controls} />;
}
