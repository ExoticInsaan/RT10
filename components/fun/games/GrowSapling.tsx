"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useGardenSync } from "@/components/fun/useGardenSync";
import { FitBox, GameShell, copyText, loadJSON, rng, saveJSON, useTimers } from "@/components/fun/kit";

/* ---------- garden data ---------- */

type Who = "a" | "b";
type Garden = {
  offset: number; // preview: days skipped forward
  cared: number; // total waterings across all trees (365 per tree)
  streak: number;
  best: number;
  lastW: number | null; // day number of the last watering
  names: { a: string; b: string };
  me: Who;
  log: Record<string, Who>; // day number -> who watered
  code: string;
};
type PathSpec = { d: string; fill: string; stroke: string; sw: number | string; tf: string; op: number | string };
type CircleSpec = { cx: string; cy: string; r: number | string; fill: string; tf: string; op: number };

const KEY = "fz-garden";
const SPECIES = [
  { name: "Mango", seed: "#b45309", trunk: "#7c4a1e", l1: "#15803d", l2: "#22c55e", fl: "#fef3c7", fr: "#f59e0b", frR: 5.5, pack: "#fde68a", pinkBloom: false },
  { name: "Apple", seed: "#78350f", trunk: "#6b3d17", l1: "#16a34a", l2: "#4ade80", fl: "#fbcfe8", fr: "#ef4444", frR: 6, pack: "#fecaca", pinkBloom: false },
  { name: "Orange", seed: "#a16207", trunk: "#6b4423", l1: "#166534", l2: "#22c55e", fl: "#ffffff", fr: "#fb923c", frR: 6, pack: "#fed7aa", pinkBloom: false },
  { name: "Sakura", seed: "#57534e", trunk: "#57382a", l1: "#65a30d", l2: "#a3e635", fl: "#f9a8d4", fr: "#be123c", frR: 3.5, pack: "#fbcfe8", pinkBloom: true },
  { name: "Gulmohar", seed: "#44403c", trunk: "#5b3a1f", l1: "#15803d", l2: "#84cc16", fl: "#ef4444", fr: "#78350f", frR: 3.5, pack: "#fecdd3", pinkBloom: false },
];
const SLOTS = [[62, 230], [330, 232], [118, 224], [272, 226], [24, 236], [366, 236], [160, 220], [232, 221]];
const TUFTS = [20, 70, 110, 150, 240, 290, 330, 372];
const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"];

const stageOf = (d: number) =>
  d <= 0 ? "SEED" : d <= 6 ? "SPROUT" : d <= 30 ? "SEEDLING" : d <= 90 ? "SAPLING" : d <= 180 ? "YOUNG TREE" : d <= 240 ? "LEAFY TREE" : d <= 300 ? "FLOWERING" : d < 365 ? "FRUITING" : "FULLY GROWN";

const milestone = (d: number, sp: string) =>
  ({ 1: `Your ${sp} seed sprouted!`, 7: "First true leaves!", 31: "It is a sapling now", 91: "Growing into a young tree", 181: "Full green canopy", 241: "First flowers bloomed!", 301: "First fruits!", 365: "Tree fully grown! Seed unlocked" } as Record<number, string>)[d] || "";

const epoch = () => {
  const n = new Date();
  return Math.floor((n.getTime() - n.getTimezoneOffset() * 60000) / 86400000);
};
const newCode = () => Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
const trimLog = (log: Record<string, Who>, today: number) => {
  const o: Record<string, Who> = {};
  Object.keys(log).forEach((k) => {
    if (+k > today - 14) o[k] = log[k];
  });
  return o;
};

/** Draws one tree for a given day of its 365-day life, as SVG paths and circles. */
function tree(si: number, d: number, x: number, y: number, s: number, wilt: boolean, seed: number) {
  const S = SPECIES[si % 5];
  const R = rng(seed);
  const paths: PathSpec[] = [];
  const circles: CircleSpec[] = [];
  const tf = `translate(${x} ${y}) scale(${s})`;
  const f = (n: number) => n.toFixed(1);
  if (d <= 0) return { paths, circles };
  const H = d <= 6 ? 4 + d * 3 : d <= 30 ? 22 + (d - 6) * 1.8 : d <= 90 ? 65 + (d - 30) : d <= 180 ? 125 + (d - 90) * 0.5 : 170 + (Math.min(d, 365) - 180) * 0.16;
  const bw = 1.4 + 9 * Math.min(1, d / 300);
  const tw = Math.max(0.9, bw * 0.35);
  const woody = d > 30;
  const l1 = wilt ? "#a3a35a" : S.l1;
  const l2 = wilt ? "#bfae4a" : S.l2;
  paths.push({
    d: `M${f(-bw)} 0 Q${f(-bw * 0.6)} ${f(-H * 0.5)} ${f(-tw)} ${f(-H)} L${f(tw)} ${f(-H)} Q${f(bw * 0.6)} ${f(-H * 0.5)} ${f(bw)} 0 Z`,
    fill: woody ? S.trunk : wilt ? "#8a8a3a" : "#65a30d", stroke: "none", sw: 0, tf, op: 1,
  });
  const leaf = "M0 0 C 6 -8, 18 -8, 24 0 C 18 6, 6 6, 0 0 Z";
  if (d <= 6) {
    const sc = 0.35 + d * 0.1;
    [-160, -20].forEach((a, i) => paths.push({ d: leaf, fill: i ? l2 : l1, stroke: "none", sw: 0, tf: `${tf} translate(0 ${f(-H)}) rotate(${wilt ? (i ? 30 : 150) : a}) scale(${f(sc)})`, op: 1 }));
  } else if (d <= 75) {
    const n = Math.min(7, 1 + Math.floor((d - 1) / 5));
    const sc = 0.6 + Math.min(1, d / 40) * 0.6;
    const fade = d > 45 ? Math.max(0, 1 - (d - 45) / 30) : 1;
    for (let i = 0; i < n; i++) {
      const t = (i + 1) / (n + 1);
      const left = i % 2 === 0;
      const a = wilt ? (left ? 160 : 20) : left ? 200 : -20;
      paths.push({ d: leaf, fill: i % 2 ? l2 : l1, stroke: "none", sw: 0, tf: `${tf} translate(0 ${f(-H * t)}) rotate(${a}) scale(${f(sc * (1.1 - t * 0.4))})`, op: fade.toFixed(2) });
    }
    paths.push({ d: leaf, fill: l2, stroke: "none", sw: 0, tf: `${tf} translate(0 ${f(-H)}) rotate(-80) scale(${f(sc * 0.7)})`, op: fade.toFixed(2) });
  }
  let r = 0;
  const cy = -H * 0.92;
  if (d > 30) {
    r = d <= 90 ? 10 + ((d - 31) / 59) * 20 : d <= 180 ? 30 + ((d - 90) / 90) * 20 : 50 + ((Math.min(d, 365) - 180) / 185) * 12;
    const nb = Math.min(6, 2 + Math.floor((d - 31) / 40));
    const ends: number[][] = [];
    for (let i = 0; i < nb; i++) {
      const y0 = -H * (0.5 + (0.38 * i) / nb);
      const side = i % 2 ? 1 : -1;
      const L = Math.min(1, (d - 31) / 150) * r * 1.1 * (1 - (0.25 * i) / nb) + 6;
      const ex = side * L * 0.95;
      const ey = y0 - L * 0.55;
      paths.push({ d: `M0 ${f(y0)} Q${f(side * L * 0.4)} ${f(y0 - L * 0.1)} ${f(ex)} ${f(ey)}`, fill: "none", stroke: S.trunk, sw: f(Math.max(1.2, bw * 0.45)), tf, op: 1 });
      ends.push([ex, ey]);
    }
    const pink = S.pinkBloom && d >= 245 && d <= 320 && !wilt;
    const c1 = pink ? "#f472b6" : l1;
    const c2 = pink ? "#fbcfe8" : l2;
    ends.forEach((e) => circles.push({ cx: f(e[0]), cy: f(e[1]), r: f(r * 0.42), fill: c1, tf, op: 1 }));
    ([[0, 0, 1, c1], [-0.75, 0.28, 0.74, c1], [0.75, 0.28, 0.74, c1], [-0.45, -0.42, 0.72, c2], [0.45, -0.42, 0.72, c2], [0, 0.42, 0.7, c1], [-1, 0.62, 0.48, c2], [1, 0.62, 0.48, c2], [0, -0.62, 0.6, c2]] as [number, number, number, string][]).forEach((b) =>
      circles.push({ cx: f(b[0] * r), cy: f(cy + b[1] * r), r: f(r * b[2]), fill: b[3], tf, op: 1 }),
    );
    circles.push({ cx: f(-r * 0.35), cy: f(cy - r * 0.45), r: f(r * 0.35), fill: "#ffffff", tf, op: 0.14 });
  }
  if (d > 240 && !wilt) {
    const nfr = Math.round(Math.min(1, Math.max(0, (d - 300) / 55)) * 14);
    const nf = Math.max(0, Math.round(Math.min(1, (d - 240) / 45) * 24) - Math.round(nfr * 1.3));
    const pt = () => {
      const a = R() * Math.PI * 2;
      const rr = r * 0.86 * Math.sqrt(R());
      return [Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.9];
    };
    const fp: number[][] = [];
    const up: number[][] = [];
    for (let i = 0; i < 24; i++) fp.push(pt());
    for (let i = 0; i < 14; i++) up.push(pt());
    for (let i = 0; i < nf; i++) {
      circles.push({ cx: f(fp[i][0]), cy: f(fp[i][1]), r: si % 5 === 4 ? 4.6 : 3.8, fill: S.fl, tf, op: 1 });
      circles.push({ cx: f(fp[i][0]), cy: f(fp[i][1]), r: 1.5, fill: "#facc15", tf, op: 1 });
    }
    for (let i = 0; i < nfr; i++) {
      circles.push({ cx: f(up[i][0]), cy: f(up[i][1]), r: S.frR, fill: S.fr, tf, op: 1 });
      circles.push({ cx: f(up[i][0] - S.frR * 0.35), cy: f(up[i][1] - S.frR * 0.35), r: f(S.frR * 0.3), fill: "#ffffff", tf, op: 0.55 });
    }
  }
  return { paths, circles };
}

/* ---------- styles ---------- */

const mini =
  "min-h-11 flex-1 cursor-pointer rounded-xl border-2 border-[#bbf7d0] bg-white px-2 text-xs font-extrabold text-[#065f46] shadow-[0_3px_0_#bbf7d0] active:translate-y-0.5 active:shadow-[0_1px_0_#bbf7d0]";
const buddyBtn =
  "min-h-11 cursor-pointer whitespace-nowrap rounded-xl border-0 bg-[#047857] px-3 text-[13px] font-extrabold text-white shadow-[0_3px_0_#065f46] active:translate-y-0.5 active:shadow-[0_1px_0_#065f46]";
const buddyGhost = "!border-2 !border-[#bbf7d0] !bg-white !text-[#065f46] !shadow-[0_3px_0_#bbf7d0]";
const bigBtn =
  "flex min-h-[54px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-[18px] border-0 bg-[#0ea5e9] px-[18px] py-3 text-[17px] font-black text-white shadow-[0_6px_0_#0369a1,0_14px_24px_rgba(3,105,161,.3)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_2px_0_#0369a1] disabled:cursor-default disabled:opacity-50";
const avatar = "box-border flex size-[34px] shrink-0 items-center justify-center rounded-full border-[3px] border-white text-sm font-black text-white";
const sheetInput =
  "box-border w-full rounded-[14px] border-2 border-[#bbf7d0] bg-white px-3.5 py-[13px] text-base font-medium text-[#064e3b] outline-none placeholder:text-[#7fb59a] focus:border-[#059669] focus:shadow-[0_0_0_4px_rgba(5,150,105,.15)]";

function loadGarden(): Garden {
  const s = loadJSON<Partial<Garden>>(KEY);
  return { offset: 0, cared: 0, streak: 0, best: 0, lastW: null, names: { a: "", b: "" }, me: "a", log: {}, code: newCode(), ...(s || {}) };
}

/* ---------- component ---------- */

const noop = () => () => {};

/** The garden lives in localStorage, so it only renders after mount. */
export default function GrowSapling() {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  return mounted ? <GardenGame /> : <div className="mx-auto min-h-[640px] w-full max-w-[28rem] rounded-[28px] bg-[#ecfdf3] lg:max-w-[64rem]" aria-busy="true" />;
}

function GardenGame() {
  const [g, setG] = useState<Garden>(loadGarden);
  const [watering, setWatering] = useState(false);
  const [boing, setBoing] = useState(false);
  const [plus, setPlus] = useState(false);
  const [toast, setToast] = useState("");
  const [sheet, setSheet] = useState<"" | "invite" | "join" | "manage">("");
  const [draftA, setDraftA] = useState("");
  const [draftB, setDraftB] = useState("");
  const [nudge, setNudge] = useState("");
  const [copied, setCopied] = useState(false);
  const later = useTimers();
  useGardenSync(g, setG, KEY);
  const nudgeTimer = useRef(0);

  const set = (patch: Partial<Garden>) => {
    const next = { ...g, ...patch };
    setG(next);
    saveJSON(KEY, next);
  };
  const nm = (k: Who) => g.names[k] || (k === "a" ? "You" : "Buddy");
  const say = (msg: string) => {
    setNudge(msg);
    window.clearTimeout(nudgeTimer.current);
    nudgeTimer.current = later(() => setNudge(""), 3200);
  };
  const flash = (msg: string) => {
    setToast(msg);
    later(() => setToast(""), 3000);
  };

  const today = epoch() + g.offset;
  const wilted = g.lastW !== null && g.lastW < today - 1 && g.cared > 0;
  const wateredToday = g.lastW === today;
  const streakNow = g.lastW !== null && g.lastW >= today - 1 ? g.streak : 0;
  const comp = g.cared > 0 ? Math.floor((g.cared - 1) / 365) : 0;
  const d = g.cared - comp * 365;
  const si = comp % 5;
  const S = SPECIES[si];
  const paired = !!g.names.b;
  const waterer = wateredToday ? g.log[today] : null;
  const totalTrees = comp + (d >= 365 ? 1 : 0);
  const link = "toppershelf.online/fun/garden/" + g.code;

  const front = tree(si, d, 195, 256, 0.92, wilted, 1000 + comp * 77);
  const back = { paths: [] as PathSpec[], circles: [] as CircleSpec[] };
  for (let t = Math.max(0, comp - 8); t < comp; t++) {
    const sl = SLOTS[(comp - 1 - t) % 8];
    const sc = 0.36 + ((t * 37) % 7) / 100;
    const tr = tree(t % 5, 365, sl[0], sl[1], sc, false, 1000 + t * 77);
    back.paths.push(...tr.paths);
    back.circles.push(...tr.circles);
  }
  const roots: { d: string; sw: string }[] = [];
  if (d > 0) {
    const L = Math.min(62, 8 + d * 0.5);
    roots.push({ d: `M195 264 Q 193 ${(264 + L * 0.5).toFixed(0)} 197 ${(264 + L).toFixed(0)}`, sw: Math.min(4, 1.5 + d / 120).toFixed(1) });
    const n = Math.min(6, Math.floor(d / 18));
    for (let i = 0; i < n; i++) {
      const y0 = 268 + i * 8;
      const side = i % 2 ? 1 : -1;
      const l = Math.min(46, 10 + (d - i * 18) * 0.25);
      roots.push({ d: `M195 ${y0} q ${side * l * 0.5} 4 ${side * l} ${10 + i * 2}`, sw: "1.4" });
    }
  }
  const week = Array.from({ length: 7 }, (_, i) => {
    const day = today - 6 + i;
    const who = g.log[day];
    const dow = new Date(day * 86400000).getUTCDay();
    return { t: who ? nm(who)[0].toUpperCase() : DAY_NAMES[dow], bg: who === "a" ? "#f59e0b" : who === "b" ? "#8b5cf6" : "#e2e8f0", ring: day === today };
  });
  const ticks = ([[1, "Sprout"], [31, "Sapling"], [91, "Tree"], [241, "Flowers"], [301, "Fruits"]] as const).map((t) => ({ p: ((t[0] / 365) * 100).toFixed(1), c: d >= t[0] ? "#047857" : "#a7f3d0" }));
  const seeds = SPECIES.map((s, k) => {
    let grown = 0;
    for (let t = 0; t < comp; t++) if (t % 5 === k) grown++;
    if (d >= 365 && si === k) grown++;
    const growing = k === si && d < 365;
    const locked = k > comp;
    const status = locked ? `Day ${365 * k}` : growing ? "Growing" : grown > 0 ? `Grown ×${grown}` : "Ready";
    return { name: s.name, c: locked ? "#94a3b8" : s.seed, bg: locked ? "#f1f5f9" : s.pack, edge: locked ? "#e2e8f0" : "rgba(6,78,59,.18)", tc: locked ? "#475569" : "#3b1d0a", locked, status, growing };
  });

  function water() {
    if (watering) return;
    if (g.lastW === today) {
      const who = g.log[today];
      say(!who || who === g.me ? "You already watered today. Come back tomorrow!" : `${nm(who)} already watered today. Come back tomorrow!`);
      return;
    }
    setWatering(true);
    const snap = g;
    later(() => {
      const cared = snap.cared + 1;
      const streak = snap.lastW === today - 1 ? snap.streak + 1 : 1;
      const c2 = Math.floor((cared - 1) / 365);
      const dd = cared - c2 * 365;
      const sp = SPECIES[c2 % 5].name;
      let msg = milestone(dd, sp);
      if (dd === 1 && c2 > 0) msg = `Planted your ${sp} seed!`;
      const log = trimLog({ ...snap.log, [today]: snap.me }, today);
      const next = { ...snap, cared, streak, best: Math.max(snap.best, streak), lastW: today, log };
      setG(next);
      saveJSON(KEY, next);
      setWatering(false);
      setBoing(true);
      setPlus(true);
      setToast(msg);
      later(() => { setBoing(false); setPlus(false); }, 1200);
      if (msg) later(() => setToast(""), 3000);
    }, 1400);
  }
  function jump(n: number) {
    const alive = g.lastW !== null && g.lastW >= today - 1;
    const offset = g.offset + (wateredToday ? n : n - 1);
    const cared = g.cared + n;
    const streak = (alive ? g.streak : 0) + n;
    const c2 = Math.floor((cared - 1) / 365);
    const dd = cared - c2 * 365;
    const end = epoch() + offset;
    const log = { ...g.log };
    for (let i = 0; i < Math.min(n, 14); i++) log[end - i] = paired ? (i % 3 === 1 ? (g.me === "a" ? "b" : "a") : g.me) : "a";
    set({ offset, cared, streak, best: Math.max(g.best, streak), lastW: end, log: trimLog(log, end) });
    flash(`Day ${dd}: ${stageOf(dd).toLowerCase()}`);
  }
  function joinNow() {
    const n = draftB.trim();
    if (!n) return;
    set({ names: { ...g.names, b: n }, me: "b" });
    setSheet("");
    setDraftB("");
    flash(`Welcome to the garden, ${n}!`);
  }

  const wilting = wilted;
  const sky = wilting ? "#cbd5e1" : "#bae6fd";
  const sceneLabel = `${S.name} tree, day ${d}, garden of ${totalTrees} trees`;
  const waterLabel = watering
    ? "Watering…"
    : wateredToday
      ? waterer && waterer !== g.me ? `${nm(waterer)} watered today` : "You watered today"
      : d >= 365 ? "Water to plant your next seed" : wilting ? "Water to revive" : `Water today (day ${d + 1})`;
  const seedOp = d <= 8 ? (d <= 6 ? 1 : (8 - d) / 2) : 0;

  const stage = (
    <FitBox width={358} height={288} max={1.45}>
      <div className="relative h-[288px] w-[358px] overflow-hidden rounded-3xl transition-[background] duration-1000" style={{ background: sky }}>
        <div
          className="absolute right-7 top-5 size-[46px] rounded-full transition-all duration-1000"
          style={{ background: wilting ? "#e2e8f0" : "#fde047", boxShadow: `0 0 0 10px ${wilting ? "rgba(255,255,255,.3)" : "rgba(253,224,71,.35)"}` }}
        />
        <div className="absolute top-7 h-6 w-20 animate-fz-cloud rounded-full bg-white/90" style={{ animationDuration: "26s" }} />
        <div className="absolute top-[70px] h-6 w-14 animate-fz-cloud rounded-full bg-white/90" style={{ animationDuration: "34s", animationDelay: "-14s" }} />
        <svg width="358" height="288" viewBox="0 0 390 340" preserveAspectRatio="xMidYMid slice" className="absolute inset-0" role="img" aria-label={sceneLabel}>
          <ellipse cx="80" cy="236" rx="160" ry="56" fill={wilting ? "#9ca38a" : "#86efac"} />
          <ellipse cx="320" cy="240" rx="170" ry="60" fill={wilting ? "#a8ad95" : "#6ee7b7"} />
          <rect x="0" y="214" width="390" height="30" fill={wilting ? "#a3a873" : "#4ade80"} />
          <g className="animate-fz-swayb [transform-origin:195px_230px]">
            {back.paths.map((p, i) => <path key={i} d={p.d} fill={p.fill} stroke={p.stroke} strokeWidth={p.sw} strokeLinecap="round" transform={p.tf} opacity={p.op} />)}
            {back.circles.map((c, i) => <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} transform={c.tf} opacity={c.op} />)}
          </g>
          <polygon points="0,240 390,240 390,264 0,264" fill={wilting ? "#8f9a55" : "#22c55e"} />
          <polygon points="0,240 390,240 390,246 0,246" fill={wilting ? "#a3a35a" : "#4ade80"} />
          <rect x="0" y="264" width="390" height="76" fill="#7c4a1e" />
          <rect x="0" y="264" width="390" height="10" fill="#5c3412" />
          <rect x="0" y="300" width="390" height="40" fill="#6b3d17" />
          <circle cx="40" cy="290" r="5" fill="#9a6b3f" /><circle cx="120" cy="318" r="4" fill="#9a6b3f" /><circle cx="300" cy="286" r="6" fill="#9a6b3f" /><circle cx="350" cy="322" r="4" fill="#9a6b3f" /><circle cx="250" cy="330" r="3" fill="#9a6b3f" />
          {roots.map((r, i) => <path key={i} d={r.d} stroke="#e7c9a0" strokeWidth={r.sw} fill="none" strokeLinecap="round" />)}
          <g opacity={seedOp}>
            <ellipse cx="195" cy="282" rx="10" ry="7" fill={S.seed} />
            <ellipse cx="192" cy="279" rx="3.5" ry="2" fill="rgba(255,255,255,.45)" />
            <path d="M190 282 L195 279 L200 283" stroke="#3f2a12" strokeWidth="1.6" fill="none" opacity={d >= 1 ? 1 : 0} />
          </g>
          <ellipse cx="195" cy="257" rx="24" ry="6" fill="#8b5a2b" />
          <g className={boing ? "animate-fz-boing [transform-origin:195px_256px]" : ""}>
            <g className="animate-fz-sway [transform-origin:195px_256px]">
              {front.paths.map((p, i) => <path key={i} d={p.d} fill={p.fill} stroke={p.stroke} strokeWidth={p.sw} strokeLinecap="round" transform={p.tf} opacity={p.op} />)}
              {front.circles.map((c, i) => <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} transform={c.tf} opacity={c.op} />)}
            </g>
          </g>
          {TUFTS.map((x) => <path key={x} d={`M${x} 246 l -3 -7 M${x} 246 l 0 -9 M${x} 246 l 3 -7`} stroke={wilting ? "#a3a35a" : "#4ade80"} strokeWidth="2.4" fill="none" strokeLinecap="round" />)}
        </svg>

        <div className="absolute left-3 top-3 z-[3] max-w-[200px] rounded-[14px] bg-white/95 px-[11px] py-[7px]">
          <div className="text-[11px] font-black tracking-[.1em] text-[#047857]">{wilting ? "WILTING, WATER ME" : stageOf(d)}</div>
          <div className="text-[13px] font-extrabold text-[#064e3b]">{S.name} · Day {d}/365</div>
        </div>
        <div className="absolute right-3 top-[78px] z-[3] flex items-center gap-[5px] rounded-full bg-white/95 py-1.5 pl-2 pr-[11px]">
          <svg className="origin-[50%_90%] animate-fz-flame" width="18" height="20" viewBox="0 0 18 20" aria-hidden="true">
            <path d="M9 1c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 2-7 2 1 3 3 3 5 1-2 1-6 1-9z" fill={streakNow > 0 ? "#f97316" : "#cbd5e1"} />
          </svg>
          <span className="text-[15px] font-black">{streakNow}</span>
          <span className="text-[11px] font-bold text-[#047857]">day streak</span>
        </div>

        {watering && (
          <>
            <div className="absolute left-[52%] top-[18px] origin-[30%_70%] animate-fz-pour" aria-hidden="true">
              <svg width="86" height="66" viewBox="0 0 90 70">
                <path d="M20 20 h40 a6 6 0 0 1 6 6 v30 a8 8 0 0 1 -8 8 h-36 a8 8 0 0 1 -8 -8 v-30 a6 6 0 0 1 6 -6z" fill="#0ea5e9" />
                <path d="M14 30 L -6 14" stroke="#0284c7" strokeWidth="8" strokeLinecap="round" />
                <path d="M66 30 q 18 6 6 26" stroke="#0284c7" strokeWidth="6" fill="none" />
              </svg>
            </div>
            <div className="absolute left-[47%] top-[84px]">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="absolute h-[11px] w-[7px] animate-fz-drop rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-[#38bdf8]" style={{ left: i * 7 - 14, animationDelay: `${(i * 0.12).toFixed(2)}s` }} />
              ))}
            </div>
          </>
        )}
        {plus && <div className="absolute left-1/2 top-[44%] -ml-6 animate-fz-plus text-xl font-black text-[#047857]">+1 day</div>}
        {toast && (
          <div className="absolute bottom-3 left-1/2 z-[6] flex animate-fz-toast items-center gap-2 whitespace-nowrap rounded-[18px] bg-[#102a4c] py-1.5 pl-1.5 pr-3.5 text-white shadow-[0_10px_24px_rgba(16,42,76,.35)]">
            <Image src="/mascot/owl-peek.webp" alt="" width={46} height={36} className="block h-auto w-[46px]" />
            <span className="text-sm font-extrabold">{toast}</span>
          </div>
        )}
      </div>
    </FitBox>
  );

  const controls = (
    <>
      <div className="flex items-center gap-2.5 rounded-2xl bg-white px-2.5 py-2 shadow-[0_4px_0_#bbf7d0]">
        <div className="flex items-center">
          <div className={avatar} style={{ background: "#f59e0b" }}>{(g.names.a[0] || "Y").toUpperCase()}</div>
          {paired ? (
            <div className={`${avatar} -ml-2.5`} style={{ background: "#8b5cf6" }}>{(g.names.b[0] || "B").toUpperCase()}</div>
          ) : (
            <div className={`${avatar} -ml-2 !border-2 !border-dashed !border-[#34d399] !bg-white !text-[#059669]`}>+</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-black">
            {paired ? `${nm("a")} & ${nm("b")}’s garden` : `${g.names.a ? g.names.a + "’s garden" : "Your garden"} · solo`}
          </div>
          <div className="mt-1 flex gap-[3px]" role="img" aria-label="Who watered in the last 7 days">
            {week.map((w, i) => (
              <div key={i} className="flex size-[17px] items-center justify-center rounded-md text-[10px] font-black text-white" style={{ background: w.bg, outline: w.ring ? "2px solid #047857" : "none" }}>{w.t}</div>
            ))}
          </div>
        </div>
        {paired ? (
          <button type="button" className={`${buddyBtn} ${buddyGhost}`} onClick={() => setSheet("manage")} aria-label={`Garden buddies, viewing as ${nm(g.me)}`}>As {nm(g.me)}</button>
        ) : (
          <button type="button" className={buddyBtn} onClick={() => setSheet("invite")}>Add a buddy</button>
        )}
      </div>

      <div className="flex flex-col gap-[7px] rounded-2xl bg-white px-3 py-2.5 shadow-[0_4px_0_#bbf7d0]">
        <div className="flex items-center justify-between gap-2 text-xs font-extrabold">
          <span className="text-[#047857]">Tree {comp + 1} progress</span>
          <span className="text-right">Garden: {totalTrees} {totalTrees === 1 ? "tree" : "trees"} · Best streak: {g.best}</span>
        </div>
        <div className="relative h-3 rounded-full bg-[#d1fae5]" role="img" aria-label={`Day ${d} of 365`}>
          <div className="h-full rounded-full bg-[#22c55e] transition-[width] duration-[600ms]" style={{ width: `${((d / 365) * 100).toFixed(1)}%` }} />
          {ticks.map((k, i) => <div key={i} className="absolute -top-[3px] -ml-0.5 h-[18px] w-1 rounded-sm" style={{ left: `${k.p}%`, background: k.c }} />)}
        </div>
        <div className="flex justify-between text-[11px] font-bold text-[#3f6b55]">
          <span>Seed</span><span>Sapling</span><span>Tree</span><span>Flowers</span><span>Fruits</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {seeds.map((s) => (
          <div key={s.name} className="flex min-w-0 flex-col items-center gap-[3px] rounded-[14px] px-1 py-[7px]" style={{ background: s.bg, boxShadow: `0 3px 0 ${s.edge}`, outline: s.growing ? "2px solid #047857" : "none", outlineOffset: 1 }}>
            <div className="flex size-6 items-center justify-center rounded-full" style={{ background: s.c }}>
              {s.locked && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
              )}
            </div>
            <span className="max-w-full truncate text-[11px] font-black" style={{ color: s.tc }}>{s.name}</span>
            <span className="max-w-full truncate text-[11px] font-bold opacity-85" style={{ color: s.tc }}>{s.status}</span>
          </div>
        ))}
      </div>

      <div className="relative">
        {nudge && (
          <div className="absolute inset-x-0 bottom-16 z-[5] flex animate-fz-nudge items-center gap-2 rounded-2xl bg-[#102a4c] py-2 pl-2 pr-3 text-white shadow-[0_10px_24px_rgba(16,42,76,.3)]">
            <Image src="/mascot/owl-peek.webp" alt="" width={40} height={31} className="block h-auto w-10" />
            <span className="text-[13px] font-bold leading-[1.3]">{nudge}</span>
          </div>
        )}
        <button
          type="button"
          onClick={water}
          className={`${bigBtn} ${wateredToday && !watering ? "!bg-[#94a3b8] !shadow-[0_6px_0_#64748b]" : ""}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3c3 4.5 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3-6.5 6-11z" /></svg>
          {waterLabel}
        </button>
      </div>
      <div className="flex items-center gap-[5px]">
        <span className="text-[11px] font-extrabold text-[#047857]">Preview</span>
        <button type="button" className={mini} onClick={() => set({ offset: g.offset + 1 })}>Next day</button>
        <button type="button" className={mini} onClick={() => jump(30)}>+30</button>
        <button type="button" className={mini} onClick={() => jump(365)}>+365</button>
        <button type="button" className={mini} onClick={() => set({ offset: g.offset + (wateredToday ? 2 : 1) })}>Miss</button>
        <button
          type="button"
          className={mini}
          onClick={() => { set({ offset: 0, cared: 0, streak: 0, best: 0, lastW: null, log: {}, names: { a: "", b: "" }, me: "a" }); setToast(""); setSheet(""); }}
        >
          Reset
        </button>
      </div>
    </>
  );

  const handle = <div className="h-[5px] w-11 self-center rounded-sm bg-[#d1fae5]" />;
  const sheetCls =
    "fixed inset-x-0 bottom-0 z-[51] mx-auto box-border flex max-h-[92dvh] w-full max-w-[28rem] animate-fz-sheet flex-col gap-3 overflow-y-auto rounded-t-[28px] bg-white px-5 pb-6 pt-3.5 text-[#064e3b]";

  const overlay = (
    <>
      {sheet && <div className="fixed inset-0 z-50 animate-fz-fade bg-[rgba(6,40,25,.45)]" onClick={() => setSheet("")} />}
      {sheet === "invite" && (
        <div className={sheetCls} role="dialog" aria-label="Invite a garden buddy">
          {handle}
          <div className="flex items-center gap-3">
            <div className="flex">
              <div className={`${avatar} !size-[46px] !text-lg`} style={{ background: "#f59e0b" }}>{(g.names.a[0] || "Y").toUpperCase()}</div>
              <div className={`${avatar} -ml-3 !size-[46px] !border-2 !border-dashed !border-[#34d399] !bg-white !text-xl !text-[#059669]`}>+</div>
            </div>
            <div>
              <div className="font-display text-[28px] leading-none">Grow together</div>
              <div className="mt-[3px] text-[13px] text-[#3f6b55]">Room for one buddy</div>
            </div>
          </div>
          <div className="text-[15px] leading-[1.45] text-[#25483a]">Invite one friend. Either of you can water each day, and one watering keeps your streak alive.</div>
          {!g.names.a ? (
            <>
              <label htmlFor="g-name" className="text-[13px] font-extrabold text-[#3f6b55]">Your name</label>
              <input
                id="g-name"
                className={`${sheetInput} -mt-1.5`}
                value={draftA}
                onChange={(e) => setDraftA(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && draftA.trim() && set({ names: { ...g.names, a: draftA.trim() } })}
                placeholder="e.g. Priya"
                maxLength={20}
                autoComplete="off"
              />
              <button type="button" className={bigBtn} onClick={() => set({ names: { ...g.names, a: draftA.trim() } })} disabled={!draftA.trim()}>Create invite link</button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-[14px] border-2 border-dashed border-[#86efac] bg-[#f0fdf4] py-2 pl-3 pr-2">
                <span className="min-w-0 flex-1 truncate text-sm font-extrabold">{link}</span>
                <button
                  type="button"
                  className={`${buddyBtn} ${buddyGhost} !min-h-10`}
                  onClick={() => { copyText("https://" + link); setCopied(true); later(() => setCopied(false), 1600); }}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <a
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#25a244] text-base font-black text-white no-underline shadow-[0_5px_0_#17762f] active:translate-y-[3px] active:shadow-[0_2px_0_#17762f]"
                href={"https://wa.me/?text=" + encodeURIComponent(`Help me grow our ${S.name.toLowerCase()} tree on TopperShelf! Water it on days I forget so our streak never breaks: https://${link}`)}
                target="_blank"
                rel="noopener"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 0 1-13.3 7.9L3 21l1.2-4.5A9 9 0 1 1 21 12z" /></svg>
                Send on WhatsApp
              </a>
              <button type="button" className={`${mini} !flex-none`} onClick={() => setSheet("join")}>Preview: open the link as your friend</button>
            </>
          )}
          <div className="flex items-center justify-between gap-2.5">
            <span className="text-[13px] leading-[1.35] text-[#3f6b55]">No buddy yet? Keep growing solo. You can invite anytime.</span>
            <button type="button" className={`${buddyBtn} ${buddyGhost}`} onClick={() => setSheet("")}>Close</button>
          </div>
        </div>
      )}
      {sheet === "join" && (
        <div className={sheetCls} role="dialog" aria-label="Join a garden">
          {handle}
          <div className="text-[11px] font-black tracking-[.14em] text-[#059669]">FRIEND VIEW · INVITE LINK</div>
          <div className="flex items-center gap-3">
            <Image src="/mascot/owl-peek.webp" alt="" width={84} height={66} className="block h-auto w-[84px]" />
            <div className="font-display text-[26px] leading-[1.1]">{nm("a")} invited you to grow a garden together</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#f0fdf4] px-3 py-1.5 text-[13px] font-extrabold">{S.name} tree · day {d}</span>
            <span className="rounded-full bg-[#fff7ed] px-3 py-1.5 text-[13px] font-extrabold text-[#9a3412]">{streakNow} day streak</span>
          </div>
          <label htmlFor="g-buddy" className="text-[13px] font-extrabold text-[#3f6b55]">Your name</label>
          <input
            id="g-buddy"
            className={`${sheetInput} -mt-1.5`}
            value={draftB}
            onChange={(e) => setDraftB(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinNow()}
            placeholder="e.g. Rohan"
            maxLength={20}
            autoComplete="off"
          />
          <button type="button" className={bigBtn} onClick={joinNow} disabled={!draftB.trim()}>Join garden</button>
          <div className="flex items-center justify-between gap-2.5">
            <span className="text-[13px] text-[#3f6b55]">No sign-up needed. Gardens fit 2 people.</span>
            <button type="button" className={`${buddyBtn} ${buddyGhost}`} onClick={() => setSheet("")}>Not now</button>
          </div>
        </div>
      )}
      {sheet === "manage" && (
        <div className={sheetCls} role="dialog" aria-label="Garden buddies">
          {handle}
          <div className="font-display text-[28px] leading-none">Your garden crew</div>
          {(["a", "b"] as Who[]).map((k) => (
            <div key={k} className="flex items-center gap-3 rounded-2xl bg-[#f0fdf4] px-3 py-2.5">
              <div className={avatar} style={{ background: k === "a" ? "#f59e0b" : "#8b5cf6" }}>{(g.names[k][0] || "?").toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-black">{nm(k) + (k === g.me ? " (you)" : "")}</div>
                <div className="text-xs text-[#3f6b55]">{k === "a" ? "Planted the garden" : "Joined with your link"}</div>
              </div>
              <button type="button" className={`${buddyBtn} ${buddyGhost} disabled:opacity-60`} disabled={k === g.me} onClick={() => { set({ me: k }); setSheet(""); }}>
                {k === g.me ? "Viewing" : "Preview as"}
              </button>
            </div>
          ))}
          <div className="text-xs text-[#3f6b55]">Preview tip: switch who you are viewing as to try watering from both phones.</div>
          <div className="flex gap-2.5">
            <button
              type="button"
              className={`${buddyBtn} ${buddyGhost} flex-1 !border-[#fecaca] !text-[#b91c1c] !shadow-[0_3px_0_#fecaca]`}
              onClick={() => {
                const gone = nm("b");
                const leaving = g.me === "b";
                set({ names: { ...g.names, b: "" }, me: "a" });
                setSheet("");
                flash(leaving ? "You left the garden" : `${gone} was removed`);
              }}
            >
              {g.me === "a" ? `Remove ${nm("b")}` : "Leave garden"}
            </button>
            <button type="button" className={`${buddyBtn} flex-1`} onClick={() => setSheet("")}>Done</button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <GameShell
      gradient="linear-gradient(150deg,#059669 0%,#65a30d 55%,#eab308 100%)"
      icon="/fun-zone/grow-a-sapling.webp"
      iconBg="#d0f5d8"
      title="Grow a Sapling"
      subtitle="One tree a year. A whole garden for life."
      status="SOLO"
      stickerShadow="rgba(6,40,20,.6)"
      panelClass="bg-[#ecfdf3] px-4 text-[#064e3b] sm:px-6"
      rootClass="bg-[#ecfdf3]"
      stage={stage}
      controls={controls}
      overlay={overlay}
    />
  );
}
