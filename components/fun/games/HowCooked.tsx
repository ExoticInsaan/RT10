"use client";

import { useEffect, useRef, useState } from "react";
import CardCooked from "@/components/fun/cards/CardCooked";
import CardActions from "@/components/fun/CardActions";
import { FitBox, GameShell, OwlPeek, hash, useTimers } from "@/components/fun/kit";
import { resultLink } from "@/lib/fun/results";

type Phase = "input" | "loading" | "result";

const TIERS = [
  { max: 20, tier: "RAW", bg: "#2f9e6e", v: ["Raw. Suspiciously well-rested. Teach us your ways.", "Barely warm. Do you even have deadlines?", "Uncooked and thriving. The pot is confused."] },
  { max: 40, tier: "TOASTED", bg: "#d69a0f", v: ["Lightly toasted. Still has hope and a working sleep schedule.", "Golden brown. One more assignment and you turn crispy.", "Warm, not hot. You have opened the syllabus at least once."] },
  { max: 60, tier: "MEDIUM", bg: "#e8701f", v: ["Medium. Running purely on chai and vibes.", "Half cooked. Your to-do list has a to-do list.", "Simmering. You said \"just 5 more minutes\" four hours ago."] },
  { max: 80, tier: "WELL DONE", bg: "#d6401b", v: ["Well done. Your brain has 47 tabs open and one is playing music.", "Crispy edges. You replied \"ok\" to a message from last week.", "Sizzling. Your alarm has started setting its own alarms."] },
  { max: 100, tier: "CHARCOAL", bg: "#8a1c1c", v: ["Fully cooked. Charcoal. Absolute legend energy.", "Burnt to a crisp. The smoke alarm knows your name.", "Beyond cooked. Scientists want to study you."] },
];

/** Same name, same result: the score comes from a hash of the name. */
export function cookedResult(name: string) {
  const h = hash("cooked:" + name.trim().toLowerCase());
  const score = h % 101;
  const t = TIERS.find((x) => score <= x.max)!;
  return { score, tier: t.tier, bg: t.bg, verdict: t.v[(h >>> 8) % t.v.length] };
}

const MSGS = ["Heating the pot…", "Counting open tabs…", "Checking sleep debt…", "Almost cooked…"];
const SPARK_COLORS = ["#ffb52e", "#ff5b1f", "#2f9e6e", "#7b5cff", "#fff"];
const BUBBLES = [
  { x: 130, y: 136, r: 5, d: 0 }, { x: 160, y: 140, r: 3.5, d: 0.4 }, { x: 192, y: 134, r: 6, d: 0.8 }, { x: 222, y: 139, r: 4, d: 0.2 },
  { x: 205, y: 143, r: 3, d: 1 }, { x: 146, y: 131, r: 4, d: 0.6 }, { x: 240, y: 134, r: 3, d: 0.5 }, { x: 112, y: 140, r: 3, d: 0.9 },
];

function flamePath(w: number, h: number) {
  const f = (n: number) => n.toFixed(1);
  return `M0 0 C ${f(-w * 0.62)} ${f(-h * 0.18)}, ${f(-w * 0.34)} ${f(-h * 0.66)}, 0 ${f(-h)} C ${f(w * 0.34)} ${f(-h * 0.66)}, ${f(w * 0.62)} ${f(-h * 0.18)}, 0 0 Z`;
}
function makeFlame(a: number, i: number, back: boolean) {
  const x = 180 + Math.cos(a) * 62;
  const y = 258 + Math.sin(a) * 10;
  const mid = 1 - Math.abs(Math.cos(a)) * 0.55;
  const w = (back ? 10 : 13) * mid + 4;
  const h = (back ? 20 : 26) * mid + 8 + (i % 3) * 4;
  return { x, y, d: (i * 0.097) % 0.32, outer: flamePath(w, h), mid: flamePath(w * 0.55, h * 0.62), blue: flamePath(w * 0.5, h * 0.3) };
}
const FRONT = Array.from({ length: 11 }, (_, i) => makeFlame(Math.PI * (0.06 + (0.88 * i) / 10), i, false));
const BACK = Array.from({ length: 8 }, (_, i) => makeFlame(Math.PI * (1.08 + (0.84 * i) / 7), i + 3, true));

function lighten(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const m = (c: number) => Math.round(c + (255 - c) * k);
  return "#" + [m(n >> 16), m((n >> 8) & 255), m(n & 255)].map((v) => v.toString(16).padStart(2, "0")).join("");
}

const btn =
  "min-h-14 cursor-pointer rounded-[18px] border-0 bg-[#e8501f] px-5 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#a83210,0_14px_24px_rgba(168,50,16,.28)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_2px_0_#a83210,0_6px_12px_rgba(168,50,16,.25)] disabled:cursor-default disabled:opacity-50";
const ghost =
  "min-h-12 cursor-pointer rounded-2xl border-2 border-[#f0c9b4] bg-white px-4 py-3 text-[15px] font-bold text-[#7a2e0e] shadow-[0_4px_0_#f0c9b4] active:translate-y-[3px] active:shadow-[0_1px_0_#f0c9b4]";

export default function HowCooked() {
  const [phase, setPhase] = useState<Phase>("input");
  const [name, setName] = useState("");
  const [shown, setShown] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [loadIdx, setLoadIdx] = useState(0);
  const later = useTimers();
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const r = phase === "result" ? cookedResult(name) : null;
  const score = r ? r.score : 0;
  const heat = phase === "input" ? 0.55 : phase === "loading" ? 1.25 : 0.5 + (score / 100) * 0.9;
  const soup = r
    ? score > 80 ? "#5a2516" : score > 60 ? "#d6401b" : score > 40 ? "#ff7a2f" : score > 20 ? "#ffb547" : "#9ee3b8"
    : phase === "loading" ? "#ff6a2b" : "#ff9a52";
  const soupLight = lighten(soup, 0.45);
  const glowOp = phase === "input" ? 0.5 : phase === "loading" ? 0.95 : 0.35 + (score / 100) * 0.6;
  const boilDur = phase === "loading" ? 0.7 : phase === "result" ? 1.6 - score / 100 : 1.2;
  const steamCount = phase === "input" ? 3 : phase === "loading" ? 6 : Math.max(1, Math.round(score / 15));
  const embers = Array.from({ length: phase === "loading" ? 10 : 6 }, (_, i) => ({
    x: 120 + ((i * 41) % 120), r: 1.2 + (i % 3) * 0.6, d: i * 0.31, dx: (i % 2 ? 1 : -1) * (8 + ((i * 7) % 20)),
  }));
  const heatTf = `translate(180 258) scale(1 ${heat.toFixed(2)}) translate(-180 -258)`;
  const potLabel = phase === "result" ? `${score}%` : "CHAOS";

  function reveal() {
    if (!name.trim() || phase !== "input") return;
    setPhase("loading");
    setLoadIdx(0);
    setShown(0);
    [450, 900, 1350].forEach((ms, i) => later(() => setLoadIdx(i + 1), ms));
    later(() => {
      setPhase("result");
      const target = cookedResult(name).score;
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / 1100);
        setShown(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    }, 1850);
  }

  const stageH = phase === "loading" ? 360 : 280;

  const potScene = (
    <FitBox width={360} height={stageH} max={1.25}>
      <div className="relative h-full w-[360px]">
        {Array.from({ length: steamCount }, (_, i) => (
          <div
            key={i}
            className="absolute bottom-[200px] size-[46px] animate-fz-steam rounded-full bg-white/90 blur-[8px]"
            style={{ left: 95 + ((i * 53) % 150), animationDelay: `${(i * 0.42).toFixed(2)}s` }}
          />
        ))}
        <svg width="360" height="300" viewBox="0 0 360 300" className="absolute bottom-0 left-0" role="img" aria-label="A steel pot boiling on a gas flame">
          <defs>
            <linearGradient id="ck-steel" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#2c3038" /><stop offset=".1" stopColor="#6f7782" /><stop offset=".24" stopColor="#d9dfe6" /><stop offset=".31" stopColor="#ffffff" /><stop offset=".4" stopColor="#aeb6c0" /><stop offset=".62" stopColor="#5d646e" /><stop offset=".82" stopColor="#9aa3ae" /><stop offset=".93" stopColor="#4a5059" /><stop offset="1" stopColor="#23262c" />
            </linearGradient>
            <linearGradient id="ck-rim" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#5b626c" /><stop offset=".3" stopColor="#f4f7fa" /><stop offset=".55" stopColor="#9aa3ae" /><stop offset=".85" stopColor="#d4dae1" /><stop offset="1" stopColor="#4a5059" />
            </linearGradient>
            <linearGradient id="ck-copper" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#4a1906" /><stop offset=".22" stopColor="#b8582c" /><stop offset=".32" stopColor="#ffc79c" /><stop offset=".45" stopColor="#d27240" /><stop offset=".75" stopColor="#8a3814" /><stop offset="1" stopColor="#3a1404" />
            </linearGradient>
            <linearGradient id="ck-lid" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#ffffff" /><stop offset=".5" stopColor="#b9c1cb" /><stop offset="1" stopColor="#5d646e" />
            </linearGradient>
            <radialGradient id="ck-soup" cx=".42" cy=".38" r=".7">
              <stop offset="0" stopColor={soupLight} /><stop offset="1" stopColor={soup} />
            </radialGradient>
            <radialGradient id="ck-heat" cx=".5" cy="1" r=".9">
              <stop offset="0" stopColor="#ffb347" stopOpacity=".95" /><stop offset=".45" stopColor="#ff5a1f" stopOpacity=".45" /><stop offset="1" stopColor="#ff5a1f" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ck-glow" cx=".5" cy=".5" r=".5">
              <stop offset="0" stopColor="#ffb347" stopOpacity=".85" /><stop offset=".5" stopColor="#ff6a1f" stopOpacity=".3" /><stop offset="1" stopColor="#ff6a1f" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ck-fo" x1="0" x2="0" y1="1" y2="0">
              <stop offset="0" stopColor="#ff7a00" /><stop offset=".45" stopColor="#ff9f1a" /><stop offset=".8" stopColor="#ffd166" stopOpacity=".85" /><stop offset="1" stopColor="#fff1b8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ck-fm" x1="0" x2="0" y1="1" y2="0">
              <stop offset="0" stopColor="#ffd166" /><stop offset=".7" stopColor="#fff3c4" stopOpacity=".9" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ck-fb" x1="0" x2="0" y1="1" y2="0">
              <stop offset="0" stopColor="#1d4ed8" /><stop offset=".55" stopColor="#60a5fa" stopOpacity=".85" /><stop offset="1" stopColor="#bfdbfe" stopOpacity="0" />
            </linearGradient>
            <filter id="ck-wobble" x="-20%" y="-40%" width="140%" height="160%">
              <feTurbulence type="fractalNoise" baseFrequency="0.03 0.09" numOctaves={2} seed={3} result="n">
                <animate attributeName="baseFrequency" dur="1.6s" values="0.03 0.09;0.035 0.12;0.03 0.09" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="n" scale={7} xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <clipPath id="ck-soupclip"><ellipse cx="180" cy="137" rx="90" ry="12" /></clipPath>
          </defs>

          <ellipse cx="180" cy="286" rx="150" ry="12" fill="#3a1406" opacity=".14" />
          <ellipse className="animate-fz-glow" cx="180" cy="250" rx="150" ry="60" fill="url(#ck-glow)" opacity={glowOp} />

          <g transform={heatTf} filter="url(#ck-wobble)">
            {BACK.map((f, i) => (
              <g key={i} transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)})`}>
                <g className="origin-[50%_100%] animate-fz-flk [transform-box:fill-box]" style={{ animationDelay: `${f.d.toFixed(2)}s` }}>
                  <path d={f.outer} fill="url(#ck-fo)" />
                  <path d={f.blue} fill="url(#ck-fb)" />
                </g>
              </g>
            ))}
          </g>

          <path d="M72 270 L288 270 L298 284 L62 284 Z" fill="#2a2d33" />
          <path d="M72 270 L288 270" stroke="#4b5058" strokeWidth="2" />
          <ellipse cx="180" cy="260" rx="70" ry="13" fill="#17191d" />
          <ellipse cx="180" cy="258" rx="58" ry="9" fill="#3a3e46" />
          <ellipse cx="180" cy="257" rx="40" ry="6" fill="#55595f" />
          <path d="M98 262 L122 246 M262 262 L238 246 M132 270 L146 250 M228 270 L214 250" stroke="#101215" strokeWidth="7" strokeLinecap="round" />

          <g className={phase === "loading" ? "animate-fz-pshake" : ""}>
            <path d="M80 150 C 46 148, 44 178, 80 176" stroke="#3c4148" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M80 152 C 54 151, 52 172, 80 172" stroke="#9aa3ae" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".7" />
            <path d="M280 150 C 314 148, 316 178, 280 176" stroke="#3c4148" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M280 152 C 306 151, 308 172, 280 172" stroke="#c9d0d8" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".7" />
            <path d="M80 134 L80 214 Q80 240 112 242 L248 242 Q280 240 280 214 L280 134 Z" fill="url(#ck-steel)" />
            <path d="M80 208 L80 214 Q80 240 112 242 L248 242 Q280 240 280 214 L280 208 Z" fill="url(#ck-copper)" />
            <path d="M80 208 L280 208" stroke="#ffd7b5" strokeWidth="1.5" opacity=".6" />
            <path className="animate-fz-glow" d="M80 196 L80 214 Q80 240 112 242 L248 242 Q280 240 280 214 L280 196 Z" fill="url(#ck-heat)" opacity={glowOp} />
            <rect x="118" y="146" width="7" height="56" rx="3.5" fill="#ffffff" opacity=".55" />
            <text x="181" y="185" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="19" letterSpacing="4" fill="#ffffff" opacity=".55">{potLabel}</text>
            <text x="180" y="184" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="19" letterSpacing="4" fill="#3a3f47" opacity=".75">{potLabel}</text>
            <ellipse cx="180" cy="134" rx="104" ry="20" fill="url(#ck-rim)" />
            <ellipse cx="180" cy="135" rx="95" ry="15.5" fill="#1b1d22" />
            <ellipse cx="180" cy="137" rx="90" ry="12" fill="url(#ck-soup)" />
            <g clipPath="url(#ck-soupclip)">
              {BUBBLES.map((b, i) => (
                <circle
                  key={i}
                  className="origin-center animate-fz-boil [transform-box:fill-box]"
                  cx={b.x} cy={b.y} r={b.r} fill="none" stroke={soupLight} strokeWidth="1.6"
                  style={{ animationDelay: `${b.d}s`, animationDuration: `${boilDur.toFixed(2)}s` }}
                />
              ))}
              <ellipse cx="150" cy="133" rx="26" ry="3" fill="#ffffff" opacity=".28" />
            </g>
            <path d="M76 136 Q180 166 284 136" stroke="#ffffff" strokeWidth="2" fill="none" opacity=".65" />
            {phase === "loading" && (
              <g className="origin-[90px_130px] animate-fz-lid">
                <path d="M80 130 Q180 66 280 130 Z" fill="url(#ck-lid)" />
                <ellipse cx="180" cy="130" rx="102" ry="14" fill="url(#ck-rim)" />
                <path d="M120 112 Q150 92 182 88" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".7" />
                <rect x="166" y="78" width="28" height="16" rx="8" fill="#e8501f" />
                <rect x="171" y="80" width="10" height="4" rx="2" fill="#ffb38a" />
              </g>
            )}
          </g>

          <g transform={heatTf} filter="url(#ck-wobble)">
            {FRONT.map((f, i) => (
              <g key={i} transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)})`}>
                <g className="origin-[50%_100%] animate-fz-flk [transform-box:fill-box]" style={{ animationDelay: `${f.d.toFixed(2)}s` }}>
                  <path d={f.outer} fill="url(#ck-fo)" />
                  <path d={f.mid} fill="url(#ck-fm)" />
                  <path d={f.blue} fill="url(#ck-fb)" />
                </g>
              </g>
            ))}
          </g>
          {embers.map((e, i) => (
            <circle
              key={i}
              className="animate-fz-ember opacity-0 [transform-box:fill-box]"
              cx={e.x} cy="250" r={e.r.toFixed(1)} fill="#ffcf5a"
              style={{ animationDelay: `${e.d.toFixed(2)}s`, ["--dx" as string]: `${e.dx}px` }}
            />
          ))}
        </svg>
      </div>
    </FitBox>
  );

  const stage = <div className={phase === "result" ? "hidden lg:block" : ""}>{potScene}</div>;

  const controls = (
    <>
      {phase === "input" && (
        <div className="flex flex-col gap-3.5 px-6 lg:px-0">
          <label htmlFor="cooked-name" className="text-sm font-bold text-[#7a4a35]">Your name</label>
          <input
            id="cooked-name"
            className="w-full rounded-2xl border-2 border-[#f0c9b4] bg-white px-[18px] py-4 text-lg font-medium text-[#3a1406] outline-none focus:border-[#e8501f] focus:shadow-[0_0_0_4px_rgba(232,80,31,.15)]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && reveal()}
            placeholder="e.g. Aarav"
            maxLength={30}
            autoComplete="off"
          />
          <button className={btn} onClick={reveal} disabled={!name.trim()}>Reveal my result</button>
          <div className="pointer-events-none flex items-end justify-center gap-1 overflow-hidden pt-2">
            <div className="mb-[58px] animate-fz-peek rounded-[16px_16px_4px_16px] bg-white px-3 py-2.5 text-[13px] font-bold text-navy shadow-[0_6px_16px_rgba(16,42,76,.12)]">
              Same name, same result.<br />Every time. Hoot!
            </div>
            <OwlPeek className="w-[132px]" />
          </div>
        </div>
      )}

      {phase === "loading" && (
        <div className="flex flex-col items-center gap-3.5 px-8 py-2 lg:px-0">
          <div className="text-center font-display text-[28px] font-normal text-navy">{MSGS[loadIdx % 4]}</div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-[#f6d9c8]">
            <div className="h-full animate-fz-fill rounded-full bg-[#e8501f]" />
          </div>
          <div className="text-sm text-[#9a6a55]">Analysing {name}&apos;s stress levels…</div>
        </div>
      )}

      {phase === "result" && r && (
        <div className="relative flex flex-col items-center gap-5 px-6 pt-1 lg:px-0">
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2;
            return (
              <div
                key={i}
                className="absolute left-1/2 top-[40%] z-10 size-2.5 animate-fz-spark rounded-[3px]"
                style={{ background: SPARK_COLORS[i % 5], ["--dx" as string]: `${Math.round(Math.cos(a) * 150)}px`, ["--dy" as string]: `${Math.round(Math.sin(a) * 120)}px`, animationDelay: `${((i % 3) * 0.05).toFixed(2)}s` }}
              />
            );
          })}
          <div className="animate-fz-popin w-full">
            <CardCooked cardRef={cardRef} data={{ name: name.trim(), score: shown, tier: r.tier, bg: r.bg, verdict: r.verdict }} />
          </div>
          <CardActions
            getNode={() => cardRef.current}
            fileName="how-cooked-toppershelf.png"
            shareText={`${name.trim()} is ${r.score}% cooked. How cooked are you?`}
            shareUrl={resultLink("cooked", { n: name.trim() })}
            btnClass={`${btn} min-h-12 p-3 text-base`}
            ghostClass={ghost}
          />
          <button type="button" className={`${ghost} w-full`} onClick={() => { setPhase("input"); setName(""); setShown(0); }}>Try another name</button>
        </div>
      )}
    </>
  );

  return (
    <GameShell
      gradient="linear-gradient(150deg,#fb923c 0%,#f43f5e 58%,#c026d3 100%)"
      icon="/fun-zone/how-cooked.webp"
      iconBg="#fed1bb"
      title="How Cooked Are You?"
      subtitle="A very scientific score of how overwhelmed you are."
      status="LIVE"
      panelClass="bg-[#fff1e9] text-[#3a1406]"
      rootClass="bg-[#fff1e9]"
      stage={stage}
      controls={controls}
    />
  );
}
