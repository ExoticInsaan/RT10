"use client";

import { useState } from "react";
import { Field, Hint, NumberField, ResultPanel, Segmented, inputClass, toNumber } from "@/components/tools/kit";
import ToolIcon from "@/components/tools/ToolIcon";
import { ModeCards, ModeHeader, type ModeCard } from "@/components/tools/ModeCards";

/*
 * Conversion formulas in common use in India. A board's or university's own rule (printed on the marksheet or in its
 * regulations) always takes priority; the tool says so next to the result.
 */
type Formula = {
  id: string;
  label: string;
  rule: string;
  toPercent: (cgpa: number) => number;
  toCgpa: (percent: number) => number;
};

const formulas: Formula[] = [
  {
    id: "cbse",
    label: "CBSE / UGC (× 9.5)",
    rule: "Percentage = CGPA × 9.5",
    toPercent: (c) => c * 9.5,
    toCgpa: (p) => p / 9.5,
  },
  {
    id: "aicte",
    label: "AICTE / engineering ((CGPA − 0.75) × 10)",
    rule: "Percentage = (CGPA − 0.75) × 10",
    toPercent: (c) => (c - 0.75) * 10,
    toCgpa: (p) => p / 10 + 0.75,
  },
  {
    id: "x10",
    label: "Anna University, AKTU and others (× 10)",
    rule: "Percentage = CGPA × 10",
    toPercent: (c) => c * 10,
    toCgpa: (p) => p / 10,
  },
  {
    id: "mumbai",
    label: "Mumbai University (7.1 × CGPA + 11)",
    rule: "Percentage = 7.1 × CGPA + 11",
    toPercent: (c) => 7.1 * c + 11,
    toCgpa: (p) => (p - 11) / 7.1,
  },
];

type Mode = "to-percent" | "to-cgpa" | "sgpa" | "marks";
type Semester = { sgpa: string; credits: string };
type Subject = { name: string; got: string; max: string };

const newSubject = (): Subject => ({ name: "", got: "", max: "100" });

/** The jobs, shown as cards on phones and tablets and as pills on desktop. */
const cards: ModeCard[] = [
  {
    value: "to-percent",
    label: "CGPA → %",
    intro: "Turn your CGPA or SGPA into a percentage.",
    tone: "bg-blue-soft text-blue-hover",
    icon: (
      <>
        <path d="M5 19 19 5" />
        <circle cx="7" cy="7" r="2.5" />
        <circle cx="17" cy="17" r="2.5" />
      </>
    ),
  },
  {
    value: "to-cgpa",
    label: "% → CGPA",
    intro: "Turn a percentage back into a CGPA.",
    tone: "bg-emerald-50 text-emerald-600",
    icon: (
      <>
        <path d="M4 12h13M13 7l5 5-5 5" />
        <path d="M4 5v4M4 15v4" />
      </>
    ),
  },
  {
    value: "sgpa",
    label: "SGPAs → CGPA",
    intro: "Combine your semester SGPAs into one CGPA.",
    tone: "bg-violet-50 text-violet",
    icon: (
      <>
        <rect x="3" y="12" width="4" height="8" rx="1" />
        <rect x="10" y="8" width="4" height="12" rx="1" />
        <rect x="17" y="4" width="4" height="16" rx="1" />
      </>
    ),
  },
  {
    value: "marks",
    label: "Marks → %",
    intro: "Get the percentage for each subject and your total.",
    tone: "bg-orange-50 text-orange-500",
    icon: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      </>
    ),
  },
];

const round2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export default function CgpaCalculator() {
  const [mode, setMode] = useState<Mode>("to-percent");
  const [formulaId, setFormulaId] = useState("cbse");
  const [custom, setCustom] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [percent, setPercent] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([
    { sgpa: "", credits: "" },
    { sgpa: "", credits: "" },
  ]);
  const [subjects, setSubjects] = useState<Subject[]>([newSubject(), newSubject(), newSubject()]);
  // Phones and tablets start on the cards; desktop always shows the pills and the calculator.
  const [picked, setPicked] = useState(false);
  const currentCard = cards.find((c) => c.value === mode)!;

  const multiplier = toNumber(custom);
  const formula: Formula =
    formulaId === "custom"
      ? {
          id: "custom",
          label: "Custom",
          rule: `Percentage = CGPA × ${Number.isFinite(multiplier) ? multiplier : "?"}`,
          toPercent: (c) => c * multiplier,
          toCgpa: (p) => p / multiplier,
        }
      : formulas.find((f) => f.id === formulaId)!;
  const customMissing = formulaId === "custom" && !(multiplier > 0);

  return (
    <div className="mx-auto grid grid-cols-1 max-w-3xl gap-6">
      {!picked && (
        <ModeCards
          title="What do you want to work out?"
          cards={cards}
          onPick={(value) => {
            setMode(value as Mode);
            setPicked(true);
          }}
        />
      )}

      <div className={`grid grid-cols-1 gap-6 ${picked ? "" : "max-lg:hidden"}`}>
      {picked && <ModeHeader card={currentCard} onBack={() => setPicked(false)} backLabel="Back to all calculators" />}
      {picked && <p className="m-0 text-sm text-muted lg:hidden">{currentCard.intro}</p>}
      <div className="max-lg:hidden">
        <Segmented
          label="What do you want to work out?"
          value={mode}
          onChange={setMode}
          options={cards.map(({ value, label }) => ({ value: value as Mode, label }))}
        />
      </div>

      {(mode === "to-percent" || mode === "to-cgpa") && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {mode === "to-percent" ? (
            <NumberField label="Your CGPA" value={cgpa} onChange={setCgpa} min={0} max={10} placeholder="e.g. 8.4" hint="On a 10-point scale." />
          ) : (
            <NumberField label="Your percentage" value={percent} onChange={setPercent} min={0} max={100} placeholder="e.g. 76" suffix="%" />
          )}
          <Field label="Conversion rule" hint="Pick the rule your board or university uses.">
            <select className={inputClass} value={formulaId} onChange={(event) => setFormulaId(event.target.value)}>
              {formulas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
              <option value="custom">Custom multiplier</option>
            </select>
          </Field>
          {formulaId === "custom" && (
            <NumberField
              label="Multiply CGPA by"
              value={custom}
              onChange={setCustom}
              min={0}
              placeholder="e.g. 9.5"
              hint="Use the number printed on your marksheet."
            />
          )}
        </div>
      )}

      {mode === "to-percent" && <ToPercent cgpa={toNumber(cgpa)} formula={formula} customMissing={customMissing} />}
      {mode === "to-cgpa" && <ToCgpa percent={toNumber(percent)} formula={formula} customMissing={customMissing} />}
      {mode === "sgpa" && <SgpaToCgpa semesters={semesters} setSemesters={setSemesters} />}
      {mode === "marks" && <MarksToPercent subjects={subjects} setSubjects={setSubjects} />}
      </div>
    </div>
  );
}

function RuleNote({ formula }: { formula: Formula }) {
  return (
    <>
      Worked out with <strong>{formula.rule}</strong>. If your marksheet or university gives a different rule, that one is
      the official figure.
    </>
  );
}

function ToPercent({ cgpa, formula, customMissing }: { cgpa: number; formula: Formula; customMissing: boolean }) {
  if (customMissing) return <Hint>Enter the multiplier your university uses.</Hint>;
  if (!Number.isFinite(cgpa)) return <Hint>Enter your CGPA to see the percentage.</Hint>;
  if (cgpa < 0 || cgpa > 10) return <Hint error>CGPA should be between 0 and 10.</Hint>;
  const result = clamp(formula.toPercent(cgpa), 0, 100);
  return (
    <ResultPanel label={`${cgpa} CGPA is`} value={`${round2(result)}%`}>
      <RuleNote formula={formula} />
    </ResultPanel>
  );
}

function ToCgpa({ percent, formula, customMissing }: { percent: number; formula: Formula; customMissing: boolean }) {
  if (customMissing) return <Hint>Enter the multiplier your university uses.</Hint>;
  if (!Number.isFinite(percent)) return <Hint>Enter your percentage to see the CGPA.</Hint>;
  if (percent < 0 || percent > 100) return <Hint error>Percentage should be between 0 and 100.</Hint>;
  const result = formula.toCgpa(percent);
  if (result > 10) {
    return (
      <Hint error>
        Under {formula.rule}, {percent}% would need a CGPA above 10, so this rule can&apos;t produce it.
      </Hint>
    );
  }
  return (
    <ResultPanel label={`${percent}% is about`} value={`${round2(clamp(result, 0, 10))} CGPA`}>
      <RuleNote formula={formula} />
    </ResultPanel>
  );
}

function SgpaToCgpa({
  semesters,
  setSemesters,
}: {
  semesters: Semester[];
  setSemesters: (next: Semester[]) => void;
}) {
  const update = (index: number, patch: Partial<Semester>) =>
    setSemesters(semesters.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const filled = semesters
    .map((s) => ({ sgpa: toNumber(s.sgpa), credits: toNumber(s.credits) }))
    .filter((s) => Number.isFinite(s.sgpa));
  const invalid = filled.some((s) => s.sgpa < 0 || s.sgpa > 10 || (Number.isFinite(s.credits) && s.credits <= 0));
  const useCredits = filled.length > 0 && filled.every((s) => Number.isFinite(s.credits));
  const totalCredits = filled.reduce((sum, s) => sum + (useCredits ? s.credits : 1), 0);
  const cgpa = filled.reduce((sum, s) => sum + s.sgpa * (useCredits ? s.credits : 1), 0) / totalCredits;

  return (
    <div className="grid grid-cols-1 gap-5">
      <p className="m-0 text-sm leading-6 text-muted">
        Add each semester&apos;s SGPA. Add credits too if you know them: CGPA is then weighted by credits, which is how most
        universities calculate it. Without credits, every semester counts equally.
      </p>
      <ol className="m-0 grid grid-cols-1 list-none gap-3 p-0">
        {semesters.map((s, index) => (
          <li key={index} className="grid grid-cols-[auto_1fr_1fr_auto] items-end gap-3">
            <span className="mb-3.5 w-10 text-sm font-bold text-muted">S{index + 1}</span>
            <NumberField label="SGPA" value={s.sgpa} onChange={(v) => update(index, { sgpa: v })} min={0} max={10} placeholder="8.2" />
            <NumberField label="Credits" value={s.credits} onChange={(v) => update(index, { credits: v })} min={0} placeholder="Optional" />
            <button
              type="button"
              aria-label={`Remove semester ${index + 1}`}
              disabled={semesters.length <= 1}
              onClick={() => setSemesters(semesters.filter((_, i) => i !== index))}
              className="mb-1 grid size-10 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-muted hover:bg-surface hover:text-navy disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ToolIcon name="close" size={18} />
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        disabled={semesters.length >= 12}
        onClick={() => setSemesters([...semesters, { sgpa: "", credits: "" }])}
        className="min-h-11 cursor-pointer justify-self-start rounded-xl border border-dashed border-line bg-white px-4 text-sm font-semibold text-navy hover:border-blue-hover disabled:opacity-50"
      >
        + Add a semester
      </button>
      {invalid ? (
        <Hint error>SGPA should be between 0 and 10, and credits more than 0.</Hint>
      ) : filled.length === 0 ? (
        <Hint>Enter at least one SGPA to see your CGPA.</Hint>
      ) : (
        <ResultPanel label={`CGPA over ${filled.length} semester${filled.length === 1 ? "" : "s"}`} value={round2(cgpa).toFixed(2)}>
          {useCredits
            ? `Weighted by ${totalCredits} total credits.`
            : "Simple average. Add credits for every semester to weight it by credits."}
        </ResultPanel>
      )}
    </div>
  );
}

function MarksToPercent({ subjects, setSubjects }: { subjects: Subject[]; setSubjects: (next: Subject[]) => void }) {
  const update = (index: number, patch: Partial<Subject>) => setSubjects(subjects.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const rows = subjects.map((s, index) => {
    const got = toNumber(s.got);
    const max = toNumber(s.max);
    const filled = Number.isFinite(got);
    const bad = filled && (!(max > 0) || got < 0 || got > max);
    return { index, name: s.name.trim() || `Subject ${index + 1}`, got, max, filled, bad };
  });
  const used = rows.filter((r) => r.filled && !r.bad);
  const anyBad = rows.some((r) => r.bad);
  const totalGot = used.reduce((sum, r) => sum + r.got, 0);
  const totalMax = used.reduce((sum, r) => sum + r.max, 0);

  return (
    <div className="grid grid-cols-1 gap-5">
      <p className="m-0 text-sm leading-6 text-muted max-lg:hidden">
        Add the marks you got in each subject and what it was out of. You get the percentage for every subject and your overall percentage.
      </p>
      <ol className="m-0 grid grid-cols-1 list-none gap-3 p-0">
        {subjects.map((s, index) => (
          <li key={index} className="grid grid-cols-1 gap-3 rounded-2xl border border-line bg-white p-3 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end">
            <div className="flex items-end gap-2 sm:contents">
              <Field label={`Subject ${index + 1}`}>
                <input
                  className={inputClass}
                  value={s.name}
                  maxLength={40}
                  placeholder="e.g. Physics (optional)"
                  onChange={(e) => update(index, { name: e.target.value })}
                />
              </Field>
              <button
                type="button"
                aria-label={`Remove subject ${index + 1}`}
                disabled={subjects.length <= 1}
                onClick={() => setSubjects(subjects.filter((_, i) => i !== index))}
                className="mb-1 grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-muted hover:bg-surface hover:text-navy disabled:cursor-not-allowed disabled:opacity-40 sm:order-last"
              >
                <ToolIcon name="close" size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:contents">
              <NumberField label="Marks got" value={s.got} onChange={(v) => update(index, { got: v })} min={0} placeholder="e.g. 78" />
              <NumberField label="Out of" value={s.max} onChange={(v) => update(index, { max: v })} min={0} placeholder="100" />
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        disabled={subjects.length >= 15}
        onClick={() => setSubjects([...subjects, newSubject()])}
        className="min-h-11 cursor-pointer justify-self-start rounded-xl border border-dashed border-line bg-white px-4 text-sm font-semibold text-navy hover:border-blue-hover disabled:opacity-50"
      >
        + Add a subject
      </button>

      {anyBad ? (
        <Hint error>Marks should be between 0 and the “Out of” value, and “Out of” should be more than 0.</Hint>
      ) : used.length === 0 ? (
        <Hint>Enter your marks in at least one subject to see the percentages.</Hint>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <ResultPanel label={`Total percentage · ${round2(totalGot)} out of ${round2(totalMax)}`} value={`${round2((totalGot / totalMax) * 100)}%`}>
            {used.length === 1 ? "Based on 1 subject." : `Added up over ${used.length} subjects, not an average of the subject percentages.`}
          </ResultPanel>
          <ul className="m-0 grid grid-cols-1 list-none gap-2 p-0">
            {used.map((r) => {
              const pct = (r.got / r.max) * 100;
              return (
                <li key={r.index} className="rounded-2xl border border-line bg-white px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-semibold text-navy">{r.name}</span>
                    <span className="shrink-0 text-base font-extrabold text-navy">{round2(pct)}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full bg-blue-hover" style={{ width: `${clamp(pct, 0, 100)}%` }} />
                  </div>
                  <div className="mt-1.5 text-xs text-muted">
                    {round2(r.got)} out of {round2(r.max)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
