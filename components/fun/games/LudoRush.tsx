"use client";

import { useEffect, useState } from "react";
import LudoOnline from "@/components/fun/games/LudoOnline";

/**
 * Ludo Rush: vs 1 to 3 computers, or pass and play with names, with 3D dice and sounds, or online in a room.
 * The offline game is a self-contained page in `public/ludo/index.html`, shown here in a frame.
 * Its "Play online" button asks this page to open the online room (`LudoOnline`), which uses React and Supabase.
 * TODO: port the offline game to React so it can share the account, share card and analytics code.
 */
export default function LudoRush() {
  const [online, setOnline] = useState(false);
  // The setup screens are short; the board screen needs the full height. The game tells us which one it is showing.
  const [size, setSize] = useState<{ mode: "setup" | "game"; h: number }>({ mode: "setup", h: 520 });

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as { type?: string; mode?: "setup" | "game"; h?: number } | null;
      if (d?.type === "ludo:online") setOnline(true);
      if (d?.type === "ludo:size" && (d.mode === "setup" || d.mode === "game")) {
        setSize({ mode: d.mode, h: Math.max(320, Math.min(Number(d.h) || 520, 900)) });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (online) return <LudoOnline onExit={() => setOnline(false)} />;

  return (
    <div className="mx-auto w-full max-w-[30rem] overflow-hidden rounded-[28px] bg-[#041240] shadow-[0_24px_60px_-24px_rgba(16,42,76,.45)] sm:rounded-[36px]">
      <iframe
        src="/ludo/index.html"
        title="Ludo Rush"
        allow="autoplay"
        loading="eager"
        style={size.mode === "setup" ? { height: size.h } : undefined}
        className={`block w-full border-0 ${size.mode === "game" ? "h-[940px] max-[420px]:h-[900px]" : ""}`}
      />
    </div>
  );
}
