"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { dayNumber, gardenView } from "@/components/fun/games/GrowSapling";
import { GameShell, loadJSON, saveJSON } from "@/components/fun/kit";
import { getLink, waterGarden, type LinkInfo } from "@/lib/fun/friends";

/*
 * What a garden buddy sees at /fun/garden/[code]: the owner's tree, the streak, and one big button to water it today.
 * No account is needed. The watering is stored on the server and the owner's game picks it up the next time it opens.
 */
const NAME_KEY = "fz-buddy-name";
const WATERED_KEY = "fz-buddy-watered"; // { [code]: day number last watered on this device }

const bigBtn =
  "flex min-h-[54px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-[18px] border-0 bg-[#0ea5e9] px-[18px] py-3 text-[17px] font-black text-white shadow-[0_6px_0_#0369a1,0_14px_24px_rgba(3,105,161,.3)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_2px_0_#0369a1] disabled:cursor-default disabled:opacity-60";
const sheetInput =
  "box-border w-full rounded-[14px] border-2 border-[#bbf7d0] bg-white px-3.5 py-[13px] text-base font-medium text-[#064e3b] outline-none placeholder:text-[#7fb59a] focus:border-[#059669] focus:shadow-[0_0_0_4px_rgba(5,150,105,.15)]";

type Phase = "loading" | "missing" | "ready";

export default function GardenBuddy({ code }: { code: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [info, setInfo] = useState<LinkInfo | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState(() => loadJSON<string>(NAME_KEY) ?? "");
  const [busy, setBusy] = useState(false);
  const [wateredDay, setWateredDay] = useState<number | null>(() => loadJSON<Record<string, number>>(WATERED_KEY)?.[code] ?? null);

  useEffect(() => {
    let cancelled = false;
    getLink(code).then((r) => {
      if (cancelled) return;
      if (!r.ok) { setError(r.error); setPhase("missing"); return; }
      if (!r.data || r.data.game !== "grow-a-sapling") { setPhase("missing"); return; }
      setInfo(r.data);
      setPhase("ready");
    });
    return () => { cancelled = true; };
  }, [code]);

  const today = dayNumber();
  const pub = (info?.public ?? {}) as { cared?: number; streak?: number; lastW?: number | null };
  const cared = typeof pub.cared === "number" ? pub.cared : 0;
  const lastW = typeof pub.lastW === "number" ? pub.lastW : null;
  const view = gardenView(cared);
  const wilting = lastW !== null && lastW < today - 1 && cared > 0;
  const streak = lastW !== null && lastW >= today - 1 ? (pub.streak ?? 0) : 0;
  const alreadyToday = wateredDay === today || lastW === today;
  const owner = info?.owner_name ?? "your friend";
  const shell = (body: React.ReactNode) => (
    <GameShell
      gradient="linear-gradient(150deg,#059669 0%,#65a30d 55%,#eab308 100%)"
      icon="/fun-zone/grow-a-sapling.webp"
      iconBg="#d0f5d8"
      title="Grow a Sapling"
      subtitle="One tree a year. A whole garden for life."
      status="FRIENDS"
      stickerShadow="rgba(6,40,20,.6)"
      panelClass="bg-[#ecfdf3] px-4 text-[#064e3b] sm:px-6"
      rootClass="bg-[#ecfdf3]"
      body={<div className="mx-auto flex w-full max-w-md flex-col gap-3.5 lg:col-span-2">{body}</div>}
    />
  );

  async function water() {
    if (busy || alreadyToday || !name.trim()) return;
    setBusy(true);
    setError("");
    const r = await waterGarden(code, name.trim(), today);
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    saveJSON(NAME_KEY, name.trim());
    const all = loadJSON<Record<string, number>>(WATERED_KEY) ?? {};
    saveJSON(WATERED_KEY, { ...all, [code]: today });
    setWateredDay(today);
  }

  if (phase === "loading") return shell(<p className="m-0 py-16 text-center text-[15px] font-bold text-[#3f6b55]" role="status">Loading…</p>);

  if (phase === "missing") {
    return shell(
      <>
        <div className="flex flex-col items-center gap-3 rounded-[26px] bg-white p-[22px] text-center shadow-[0_8px_0_#bbf7d0]">
          <Image src="/mascot/owl-peek.webp" alt="" width={150} height={118} className="h-auto w-[150px]" />
          <div className="font-display text-[28px] leading-[1.1]">{error || "This garden does not exist"}</div>
          <div className="text-[15px] leading-[1.4] text-[#3f6b55]">The invite may have been removed, or typed wrong. Ask your friend to send it again, or grow your own.</div>
        </div>
        <Link className={`${bigBtn} no-underline`} href="/tool/grow-a-sapling">Grow my own sapling</Link>
      </>,
    );
  }

  return shell(
    <>
      <div className="flex animate-fz-pop flex-col items-center gap-3 rounded-[26px] bg-white p-[22px] text-center shadow-[0_8px_0_#bbf7d0]">
        <Image src="/mascot/owl-peek.webp" alt="" width={110} height={86} className="h-auto w-[110px]" />
        <div className="break-words font-display text-[28px] leading-[1.1]">{owner} invited you to grow a garden together</div>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-[#f0fdf4] px-3 py-1.5 text-[13px] font-extrabold">{view.species} tree · day {view.day} of 365</span>
          <span className="rounded-full bg-[#fff7ed] px-3 py-1.5 text-[13px] font-extrabold text-[#9a3412]">{streak} day streak</span>
          {view.trees > 0 && <span className="rounded-full bg-[#ecfdf5] px-3 py-1.5 text-[13px] font-extrabold text-[#047857]">{view.trees} {view.trees === 1 ? "tree" : "trees"} grown</span>}
        </div>
        {wilting && !alreadyToday && <div className="rounded-xl bg-[#fef2f2] px-3 py-2 text-sm font-bold text-[#b91c1c]">The tree is wilting. Water it today to save the streak!</div>}
        {info?.buddy && info.buddy.toLowerCase() !== name.trim().toLowerCase() && <div className="text-xs text-[#3f6b55]">{info.buddy} is already {owner}’s buddy. Gardens fit 2 people.</div>}
      </div>

      {alreadyToday ? (
        <div className="rounded-2xl bg-white p-4 text-center shadow-[0_4px_0_#bbf7d0]" role="status">
          <div className="font-display text-[24px] leading-none">The tree is watered today</div>
          <div className="mt-1.5 text-sm text-[#3f6b55]">Thanks{name.trim() ? `, ${name.trim()}` : ""}! {owner} will see it counted on their streak. Come back tomorrow.</div>
        </div>
      ) : (
        <>
          <label htmlFor="g-buddy" className="text-[13px] font-extrabold text-[#3f6b55]">Your name</label>
          <input
            id="g-buddy"
            className={`${sheetInput} -mt-1.5`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void water()}
            placeholder="e.g. Rohan"
            maxLength={20}
            autoComplete="off"
          />
          {error && <p role="alert" className="m-0 text-sm font-bold text-[#b91c1c]">{error}</p>}
          <button type="button" className={bigBtn} onClick={() => void water()} disabled={busy || !name.trim()}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3c3 4.5 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3-6.5 6-11z" /></svg>
            {busy ? "Watering…" : `Water ${owner}’s tree`}
          </button>
          <p className="m-0 text-center text-[13px] text-[#3f6b55]">No sign-up needed. One watering a day keeps the streak alive.</p>
        </>
      )}
      <Link className="text-center text-sm font-bold text-[#047857]" href="/tool/grow-a-sapling">Grow your own sapling</Link>
    </>,
  );
}
