"use client";

import { useState } from "react";
import { Hint, NumberField, ResultPanel, toNumber } from "@/components/tools/kit";
import { Rich, useTr } from "@/lib/tools/useTr";

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
  const tr = useTr();
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
    body = <Hint>{tr("Enter the classes you attended and the classes held so far.")}</Hint>;
  } else if (n <= 0 || a < 0 || !Number.isInteger(a) || !Number.isInteger(n)) {
    body = <Hint error>{tr("Use whole numbers, with at least one class held.")}</Hint>;
  } else if (a > n) {
    body = <Hint error>{tr("You can't have attended more classes than were held.")}</Hint>;
  } else if (!(t > 0 && t <= 1)) {
    body = <Hint error>{tr("The target should be between 1% and 100%.")}</Hint>;
  } else {
    const current = a / n;
    const ok = current >= t;
    const skip = canSkip(a, n, t);
    const need = mustAttend(a, n, t);
    const hasLeft = Number.isFinite(remaining) && remaining >= 0;
    const best = hasLeft ? (a + remaining) / (n + remaining) : NaN;

    body = (
      <div className="grid grid-cols-1 gap-4">
        <ResultPanel tone={ok ? "green" : "amber"} label={tr("Your attendance right now")} value={pct(current)}>
          {ok ? (
            skip > 0 ? (
              <Rich
                text={tr(
                  skip === 1
                    ? "You can miss the next <b>{n}</b> class and still stay at or above {target}. Miss one more and you drop to {after}."
                    : "You can miss the next <b>{n}</b> classes and still stay at or above {target}. Miss one more and you drop to {after}.",
                  { n: skip, target: pct(t), after: pct(a / (n + skip + 1)) },
                )}
              />
            ) : (
              <>{tr("You are right at the line. Missing even the next class takes you to {after}.", { after: pct(a / (n + 1)) })}</>
            )
          ) : need === Infinity ? (
            <>{tr("A 100% target can't be reached once a class has been missed.")}</>
          ) : (
            <Rich
              text={tr(
                need === 1
                  ? "Attend the next <b>{n}</b> class in a row to reach {target}. That brings you to {after}."
                  : "Attend the next <b>{n}</b> classes in a row to reach {target}. That brings you to {after}.",
                { n: need, target: pct(t), after: pct((a + need) / (n + need)) },
              )}
            />
          )}
        </ResultPanel>
        {hasLeft && (
          <p className="m-0 rounded-2xl bg-surface px-5 py-4 text-sm leading-6 text-slate-700">
            {remaining === 0 ? (
              <>{tr("With no classes left, your final attendance is {current}.", { current: pct(current) })}</>
            ) : best < t ? (
              <>
                {tr("Even if you attend all {n} remaining classes, you finish at {best}, below {target}. Ask your department about condonation early.", {
                  n: remaining,
                  best: pct(best),
                  target: pct(t),
                })}
              </>
            ) : (
              <Rich
                text={tr(
                  "With {n} classes left, attending all of them gets you to {best}. You can afford to miss <b>{skip}</b> of them and still finish at or above {target}.",
                  { n: remaining, best: pct(best), skip: canSkip(a + remaining, n + remaining, t), target: pct(t) },
                )}
              />
            )}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto grid grid-cols-1 max-w-3xl gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label={tr("Classes attended")} value={attended} onChange={setAttended} min={0} step={1} placeholder={tr("e.g. 42")} />
        <NumberField label={tr("Classes held so far")} value={total} onChange={setTotal} min={1} step={1} placeholder={tr("e.g. 60")} />
        <NumberField label={tr("Target attendance")} value={target} onChange={setTarget} min={1} max={100} suffix="%" hint={tr("75% is the most common rule.")} />
        <NumberField
          label={tr("Classes left this semester")}
          value={left}
          onChange={setLeft}
          min={0}
          step={1}
          placeholder={tr("Optional")}
          hint={tr("Add this to see where you can finish.")}
        />
      </div>
      {body}
    </div>
  );
}
