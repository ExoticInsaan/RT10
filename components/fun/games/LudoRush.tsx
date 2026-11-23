"use client";

/**
 * Ludo Rush: you (Red) against 3 computers, with 3D dice, sounds and Auto Play.
 * The game itself is a self-contained page in `public/ludo/index.html`, shown here in a frame.
 * TODO: port it to React so it can share the account, share card and analytics code.
 */
export default function LudoRush() {
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
