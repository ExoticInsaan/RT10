import { useEffect } from "react";
import { navigate } from "../shims/router";
import { isOnboarded } from "../storage";

export default function Splash() {
  // Returning visitors skip the intro.
  useEffect(() => {
    if (!isOnboarded()) return;
    const t = window.setTimeout(() => navigate("/home", true), 1100);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className="bg-onboard-dots relative size-full overflow-hidden"
      // Where the tagline starts: 75% down, but never closer than 12px under the button (button = 66% down + 56px tall).
      style={{ "--tagline-top": "max(75vh, calc(66vh + 68px))" } as React.CSSProperties}
    >
      <div className="absolute inset-x-0 top-[17%] flex flex-col items-center gap-3.5 text-center">
        <img src="./logo-mark.png" alt="TopperShelf logo" className="size-[132px]" />
        <div className="text-[40px] leading-none font-extrabold tracking-[-0.03em] text-navy">
          Topper<span className="text-[#2563eb]">Shelf</span>
        </div>
        <div className="mt-2.5 font-display text-[26px] leading-[1.15] text-navy">
          Useful tools.<br />A few silly ones.<br />All free.
        </div>
      </div>
      <a
        href="#/onboard/1"
        className="absolute left-1/2 top-[66%] flex h-14 w-[260px] -translate-x-1/2 items-center justify-center rounded-[28px] bg-[#2563eb] text-[17px] font-extrabold text-white shadow-[0_5px_0_#1e40af,0_14px_24px_rgba(30,64,175,.25)]"
      >
        Get started
      </a>
      <div className="absolute inset-x-0 top-[var(--tagline-top)] text-center text-[13px] tracking-[0.04em] text-[#5b6675]">Better resources. Better results.</div>
      <img src="./mascot/owl-peek.webp" alt="" aria-hidden="true" className="absolute bottom-0 left-1/2 block -translate-x-1/2 [@media(max-height:520px)]:hidden"
        // Never taller than the space under the tagline (about 26px for the tagline itself and a small gap), so it cannot reach the button.
        style={{ width: "max(0px, min(240px, calc((100vh - var(--tagline-top) - 26px) * 1.2766)))" }}
      />
    </div>
  );
}
