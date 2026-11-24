"use client";

import { useEffect, useState } from "react";
import { copyText, loadJSON, saveJSON } from "@/components/fun/kit";
import { useLudoRoom } from "@/components/fun/useLudoRoom";
import { COLORS, COLOR_NAMES, MAX_PLAYERS, cleanName, type Color } from "@/lib/fun/ludo";
import { CODE_LENGTH, canStart, cleanCode, members } from "@/lib/fun/ludo-room";
import { useTr } from "@/lib/tools/useTr";

/** Same colours as the board in `public/ludo/index.html`. */
const HEX: Record<Color, string> = { R: "#ff3860", G: "#1fe08f", Y: "#ffc928", B: "#2f9bff" };

const primary =
  "min-h-14 w-full cursor-pointer rounded-[18px] border-0 bg-[#2f9bff] px-[18px] py-3.5 text-lg font-extrabold text-[#041240] shadow-[0_6px_0_#1b6fc4] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_2px_0_#1b6fc4] disabled:cursor-default disabled:opacity-45";
const ghost =
  "min-h-[52px] w-full cursor-pointer rounded-[18px] border-2 border-white/20 bg-white/5 px-3.5 py-3 text-base font-extrabold text-white active:translate-y-[2px] disabled:cursor-default disabled:opacity-45";
const field =
  "box-border w-full rounded-2xl border-2 border-white/20 bg-white/10 px-4 py-[15px] text-base font-medium text-white outline-none placeholder:text-white/40 focus:border-[#2f9bff] focus:shadow-[0_0_0_4px_rgba(47,155,255,.25)]";

/**
 * Ludo Rush online: make a room or join one, then wait in the lobby, pick a colour and start.
 * The room itself (who sits where, the rules, the dice) lives in `useLudoRoom`.
 * The board for a running game comes in the next step.
 */
export default function LudoOnline({ onExit }: { onExit: () => void }) {
  const tr = useTr();
  const room = useLudoRoom();
  const { state, status, code, seat, isHost } = room;
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const saved = loadJSON<string>("ludo-name");
      if (saved) setName(saved);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const cleaned = cleanName(name);
  const remember = () => saveJSON("ludo-name", cleaned);
  const make = () => {
    remember();
    room.create(cleaned);
  };
  const enter = () => {
    remember();
    room.join(joinCode, cleaned);
  };
  const copy = () => {
    copyText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  const back = () => {
    room.leave();
    onExit();
  };

  const frame = (children: React.ReactNode) => (
    <div className="mx-auto w-full max-w-[30rem] overflow-hidden rounded-[28px] bg-[#041240] text-white shadow-[0_24px_60px_-24px_rgba(16,42,76,.45)] sm:rounded-[36px]">
      <div className="flex min-h-[640px] flex-col gap-4 px-5 py-6 sm:px-7">{children}</div>
    </div>
  );

  /* ---------- 1. Not in a room yet ---------- */
  if (status === "idle" || status === "connecting" || status === "notfound" || status === "closed" || status === "error") {
    const busy = status === "connecting";
    const problem =
      status === "notfound"
        ? tr("No room found with that code. Check it and try again.")
        : status === "closed"
          ? tr("The host closed the room.")
          : status === "error"
            ? tr("Could not connect. Check your internet and try again.")
            : "";
    return frame(
      <>
        <button type="button" onClick={back} className="cursor-pointer self-start border-0 bg-transparent p-0 text-sm font-bold text-white/70">
          ‹ {tr("Back")}
        </button>
        <div>
          <h2 className="m-0 font-display text-4xl leading-tight">{tr("Play online")}</h2>
          <p className="m-0 mt-1 text-sm leading-6 text-white/65">{tr("Create a room and share its code, or type a friend's code to join theirs.")}</p>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="ludo-name" className="text-sm font-bold text-white/70">{tr("Your name")}</label>
          <input id="ludo-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={16} autoComplete="nickname" placeholder={tr("Type your name")} className={field} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="ludo-code" className="text-sm font-bold text-white/70">{tr("Friend's room code")}</label>
          <input
            id="ludo-code"
            value={joinCode}
            onChange={(e) => setJoinCode(cleanCode(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && joinCode.length === CODE_LENGTH && cleaned && enter()}
            maxLength={CODE_LENGTH}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            placeholder="ABCDE"
            className={`${field} text-center font-display text-3xl tracking-[.3em]`}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className={`${primary} text-base!`} disabled={!cleaned || busy} onClick={make}>
            {busy && isHost ? tr("Creating…") : tr("Create a room")}
          </button>
          <button type="button" className={`${primary} text-base!`} disabled={!cleaned || joinCode.length !== CODE_LENGTH || busy} onClick={enter}>
            {busy && !isHost ? tr("Joining…") : tr("Join a friend")}
          </button>
        </div>
        {problem && <p role="alert" className="m-0 text-center text-sm font-bold text-[#ff8aa3]">{problem}</p>}
        <p className="m-0 text-center text-xs leading-5 text-white/55">{tr("2 to 4 players. Everyone needs the room code. Rooms disappear when the host leaves.")}</p>
      </>,
    );
  }

  const s = state;
  if (!s) return null;

  /* ---------- 2. Could not get a seat ---------- */
  if (!seat) {
    return frame(
      <div className="my-auto flex flex-col gap-4 text-center">
        <p role="alert" className="m-0 font-display text-3xl">{s.phase === "lobby" ? tr("This room is full.") : tr("This game has already started.")}</p>
        <p className="m-0 text-sm leading-6 text-white/65">
          {s.phase === "lobby" ? tr("A room holds {n} players.", { n: MAX_PLAYERS }) : tr("Ask the host to start a rematch, or make a room of your own.")}
        </p>
        <button type="button" className={primary} onClick={room.leave}>{tr("Back")}</button>
      </div>,
    );
  }

  /* ---------- 3. Waiting room ---------- */
  if (s.phase === "lobby") {
    const list = members(s);
    const online = list.filter((m) => m.online).length;
    const hostName = s.seats[COLORS.find((c) => s.seats[c]?.id === s.hostId) ?? "R"]?.name ?? tr("the host");
    return frame(
      <>
        <div className="rounded-3xl bg-white/10 px-5 py-5 text-center">
          <div className="text-xs font-extrabold tracking-[.16em] text-[#9cc9ff]">{tr("ROOM CODE")}</div>
          <div className="my-1 font-display text-[52px] leading-none tracking-[.18em]" aria-label={code.split("").join(" ")}>{code}</div>
          <button type="button" onClick={copy} className="mt-2 cursor-pointer rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold text-white">
            {copied ? tr("Copied!") : tr("Copy code")}
          </button>
          <p className="m-0 mt-3 text-xs leading-5 text-white/60">{tr("Friends open Ludo Rush, choose Play online, type this code and press “Join a friend”.")}</p>
        </div>

        <div className="text-sm font-bold text-white/70">{tr("Pick your colour")}</div>
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0">
          {COLORS.map((c) => {
            const m = s.seats[c];
            const mine = seat === c;
            const free = !m;
            return (
              <li key={c}>
                <button
                  type="button"
                  disabled={!free}
                  onClick={() => room.pickColor(c)}
                  aria-pressed={mine}
                  aria-label={`${COLOR_NAMES[c]}${m ? `: ${m.name}` : ""}`}
                  className={`flex min-h-[76px] w-full items-center gap-3 rounded-2xl border-2 px-3 py-2 text-left disabled:cursor-default ${free ? "cursor-pointer border-dashed border-white/25 bg-white/5" : "border-solid bg-white/10"} ${m && !m.online ? "opacity-50" : ""}`}
                  style={{ borderColor: free ? undefined : HEX[c] }}
                >
                  <span className="size-9 shrink-0 rounded-full border-[3px] border-white/80" style={{ background: HEX[c], opacity: free ? 0.45 : 1 }} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-extrabold">
                      {m ? m.name : tr(COLOR_NAMES[c])}
                      {mine && <span className="font-bold text-white/60"> ({tr("you")})</span>}
                    </span>
                    <span className="block text-xs font-bold text-white/55">
                      {!m ? tr("Tap to take") : !m.online ? tr("Away") : m.id === s.hostId ? tr("Host") : tr("Ready")}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {isHost ? (
          <>
            <button type="button" className={primary} disabled={!canStart(s)} onClick={room.start}>{tr("Start the game")}</button>
            <p className="m-0 text-center text-sm text-white/65">
              {online < 2 ? tr("Waiting for at least one friend to join…") : tr("{n} players are in. Ready when you are.", { n: online })}
            </p>
          </>
        ) : (
          <p className="m-0 rounded-2xl bg-white/10 px-4 py-4 text-center text-base font-bold" role="status">
            {tr("You are in! Waiting for {name} to start the game…", { name: hostName })}
          </p>
        )}
        <button type="button" className={ghost} onClick={room.leave}>{tr("Leave room")}</button>
      </>,
    );
  }

  /* ---------- 4. The game (the board is added in the next step) ---------- */
  return frame(
    <div className="my-auto flex flex-col gap-4 text-center">
      <p role="status" className="m-0 font-display text-3xl">{tr("The game has started!")}</p>
      <p className="m-0 text-sm leading-6 text-white/65">{tr("The board is coming soon.")}</p>
      <button type="button" className={ghost} onClick={room.leave}>{tr("Leave room")}</button>
    </div>,
  );
}
