"use client";

import { useState } from "react";
import { Field, Hint, NumberField, ResultPanel, Segmented, inputClass, toNumber } from "@/components/tools/kit";
import ToolIcon from "@/components/tools/ToolIcon";

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

type Mode = "to-percent" | "to-cgpa" | "sgpa";
type Semester = { sgpa: string; credits: string };

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
    <div className="mx-auto grid max-w-3xl gap-6">
      <Segmented
        label="What do you want to work out?"
        value={mode}
        onChange={setMode}
        options={[
          { value: "to-percent", label: "CGPA → %" },
          { value: "to-cgpa", label: "% → CGPA" },
          { value: "sgpa", label: "SGPAs → CGPA" },
        ]}
      />

      {mode !== "sgpa" && (
        <div className="grid gap-4 sm:grid-cols-2">
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
    <div className="grid gap-5">
      <p className="m-0 text-sm leading-6 text-muted">
        Add each semester&apos;s SGPA. Add credits too if you know them: CGPA is then weighted by credits, which is how most
        universities calculate it. Without credits, every semester counts equally.
      </p>
      <ol className="m-0 grid list-none gap-3 p-0">
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
