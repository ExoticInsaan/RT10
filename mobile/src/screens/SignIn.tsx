import { useEffect, useState } from "react";
import { signInWithGoogle } from "../auth";
import { GoogleIcon } from "../components/icons";
import { openExternal } from "../external";
import { navigate } from "../shims/router";
import { useAuth } from "@/components/AuthProvider";
import { setOnboarded } from "../storage";

export default function SignIn() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setOnboarded();
      navigate("/home", true);
    }
  }, [user]);

  async function google() {
    setBusy(true);
    setError(null);
    const message = await signInWithGoogle();
    if (message) setError(message);
    setBusy(false);
  }

  return (
    <div className="flex size-full flex-col overflow-y-auto bg-ivory text-navy">
      <div className="dots-light relative h-[330px] shrink-0 overflow-hidden rounded-b-[36px] bg-navy">
        <div className="flex items-center gap-2.5 px-6 pt-6">
          <img src="./logo-mark-light.png" alt="" className="size-10" />
          <div className="text-[22px] font-extrabold tracking-[-0.02em] text-white">
            Topper<span className="text-[#93c5fd]">Shelf</span>
          </div>
        </div>
        <img src="./mascot/owl-peek.webp" alt="" aria-hidden="true" className="absolute bottom-0 left-1/2 block w-[220px] -translate-x-1/2" />
      </div>

      <div className="flex flex-col gap-2.5 px-6 pt-8 text-center">
        <h1 className="m-0 font-display text-[32px] leading-[1.08] font-normal">One sign-in. Every tool.</h1>
        <p className="m-0 text-base leading-normal text-[#5b6675]">Free to use. Sign in once with Google to run any tool and keep your favourites.</p>
      </div>

      <div className="flex flex-col gap-1.5 px-6 pt-7">
        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="box-border flex min-h-14 cursor-pointer items-center justify-center gap-3 rounded-[28px] border-[1.5px] border-[#cbd5e1] bg-white text-[17px] font-bold text-ink shadow-[0_4px_0_#e2e8f0] disabled:opacity-60"
        >
          <GoogleIcon />
          {busy ? "Opening Google…" : "Continue with Google"}
        </button>
        {error && <p role="alert" className="m-0 px-2 text-center text-[13px] leading-5 text-rose-600">{error}</p>}
        <a
          href="#/home"
          onClick={() => setOnboarded()}
          className="flex min-h-[52px] items-center justify-center text-base font-bold text-[#2563eb]"
        >
          Browse tools first
        </a>
      </div>

      <div className="mt-auto px-8 pt-6 pb-7 text-center text-[13px] leading-normal text-[#5b6675]">
        No watermarks, no popups. File tools work on your device wherever they can.
        <br />
        By continuing you agree to the{" "}
        <button type="button" onClick={() => openExternal("https://www.toppershelf.online/terms")} className="border-0 bg-transparent p-0 font-semibold text-[#2563eb]">Terms</button> and{" "}
        <button type="button" onClick={() => openExternal("https://www.toppershelf.online/privacy")} className="border-0 bg-transparent p-0 font-semibold text-[#2563eb]">Privacy Policy</button>.
      </div>
    </div>
  );
}
