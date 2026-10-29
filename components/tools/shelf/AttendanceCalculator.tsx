"use client";

import { useState } from "react";
import { Hint, NumberField, ResultPanel, toNumber } from "@/components/tools/kit";

/** Classes you can still miss while staying at or above the target (target as a fraction, 0 < t <= 1). */
export function canSkip(attended: number, total: number, t: number) {
  return Math.max(0, Math.floor(attended / t - total + 1e-9));
}

/** Classes in a row you must attend to reach the target. Infinity when it can never be reached (target 100%). */
export function mustAttend(attended: number, total: number, t: number) {
  if (attended / total >= t) return 0;
  if (t >= 1) return Infinity;
  return Math.ceil((t * total - attended) / (1 - t) - 1e-9);
}

const pct = (n: number) => `${(Math.round(n * 1000) / 10).toFixed(1)}%`;

export default function AttendanceCalculator() {
  const [attended, setAttended] = useState("");
  const [total, setTotal] = useState("");
  const [target, setTarget] = useState("75");
  const [left, setLeft] = useState("");

  const a = toNumber(attended);
  const n = toNumber(total);
  const t = toNumber(target) / 100;
  const remaining = toNumber(left);

  let body;
  if (!Number.isFinite(a) || !Number.isFinite(n)) {
    body = <Hint>Enter the classes you attended and the classes held so far.</Hint>;
  } else if (n <= 0 || a < 0 || !Number.isInteger(a) || !Number.isInteger(n)) {
    body = <Hint error>Use whole numbers, with at least one class held.</Hint>;
  } else if (a > n) {
    body = <Hint error>You can&apos;t have attended more classes than were held.</Hint>;
  } else if (!(t > 0 && t <= 1)) {
    body = <Hint error>The target should be between 1% and 100%.</Hint>;
  } else {
    const current = a / n;
    const ok = current >= t;
    const skip = canSkip(a, n, t);
    const need = mustAttend(a, n, t);
    const hasLeft = Number.isFinite(remaining) && remaining >= 0;
    const best = hasLeft ? (a + remaining) / (n + remaining) : NaN;

    body = (
      <div className="grid grid-cols-1 gap-4">
        <ResultPanel
          tone={ok ? "green" : "amber"}
          label="Your attendance right now"
          value={pct(current)}
        >
          {ok ? (
            skip > 0 ? (
              <>
                You can miss the next <strong>{skip}</strong> class{skip === 1 ? "" : "es"} and still stay at or above{" "}
                {pct(t)}. Miss one more and you drop to {pct(a / (n + skip + 1))}.
              </>
            ) : (
              <>You are right at the line. Missing even the next class takes you to {pct(a / (n + 1))}.</>
            )
          ) : need === Infinity ? (
            <>A 100% target can&apos;t be reached once a class has been missed.</>
          ) : (
            <>
              Attend the next <strong>{need}</strong> class{need === 1 ? "" : "es"} in a row to reach {pct(t)}. That brings you
              to {pct((a + need) / (n + need))}.
            </>
          )}
        </ResultPanel>
        {hasLeft && (
          <p className="m-0 rounded-2xl bg-surface px-5 py-4 text-sm leading-6 text-slate-700">
            {remaining === 0 ? (
              <>With no classes left, your final attendance is {pct(current)}.</>
            ) : best < t ? (
              <>
                Even if you attend all {remaining} remaining classes, you finish at {pct(best)}, below {pct(t)}. Ask your
                department about condonation early.
              </>
            ) : (
              <>
                With {remaining} classes left, attending all of them gets you to {pct(best)}. You can afford to miss{" "}
                <strong>{canSkip(a + remaining, n + remaining, t)}</strong> of them and still finish at or above {pct(t)}.
              </>
            )}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto grid grid-cols-1 max-w-3xl gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label="Classes attended" value={attended} onChange={setAttended} min={0} step={1} placeholder="e.g. 42" />
        <NumberField label="Classes held so far" value={total} onChange={setTotal} min={1} step={1} placeholder="e.g. 60" />
        <NumberField label="Target attendance" value={target} onChange={setTarget} min={1} max={100} suffix="%" hint="75% is the most common rule." />
        <NumberField
          label="Classes left this semester"
          value={left}
          onChange={setLeft}
          min={0}
          step={1}
          placeholder="Optional"
          hint="Add this to see where you can finish."
        />
      </div>
      {body}
    </div>
  );
}
