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

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if ((e.data as { type?: string } | null)?.type === "ludo:online") setOnline(true);
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
        className="block h-[940px] w-full border-0 max-[420px]:h-[900px]"
      />
    </div>
  );
}
