"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import ToolIcon from "@/components/tools/ToolIcon";
import { Button } from "@/components/tools/ui";
import { Field, inputClass } from "@/components/tools/kit";
import { useAccountData } from "@/lib/tools/useAccountData";

type Card = { id: string; front: string; back: string };
type Deck = { id: string; name: string; cards: Card[] };
const uid = () => crypto.randomUUID();

/**
 * One card per line: "front - back", "front: back" or "front<TAB>back" (what you get pasting from a spreadsheet).
 * The first separator wins, so the back can contain dashes and colons. Lines without one are skipped.
 */
export function parseCards(text: string): { cards: Card[]; skipped: number } {
  const cards: Card[] = [];
  let skipped = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const match = /^(.+?)\s*(?:\t|\s[-–—]\s|:\s)\s*(.+)$/.exec(line);
    if (match) cards.push({ id: uid(), front: match[1].trim(), back: match[2].trim() });
    else skipped++;
  }
  return { cards, skipped };
}

// Each deck gets one of the site's own accent pairs, picked from its id so it never changes.
const accents: [string, string][] = [["#3b82f6", "#60a5fa"], ["#7c3aed", "#a78bfa"], ["#0f9f8f", "#5eead4"], ["#f97355", "#fdba74"]];
const accentFor = (id: string) => accents[[...id].reduce((n, c) => n + c.charCodeAt(0), 0) % accents.length];
const confettiColors = ["#3b82f6", "#7c3aed", "#0f9f8f", "#f97355", "#fbbf24", "#10b981"];

function shuffle<T>(list: T[]) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function FlashcardMaker() {
  const [decks, setDecks, status] = useAccountData<Deck[]>("flashcard-maker", []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [studying, setStudying] = useState(false);
  const [newName, setNewName] = useState("");


  // A deck that already has cards opens straight into revision; an empty one opens the editor.
  const openDeck = (target: Deck) => {
    setOpenId(target.id);
    setStudying(target.cards.length > 0);
  };

  const deck = decks.find((d) => d.id === openId) ?? null;
  const updateDeck = (next: Deck) => setDecks(decks.map((d) => (d.id === next.id ? next : d)));

  if (deck && studying) {
    return (
      <Study
        deck={deck}
        onEdit={() => setStudying(false)}
        onDelete={() => {
          setDecks(decks.filter((d) => d.id !== deck.id));
          setStudying(false);
          setOpenId(null);
        }}
        onExit={() => {
          setStudying(false);
          setOpenId(null);
        }}
      />
    );
  }
  if (deck) {
    return (
      <DeckEditor
        deck={deck}
        onChange={updateDeck}
        onBack={() => setOpenId(null)}
        onStudy={() => setStudying(true)}
        onDelete={() => {
          setDecks(decks.filter((d) => d.id !== deck.id));
          setOpenId(null);
        }}
      />
    );
  }

  if (status === "loading") return <p className="m-0 py-16 text-center text-sm text-muted">Loading your decks…</p>;
  if (status === "error") return <p className="m-0 py-16 text-center text-sm text-muted">Could not load your decks. Please refresh the page.</p>;

  return (
    <div className="mx-auto grid grid-cols-1 max-w-3xl gap-6">
      <form
        className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          const name = newName.trim();
          if (!name) return;
          const created = { id: uid(), name: name.slice(0, 60), cards: [] };
          setDecks([created, ...decks]);
          setNewName("");
          setOpenId(created.id);
        }}
      >
        <Field label="New deck">
          <input className={inputClass} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Organic chemistry reactions" />
        </Field>
        <Button type="submit">Create deck</Button>
      </form>

      {decks.length === 0 && (
        <div className="fc-empty">
          <div className="fc-floaters" aria-hidden="true">
            {[["-1.6rem", "-10deg", "#3b82f6", "0s"], ["0rem", "4deg", "#7c3aed", ".5s"], ["1.6rem", "14deg", "#f97355", "1s"]].map(([x, r, c, d]) => (
              <span key={c} style={{ "--x": x, "--r": r, "--c": c, "--d": d } as CSSProperties} />
            ))}
          </div>
          Your decks appear here and are saved to your account.
        </div>
      )}
      {decks.length > 0 && (
        <ul className="m-0 grid grid-cols-1 list-none gap-3 p-0 sm:grid-cols-2">
          {decks.map((d, i) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => openDeck(d)}
                className="fc-tile"
                style={{ "--i": i, "--a": accentFor(d.id)[0], "--b": accentFor(d.id)[1] } as CSSProperties}
              >
                <span className="block text-base font-bold text-navy">{d.name}</span>
                <span className="fc-count">
                  <i aria-hidden="true" />
                  {d.cards.length} card{d.cards.length === 1 ? "" : "s"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DeleteDialog({ name, count, onCancel, onConfirm }: { name: string; count: number; onCancel: () => void; onConfirm: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    box.current?.querySelector("button")?.focus(); // "Keep deck" is the first button
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return (
    <div className="fc-modal" onClick={onCancel}>
      <div ref={box} className="fc-dialog" role="alertdialog" aria-modal="true" aria-labelledby="fc-del-title" onClick={(e) => e.stopPropagation()}>
        <div className="fc-dialog-icon">
          <ToolIcon name="trash" size={22} />
        </div>
        <h2 id="fc-del-title">Delete “{name}”?</h2>
        <p>
          This permanently deletes the deck and its {count} card{count === 1 ? "" : "s"}. You can&apos;t undo this.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {/* Keep deck is focused first, so a stray Enter never deletes anything. */}
          <Button variant="secondary" onClick={onCancel}>
            Keep deck
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={onConfirm}>
            Delete deck
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeckEditor({
  deck,
  onChange,
  onBack,
  onStudy,
  onDelete,
}: {
  deck: Deck;
  onChange: (deck: Deck) => void;
  onBack: () => void;
  onStudy: () => void;
  onDelete: () => void;
}) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [bulk, setBulk] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="mx-auto grid grid-cols-1 max-w-3xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-blue-hover">
          ← All decks
        </button>
        <Button onClick={onStudy} disabled={deck.cards.length === 0}>
          Study {deck.cards.length} card{deck.cards.length === 1 ? "" : "s"}
        </Button>
      </div>
      <h3 className="m-0 text-2xl font-extrabold tracking-tight text-navy">{deck.name}</h3>

      <form
        ref={formRef}
        className="grid scroll-mt-24 grid-cols-1 gap-2.5 rounded-2xl bg-surface p-3.5 sm:gap-3 sm:p-5"
        // When a field is focused on a phone, lift the whole form to the top so both fields and the
        // Add card button sit above the keyboard (no scrolling down to add, then back up to type).
        onFocus={() => setTimeout(() => formRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }), 250)}
        onSubmit={(event) => {
          event.preventDefault();
          if (!front.trim()) {
            setMessage("Fill in both sides of the card.");
            return frontRef.current?.focus();
          }
          if (!back.trim()) {
            setMessage("Fill in both sides of the card.");
            return backRef.current?.focus();
          }
          onChange({ ...deck, cards: [...deck.cards, { id: uid(), front: front.trim(), back: back.trim() }] });
          setFront("");
          setBack("");
          setMessage("Card added. Type the next one.");
          frontRef.current?.focus(); // keep the keyboard open for the next card
        }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Front (question)">
            <textarea
              ref={frontRef}
              className={`${inputClass} h-20 py-2.5 sm:h-24 sm:py-3`}
              value={front}
              onChange={(e) => setFront(e.target.value)}
              maxLength={300}
              enterKeyHint="next"
              onKeyDown={(e) => {
                // Enter jumps to the answer; Shift+Enter still adds a new line.
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  backRef.current?.focus();
                }
              }}
            />
          </Field>
          <Field label="Back (answer)">
            <textarea
              ref={backRef}
              className={`${inputClass} h-20 py-2.5 sm:h-24 sm:py-3`}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              maxLength={600}
              onKeyDown={(e) => {
                // Ctrl/Cmd + Enter adds the card from the keyboard.
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
            />
          </Field>
        </div>
        <button type="button" className="fc-live hidden sm:block" aria-label="Preview of your card. Hover or focus to flip." tabIndex={-1}>
          <span className="fc-inner" style={{ display: "block", height: "100%" }}>
            <span className="fc-face fc-front" style={{ padding: "1rem" }}>
              <span className="line-clamp-3 text-sm font-bold text-navy">{front || "Your question shows here"}</span>
            </span>
            <span className="fc-face fc-back" style={{ padding: "1rem" }}>
              <span className="line-clamp-3 text-sm font-semibold text-navy">{back || "…and the answer on the back"}</span>
            </span>
          </span>
        </button>
        <div className="grid grid-cols-1 items-center gap-3 sm:flex sm:flex-wrap sm:gap-4">
          <Button type="submit" className="w-full sm:w-auto">Add card</Button>
          <button
            type="button"
            onClick={() => setShowBulk(!showBulk)}
            className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-blue-hover underline-offset-4 hover:underline"
          >
            {showBulk ? "Hide" : "Paste many at once"}
          </button>
        </div>
        {showBulk && (
          <div className="grid grid-cols-1 gap-3">
            <Field label="One card per line" hint="Write “question - answer”, “question: answer”, or paste two columns from a spreadsheet.">
              <textarea
                className={`${inputClass} h-40 py-3 font-mono`}
                value={bulk}
                onChange={(e) => setBulk(e.target.value)}
                placeholder={"Mitochondria - Powerhouse of the cell\nH2O: Water"}
              />
            </Field>
            <Button
              variant="secondary"
              className="justify-self-start"
              onClick={() => {
                const { cards, skipped } = parseCards(bulk);
                if (!cards.length) return setMessage("No cards found. Put a dash, colon or tab between the two sides.");
                onChange({ ...deck, cards: [...deck.cards, ...cards] });
                setBulk("");
                setMessage(`Added ${cards.length} card${cards.length === 1 ? "" : "s"}.${skipped ? ` Skipped ${skipped} line${skipped === 1 ? "" : "s"} without a separator.` : ""}`);
              }}
            >
              Add these cards
            </Button>
          </div>
        )}
        {message && <p className="m-0 text-sm text-navy" role="status">{message}</p>}
      </form>

      {deck.cards.length > 0 && (
        <ol className="m-0 grid grid-cols-1 list-none gap-2 p-0">
          {deck.cards.map((card) => (
            <li key={card.id} className="fc-row flex items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3">
              <span className="grid min-w-0 flex-1 gap-1 sm:grid-cols-2 sm:gap-4">
                <span className="text-sm font-bold text-navy">{card.front}</span>
                <span className="text-sm text-slate-700">{card.back}</span>
              </span>
              <button
                type="button"
                aria-label={`Delete card ${card.front}`}
                onClick={() => onChange({ ...deck, cards: deck.cards.filter((c) => c.id !== card.id) })}
                className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-muted hover:bg-surface hover:text-navy"
              >
                <ToolIcon name="close" size={16} />
              </button>
            </li>
          ))}
        </ol>
      )}

      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        className="cursor-pointer justify-self-start border-0 bg-transparent p-0 text-sm font-semibold text-red-600 underline-offset-4 hover:underline"
      >
        Delete this deck
      </button>
      {confirmDelete && <DeleteDialog name={deck.name} count={deck.cards.length} onCancel={() => setConfirmDelete(false)} onConfirm={onDelete} />}
    </div>
  );
}

function Study({ deck, onExit, onEdit, onDelete }: { deck: Deck; onExit: () => void; onEdit: () => void; onDelete: () => void }) {
  const [queue, setQueue] = useState<Card[]>(() => shuffle(deck.cards));
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [againCount, setAgainCount] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [leaving, setLeaving] = useState<"known" | "again" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const card = queue[0];
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function answer(gotIt: boolean) {
    if (leaving) return;
    // The card slides away first, then the next one is dealt.
    setLeaving(gotIt ? "known" : "again");
    timer.current = setTimeout(() => {
      const [current, ...rest] = queue;
      if (gotIt) setKnown(known + 1);
      else setAgainCount(againCount + 1);
      // Cards marked "Again" come back after a few others, until every card is known.
      setQueue(gotIt ? rest : [...rest.slice(0, 3), current, ...rest.slice(3)]);
      setFlipped(false);
      setLeaving(null);
    }, 300);
  }

  if (!card) {
    return (
      <div className="fc-party">
        <div className="fc-confetti" aria-hidden="true">
          {Array.from({ length: 28 }, (_, n) => (
            <i
              key={n}
              style={{
                "--c": confettiColors[n % confettiColors.length],
                "--x": `${Math.round(Math.cos(n * 2.4) * (90 + (n % 5) * 38))}px`,
                "--y": `${Math.round(Math.sin(n * 2.4) * (70 + (n % 4) * 30)) - 40}px`,
                "--rot": `${n * 47}deg`,
                "--d": `${(n % 7) * 40}ms`,
              } as CSSProperties}
            />
          ))}
        </div>
        <p className="fc-emoji m-0" aria-hidden="true">🎉</p>
        <h3 className="m-0 text-2xl font-extrabold text-navy">You know all {deck.cards.length} cards</h3>
        <p className="m-0 text-sm text-muted">
          {againCount === 0 ? "First try, every one." : `${againCount} card${againCount === 1 ? " needed" : "s needed"} another go along the way.`}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setQueue(shuffle(deck.cards));
              setKnown(0);
              setAgainCount(0);
            }}
          >
            Study again
          </Button>
          <Button variant="secondary" onClick={onEdit}>
            <ToolIcon name="edit" size={16} /> Edit cards
          </Button>
        </div>
        <button type="button" onClick={onExit} className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-blue-hover">
          All decks
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid grid-cols-1 max-w-xl gap-5">
      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onExit} className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-blue-hover">
          ← All decks
        </button>
        <span className="flex items-center gap-2 font-semibold text-muted">
          <span>
            <span key={known} className="fc-tick">{known}</span> of {deck.cards.length} known
          </span>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit cards"
            title="Edit cards"
            className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-blue-soft text-blue-hover transition hover:bg-blue-hover hover:text-white"
          >
            <ToolIcon name="edit" size={17} />
          </button>
        </span>
      </div>
      <div className="fc-bar">
        <div style={{ width: `${(known / deck.cards.length) * 100}%` }} />
      </div>
      <div className="fc-stage">
        <button
          key={`${card.id}-${known}-${againCount}`}
          type="button"
          onClick={() => !leaving && setFlipped(!flipped)}
          aria-label={flipped ? "Show question" : "Show answer"}
          className={`fc-card ${flipped ? "fc-flip" : ""} ${leaving ? `fc-${leaving}` : ""}`}
        >
          <span className="fc-inner" style={{ display: "block", minHeight: "16rem" }}>
            <span className="fc-face fc-front" aria-hidden={flipped}>
              <span className="fc-corner" aria-hidden="true"><i /><i /><i /></span>
              <span>
                <span className="mb-3 block text-xs font-semibold text-muted">Question · tap to flip</span>
                <span className="block whitespace-pre-wrap text-2xl font-bold leading-snug text-navy">{card.front}</span>
              </span>
            </span>
            <span className="fc-face fc-back" aria-hidden={!flipped}>
              <span>
                <span className="mb-3 block text-xs font-semibold text-emerald-700">Answer</span>
                <span className="block whitespace-pre-wrap text-2xl font-bold leading-snug text-navy">{card.back}</span>
              </span>
            </span>
          </span>
        </button>
      </div>
      {flipped ? (
        <div key="answers" className="fc-actions grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => answer(false)}>
            Again
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => answer(true)}>
            Got it
          </Button>
        </div>
      ) : (
        <Button variant="secondary" onClick={() => setFlipped(true)}>
          Show answer
        </Button>
      )}
      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        className="cursor-pointer justify-self-center border-0 bg-transparent p-1 text-xs font-semibold text-muted underline-offset-4 hover:text-red-600 hover:underline"
      >
        Delete deck
      </button>
      {confirmDelete && <DeleteDialog name={deck.name} count={deck.cards.length} onCancel={() => setConfirmDelete(false)} onConfirm={onDelete} />}
    </div>
  );
}
