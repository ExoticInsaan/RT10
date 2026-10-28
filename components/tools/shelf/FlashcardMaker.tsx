"use client";

import { useEffect, useState } from "react";
import ToolIcon from "@/components/tools/ToolIcon";
import { Button } from "@/components/tools/ui";
import { Field, Hint, inputClass, readStored, writeStored } from "@/components/tools/kit";

type Card = { id: string; front: string; back: string };
type Deck = { id: string; name: string; cards: Card[] };
const KEY = "toppershelf-flashcards";
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

function shuffle<T>(list: T[]) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function FlashcardMaker() {
  const [decks, setDecks] = useState<Deck[]>(() => readStored<Deck[]>(KEY, []));
  const [openId, setOpenId] = useState<string | null>(null);
  const [studying, setStudying] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => writeStored(KEY, decks), [decks]);

  const deck = decks.find((d) => d.id === openId) ?? null;
  const updateDeck = (next: Deck) => setDecks(decks.map((d) => (d.id === next.id ? next : d)));

  if (deck && studying) return <Study deck={deck} onExit={() => setStudying(false)} />;
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

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <form
        className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
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

      {decks.length === 0 && <Hint>Your decks appear here and stay saved in this browser.</Hint>}
      {decks.length > 0 && (
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {decks.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => setOpenId(d.id)}
                className="block w-full cursor-pointer rounded-2xl border border-line bg-white p-5 text-left transition hover:border-blue-hover hover:shadow-card"
              >
                <span className="block text-base font-bold text-navy">{d.name}</span>
                <span className="mt-1 block text-sm text-muted">
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

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
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
        className="grid gap-3 rounded-2xl bg-surface p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (!front.trim() || !back.trim()) return setMessage("Fill in both sides of the card.");
          onChange({ ...deck, cards: [...deck.cards, { id: uid(), front: front.trim(), back: back.trim() }] });
          setFront("");
          setBack("");
          setMessage("");
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Front (question)">
            <textarea className={`${inputClass} h-24 py-3`} value={front} onChange={(e) => setFront(e.target.value)} maxLength={300} />
          </Field>
          <Field label="Back (answer)">
            <textarea className={`${inputClass} h-24 py-3`} value={back} onChange={(e) => setBack(e.target.value)} maxLength={600} />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit">Add card</Button>
          <button
            type="button"
            onClick={() => setShowBulk(!showBulk)}
            className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-blue-hover underline-offset-4 hover:underline"
          >
            {showBulk ? "Hide" : "Paste many at once"}
          </button>
        </div>
        {showBulk && (
          <div className="grid gap-3">
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
        <ol className="m-0 grid list-none gap-2 p-0">
          {deck.cards.map((card) => (
            <li key={card.id} className="flex items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3">
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
        onClick={() => {
          if (window.confirm(`Delete “${deck.name}” and all its cards?`)) onDelete();
        }}
        className="cursor-pointer justify-self-start border-0 bg-transparent p-0 text-sm font-semibold text-red-600 underline-offset-4 hover:underline"
      >
        Delete this deck
      </button>
    </div>
  );
}

function Study({ deck, onExit }: { deck: Deck; onExit: () => void }) {
  const [queue, setQueue] = useState<Card[]>(() => shuffle(deck.cards));
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [againCount, setAgainCount] = useState(0);
  const card = queue[0];

  function answer(gotIt: boolean) {
    const [current, ...rest] = queue;
    if (gotIt) setKnown(known + 1);
    else setAgainCount(againCount + 1);
    // Cards marked "Again" come back after a few others, until every card is known.
    setQueue(gotIt ? rest : [...rest.slice(0, 3), current, ...rest.slice(3)]);
    setFlipped(false);
  }

  if (!card) {
    return (
      <div className="mx-auto grid max-w-xl justify-items-center gap-4 py-6 text-center">
        <p className="m-0 text-5xl" aria-hidden="true">🎉</p>
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
          <Button variant="secondary" onClick={onExit}>
            Back to deck
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-xl gap-5">
      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onExit} className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-blue-hover">
          ← Stop
        </button>
        <span className="font-semibold text-muted">
          {known} of {deck.cards.length} known
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(known / deck.cards.length) * 100}%` }} />
      </div>
      <button
        type="button"
        onClick={() => setFlipped(!flipped)}
        aria-label={flipped ? "Show question" : "Show answer"}
        className={`grid min-h-64 cursor-pointer place-items-center rounded-3xl border-2 p-8 text-center transition ${
          flipped ? "border-emerald-200 bg-emerald-50" : "border-line bg-white hover:border-blue-hover"
        }`}
      >
        <span>
          <span className="mb-3 block text-xs font-semibold text-muted">{flipped ? "Answer" : "Question · tap to flip"}</span>
          <span className="block whitespace-pre-wrap text-2xl font-bold leading-snug text-navy">{flipped ? card.back : card.front}</span>
        </span>
      </button>
      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
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
    </div>
  );
}
