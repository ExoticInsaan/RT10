"use client";

import { useEffect, useRef, useState } from "react";
import { GameShell, copyText, loadJSON, saveJSON } from "@/components/fun/kit";
import { useMemoryRoom } from "@/components/fun/useMemoryRoom";
import { CODE_LENGTH, MAX_PLAYERS, SIZES, SYMBOLS, cleanCode, cleanName, winners, type GameState, type Size } from "@/lib/fun/memory-match";
import { useTr } from "@/lib/tools/useTr";

const btn =
  "min-h-14 w-full cursor-pointer rounded-[18px] border-0 bg-[#6366f1] px-[18px] py-3.5 text-lg font-extrabold text-white shadow-[0_6px_0_#4338ca,0_14px_24px_rgba(67,56,202,.28)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_2px_0_#4338ca] disabled:cursor-default disabled:opacity-50";
const ghost =
  "min-h-[52px] cursor-pointer rounded-[18px] border-2 border-[#d9d4ff] bg-card px-3.5 py-3 text-base font-extrabold text-[#3730a3] shadow-[0_5px_0_#d9d4ff] active:translate-y-[3px] active:shadow-[0_2px_0_#d9d4ff] disabled:cursor-default disabled:opacity-50";
const field =
  "box-border w-full rounded-2xl border-2 border-[#d9d4ff] bg-card px-4 py-[15px] text-base font-medium text-[#1e1b4b] outline-none placeholder:text-[#9b97c9] focus:border-[#6366f1] focus:shadow-[0_0_0_4px_rgba(99,102,241,.2)]";

/** One colour per seat, used for the scoreboard and for the cards that player matched. */
const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981"];

function Avatar({ name, i }: { name: string; i: number }) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-black text-white" style={{ background: COLORS[i % COLORS.length] }} aria-hidden="true">
      {(name[0] ?? "?").toUpperCase()}
    </span>
  );
}

function Scoreboard({ s, me }: { s: GameState; me: string }) {
  const tr = useTr();
  const top = winners(s).map((p) => p.id);
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0" aria-label={tr("Scoreboard")}>
      {s.players.map((p, i) => {
        const turn = s.phase === "play" && s.turn === i;
        return (
          <li
            key={p.id}
            className={`flex items-center gap-3 rounded-2xl border-2 bg-card px-3 py-2 ${turn ? "mm-turn border-[#6366f1]" : "border-[#e6e3ff]"} ${p.online ? "" : "opacity-55"}`}
          >
            <Avatar name={p.name} i={i} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-extrabold text-[#1e1b4b]">
                {p.name}
                {p.id === me && <span className="font-bold text-[#6b66a8]"> ({tr("you")})</span>}
              </span>
              <span className="block text-xs font-bold text-[#6b66a8]">
                {!p.online ? tr("Away") : turn ? tr("Playing now") : p.id === s.hostId ? tr("Host") : s.phase === "done" && p.ready ? tr("Ready for a rematch") : "\u00a0"}
              </span>
            </span>
            {top.includes(p.id) && <span aria-label={tr("Winner")}>🏆</span>}
            <span className="min-w-[2ch] text-right font-display text-3xl leading-none text-[#1e1b4b]">{p.score}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function MemoryMatch() {
  const tr = useTr();
  const room = useMemoryRoom();
  const { state, status, code, me, isHost } = room;
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const prev = useRef<GameState | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const saved = loadJSON<string>("mm-name");
      if (saved) setName(saved);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  // Say what just happened (a match or a miss), for a moment.
  useEffect(() => {
    const before = prev.current;
    prev.current = state;
    if (!before || !state || before.phase !== "play" || state.round !== before.round) return;
    const gained = state.players.findIndex((p, i) => p.score > (before.players[i]?.score ?? 0));
    let message = "";
    if (gained >= 0) message = state.players[gained].id === me ? tr("Match! +1 point. Go again.") : tr("{name} found a match!", { name: state.players[gained].name });
    else if (!before.busy && state.busy) message = tr("No match. Next player's turn.");
    if (!message) return;
    setToast(message);
    const id = window.setTimeout(() => setToast(""), 1600);
    return () => window.clearTimeout(id);
  }, [state, me, tr]);

  const cleaned = cleanName(name);
  const remember = () => saveJSON("mm-name", cleaned);
  const make = (size: Size = 16) => {
    remember();
    room.create(cleaned, size);
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

  const shell = {
    gradient: "linear-gradient(150deg,#22d3ee 0%,#6366f1 48%,#a855f7 100%)",
    icon: "/fun-zone/memory-match.webp",
    iconBg: "#a95afb",
    title: "Memory Match",
    subtitle: "Match pairs with friends in a private room. Nothing is saved.",
    status: "LIVE" as const,
    panelClass: "bg-[#f1efff] px-5 text-[#1e1b4b] sm:px-6",
    rootClass: "bg-[#f1efff]",
    stickerShadow: "rgba(30,27,75,.55)",
  };

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
    return (
      <GameShell
        {...shell}
        body={
          <div className="mx-auto flex w-full max-w-md flex-col gap-4 lg:col-span-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="mm-name" className="text-sm font-bold text-[#6b66a8]">{tr("Your name")}</label>
              <input id="mm-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={16} autoComplete="nickname" placeholder={tr("Type your name")} className={field} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="mm-code" className="text-sm font-bold text-[#6b66a8]">{tr("Friend's room code")}</label>
              <input
                id="mm-code"
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
              <button type="button" className={`${btn} text-base!`} disabled={!cleaned || busy} onClick={() => make()}>
                {busy && isHost ? tr("Creating…") : tr("Create a room")}
              </button>
              <button type="button" className={`${btn} text-base!`} disabled={!cleaned || joinCode.length !== CODE_LENGTH || busy} onClick={enter}>
                {busy && !isHost ? tr("Joining…") : tr("Join a friend")}
              </button>
            </div>
            <p className="m-0 -mt-1 text-center text-xs leading-5 text-[#6b66a8]">{tr("Create a room and share its code, or type a friend's code to join theirs.")}</p>
            {problem && <p role="alert" className="m-0 text-center text-sm font-bold text-[#be123c]">{problem}</p>}
            <p className="m-0 text-center text-xs leading-5 text-[#6b66a8]">{tr("2 to 4 players. Everyone needs the room code. Rooms disappear when the host leaves.")}</p>
          </div>
        }
      />
    );
  }

  const s = state;
  if (!s) return null;
  const seated = s.players.some((p) => p.id === me);

  /* ---------- 2. Could not get a seat ---------- */
  if (!seated) {
    return (
      <GameShell
        {...shell}
        body={
          <div className="mx-auto flex w-full max-w-md flex-col gap-4 text-center lg:col-span-2">
            <p role="alert" className="m-0 font-display text-3xl">{s.phase === "play" ? tr("This game has already started.") : tr("This room is full.")}</p>
            <p className="m-0 text-sm leading-6 text-[#6b66a8]">
              {s.phase === "play" ? tr("Ask the host to start a rematch, or make a room of your own.") : tr("A room holds {n} players.", { n: MAX_PLAYERS })}
            </p>
            <button type="button" className={btn} onClick={room.leave}>{tr("Back")}</button>
          </div>
        }
      />
    );
  }

  /* ---------- 3. Waiting room ---------- */
  if (s.phase === "lobby") {
    const online = s.players.filter((p) => p.online).length;
    return (
      <GameShell
        {...shell}
        stage={
          <>
            <div className="rounded-3xl bg-[#1e1b4b] px-5 py-6 text-center text-white shadow-[0_14px_30px_-14px_rgba(30,27,75,.6)]">
              <div className="text-xs font-extrabold tracking-[.16em] text-[#a5b4fc]">{tr("ROOM CODE")}</div>
              <div className="my-1 font-display text-[52px] leading-none tracking-[.18em]" aria-label={code.split("").join(" ")}>{code}</div>
              <button type="button" onClick={copy} className="mt-2 cursor-pointer rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold text-white">
                {copied ? tr("Copied!") : tr("Copy code")}
              </button>
              <p className="m-0 mt-3 text-xs leading-5 text-[#c7d2fe]">{tr("Friends open Memory Match, type this code and press “Join a friend”.")}</p>
            </div>
            <Scoreboard s={s} me={me} />
          </>
        }
        controls={
          <>
            {isHost ? (
              <>
                <div className="text-sm font-bold text-[#6b66a8]">{tr("Board size")}</div>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={tr("Board size")}>
                  {SIZES.map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={s.size === n}
                      onClick={() => room.setSize(n)}
                      className={`min-h-14 cursor-pointer rounded-2xl border-2 px-1 py-2 text-sm font-extrabold ${s.size === n ? "border-[#6366f1] bg-[#6366f1] text-white" : "border-[#d9d4ff] bg-card text-[#3730a3]"}`}
                    >
                      {n}
                      <span className="block text-[11px] font-bold opacity-80">{tr(n === 12 ? "Small" : n === 16 ? "Medium" : "Large")}</span>
                    </button>
                  ))}
                </div>
                <button type="button" className={btn} disabled={online < 2} onClick={room.start}>{tr("Start the game")}</button>
                <p className="m-0 text-center text-sm text-[#6b66a8]">{online < 2 ? tr("Waiting for at least one friend to join…") : tr("{n} players are in. Ready when you are.", { n: online })}</p>
              </>
            ) : (
              <p className="m-0 rounded-2xl bg-card px-4 py-4 text-center text-base font-bold text-[#3730a3]" role="status">
                {tr("You are in! Waiting for {name} to start the game…", { name: s.players.find((p) => p.id === s.hostId)?.name ?? tr("the host") })}
                <span className="mt-1 block text-sm font-medium text-[#6b66a8]">{tr("Board: {n} cards", { n: s.size })}</span>
              </p>
            )}
            <button type="button" className={ghost} onClick={room.leave}>{tr("Leave room")}</button>
          </>
        }
      />
    );
  }

  /* ---------- 4. The game ---------- */
  const playing = s.phase === "play";
  const myTurn = playing && !s.busy && s.players[s.turn]?.id === me;
  const current = s.players[s.turn];
  const best = winners(s);
  const iWon = best.some((p) => p.id === me);
  const banner = !playing
    ? best.length > 1
      ? tr("It's a tie!")
      : iWon
        ? tr("You win! 🎉")
        : tr("{name} wins!", { name: best[0]?.name ?? "" })
    : s.busy
      ? tr("No match…")
      : s.players[s.turn]?.id === me
        ? s.up.length === 1
          ? tr("Your turn: pick a second card")
          : tr("Your turn: flip a card")
        : tr("{name} is playing…", { name: current?.name ?? "" });
  const doneLine = best.length > 1 ? tr("{names} tied with {n} pairs each.", { names: best.map((p) => p.name).join(" & "), n: best[0]?.score ?? 0 }) : tr("{name} found {n} pairs.", { name: best[0]?.name ?? "", n: best[0]?.score ?? 0 });
  const readyMe = s.players.find((p) => p.id === me)?.ready;
  const online = s.players.filter((p) => p.online);
  const waiting = online.filter((p) => !p.ready).length;

  return (
    <GameShell
      {...shell}
      panelClass={`${shell.panelClass} lg:items-start`}
      stage={
        <div className="mm-board" data-size={s.size} role="group" aria-label={tr("Cards")}>
          {s.faces.map((face, i) => {
            const up = face !== null;
            const owner = s.owner[i];
            const classes = ["mm-card", up ? "mm-up" : "", owner >= 0 ? "mm-hit" : "", s.busy && s.up.includes(i) ? "mm-miss" : ""].join(" ");
            return (
              <button
                key={i}
                type="button"
                className={classes}
                disabled={!myTurn || up}
                onClick={() => room.flip(i)}
                aria-label={up ? tr("Card {n}: {symbol}", { n: i + 1, symbol: SYMBOLS[face] }) : tr("Card {n}, face down", { n: i + 1 })}
                style={owner >= 0 ? ({ "--mm-own": COLORS[owner % COLORS.length] } as React.CSSProperties) : undefined}
              >
                <span className="mm-inner">
                  <span className="mm-face mm-back" aria-hidden="true">?</span>
                  <span className="mm-face mm-front" aria-hidden="true">{up ? SYMBOLS[face] : ""}</span>
                </span>
              </button>
            );
          })}
        </div>
      }
      controls={
        <>
          <div
            role="status"
            aria-live="polite"
            className={`rounded-2xl px-4 py-3 text-center text-lg font-extrabold ${!playing ? "bg-[#1e1b4b] text-white" : myTurn ? "mm-turn bg-[#6366f1] text-white" : "bg-card text-[#3730a3]"}`}
          >
            {banner}
            {!playing && <span className="mt-1 block text-sm font-medium text-[#c7d2fe]">{doneLine}</span>}
          </div>
          <div className="min-h-6 text-center text-sm font-bold text-[#6b66a8]" aria-hidden={!toast}>{toast}</div>
          <Scoreboard s={s} me={me} />
          {!playing && (
            <>
              <button type="button" className={btn} disabled={!!readyMe} onClick={room.rematch}>
                {readyMe ? (waiting > 0 ? tr("Waiting for {n} more…", { n: waiting }) : tr("Starting…")) : tr("Rematch")}
              </button>
              {isHost && (
                <button type="button" className={ghost} disabled={online.length < 2} onClick={room.start}>{tr("Start now")}</button>
              )}
            </>
          )}
          <button type="button" className={ghost} onClick={room.leave}>{tr("Leave room")}</button>
        </>
      }
    />
  );
}
