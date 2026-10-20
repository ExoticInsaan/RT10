"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { firstName } from "@/lib/profile";

const POOF_MS = 950;

// Puffs of smoke: where each one drifts to, and when it starts.
const puffs = [
  { x: "-2.2rem", y: "-3.2rem", delay: "0s" },
  { x: "2.4rem", y: "-3.6rem", delay: "0.05s" },
  { x: "0rem", y: "-4.4rem", delay: "0.1s" },
  { x: "-3rem", y: "-1.2rem", delay: "0.12s" },
  { x: "3rem", y: "-1.6rem", delay: "0.16s" },
  { x: "-1rem", y: "-2.4rem", delay: "0.2s" },
];

/**
 * Owl mascot in the corner of the home page. Greets the signed-in student by name.
 * Tapping it makes it vanish in a puff of smoke. It is not remembered: it comes back on reload.
 */
export default function StudyBuddy() {
  const { profile } = useAuth();
  const [phase, setPhase] = useState<"idle" | "poof" | "gone">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (phase === "gone") return null;

  const name = firstName(profile?.name);
  const greeting = name ? `Welcome, ${name} !!` : "Welcome !!";

  const poof = () => {
    if (phase !== "idle") return;
    setPhase("poof");
    timer.current = setTimeout(() => setPhase("gone"), POOF_MS);
  };

  return (
    <aside
      className={`study-buddy${phase === "poof" ? " study-buddy--poof" : ""}`}
      aria-label="Toppershelf study buddy"
    >
      <div className="study-buddy__bubble" aria-live="polite">
        <p className="study-buddy__title">{greeting}</p>
      </div>

      <div className="study-buddy__stage">
        <button
          className="study-buddy__mascot"
          type="button"
          aria-label="Dismiss the study buddy"
          onClick={poof}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/toppershelf-owl.png" alt="" width={200} height={200} draggable={false} />
        </button>
        {puffs.map((p, i) => (
          <span
            key={i}
            className="study-buddy__smoke"
            aria-hidden="true"
            style={{ "--x": p.x, "--y": p.y, "--delay": p.delay } as React.CSSProperties}
          />
        ))}
      </div>
    </aside>
  );
}
