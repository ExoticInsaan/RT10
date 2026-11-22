import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { navigate } from "../shims/router";
import { isOnboarded, setOnboarded } from "../storage";
import { useLanguage } from "../i18n/LanguageProvider";

export default function Splash() {
  const { t } = useLanguage();
  const { user, ready } = useAuth();
  const [leaving, setLeaving] = useState(false);
  const loggedIn = !!user;
  // Logged-in people (and guests who already saw the intro) go straight into the app.
  const skipIntro = loggedIn || isOnboarded();

  useEffect(() => {
    if (!ready || !skipIntro) return;
    if (loggedIn) setOnboarded(); // remember it, so signing out later does not replay the slides
    const fade = window.setTimeout(() => setLeaving(true), 900);
    const go = window.setTimeout(() => navigate("/home", true), 1250);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(go);
    };
  }, [ready, skipIntro, loggedIn]);

  // Checking the saved login, or entering the app: a short logo animation instead of the Get started screen.
  if (!ready || skipIntro) {
    return (
      <div className={`bg-onboard-dots grid size-full place-items-center overflow-hidden ${leaving ? "splash-leave" : ""}`}>
        <div className="flex flex-col items-center gap-3.5 text-center">
          <img src="./logo-mark.png" alt={t("splash.logoAlt")} className="splash-pop size-[132px] roomy:size-[176px]" />
          <div className="splash-rise text-[40px] leading-none font-extrabold tracking-[-0.03em] text-navy roomy:text-[56px]">
            Topper<span className="text-link2">Shelf</span>
          </div>
          <div className="splash-dots mt-2" aria-hidden="true"><i /><i /><i /></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="splash-fade bg-onboard-dots relative size-full overflow-hidden roomy:[--btn-gap:76px]"
      // Where the tagline starts: 75% down, but never closer than 12px under the button (button = 66% down + 56px tall).
      style={{ "--tagline-top": "max(75vh, calc(66vh + var(--btn-gap, 68px)))" } as React.CSSProperties}
    >
      <div className="absolute inset-x-0 top-[17%] flex flex-col items-center gap-3.5 text-center">
        <img src="./logo-mark.png" alt={t("splash.logoAlt")} className="size-[132px] roomy:size-[176px]" />
        <div className="text-[40px] leading-none font-extrabold tracking-[-0.03em] text-navy roomy:text-[56px]">
          Topper<span className="text-link2">Shelf</span>
        </div>
        <div className="mt-2.5 font-display text-[26px] leading-[1.15] text-navy roomy:text-[36px]">
          {t("home.hero1")}<br />{t("home.hero2")}<br />{t("home.hero3")}
        </div>
      </div>
      <a
        href="#/onboard/1"
        className="absolute left-1/2 top-[66%] flex h-14 w-[260px] -translate-x-1/2 roomy:h-16 roomy:w-[320px] roomy:text-xl items-center justify-center rounded-[28px] bg-[#2563eb] text-[17px] font-extrabold text-white shadow-[0_5px_0_#1e40af,0_14px_24px_rgba(30,64,175,.25)]"
      >
        {t("splash.getStarted")}
      </a>
      <div className="absolute inset-x-0 top-[var(--tagline-top)] text-center text-[13px] tracking-[0.04em] text-sub roomy:text-base">{t("splash.tagline")}</div>
      <img src="./mascot/owl-peek.webp" alt="" aria-hidden="true" className="absolute bottom-0 left-1/2 block -translate-x-1/2 [@media(max-height:520px)]:hidden"
        // Never taller than the space under the tagline (about 26px for the tagline itself and a small gap), so it cannot reach the button.
        style={{ width: "max(0px, min(240px, calc((100vh - var(--tagline-top) - 26px) * 1.2766)))" }}
      />
    </div>
  );
}
