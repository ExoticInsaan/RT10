import { useState } from "react";
import { tools } from "@/lib/tools/registry";
import { BellIcon, CloudIcon, OfflineIcon } from "../components/icons";
import { asset, Thumb } from "../components/tiles";
import { enablePush, pushWanted } from "../push";
import { navigate } from "../shims/router";
import { useLanguage } from "../i18n/LanguageProvider";
import { useToolText } from "../i18n/toolText";
import LanguageSwitcher from "../components/LanguageSwitcher";
import type { TranslationKey } from "../i18n";

const byId = (id: string) => tools.find((t) => t.id === id)!;

export function Onboard1() {
  const { t } = useLanguage();
  const text = useToolText();
  const picks = ["pdf-toolkit", "image-compressor", "cgpa-calculator", "attendance-calculator"].map(byId);
  return (
    <div className="light-island flex size-full flex-col overflow-hidden bg-ivory text-navy">
      <div className="flex h-14 items-center justify-between gap-2 px-5 pt-3.5">
        <img src="./logo-mark.png" alt="TopperShelf" className="size-9" />
        <div className="flex items-center gap-1">
          <LanguageSwitcher compact />
          <a href="#/signin" className="flex min-h-11 min-w-11 items-center justify-end px-2 text-[15px] font-bold text-steel">{t("common.skip")}</a>
        </div>
      </div>

      <div className="mx-5 mt-3.5 grid grid-cols-2 gap-3 rounded-[32px] bg-blue-soft p-4">
        {picks.map((tool) => (
          <div key={tool.id} className="flex flex-col gap-2">
            <Thumb tool={tool} className="aspect-square rounded-[22px] shadow-[0_10px_24px_-12px_rgba(16,42,76,.35)]" />
            <div className="px-1 text-sm font-bold">{tool.id === "cgpa-calculator" ? t("tiles.cgpaShort") : text(tool).name}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-6 pt-7">
        <h1 className="m-0 font-display text-[34px] leading-[1.08] font-normal tracking-[-0.01em]">{t("onboard.o1Title")}</h1>
        <p className="m-0 text-base leading-normal text-sub">{t("onboard.o1Body")}</p>
      </div>

      <div className="mt-auto flex items-center justify-between px-6 pb-8">
        <div className="flex gap-2" aria-hidden="true">
          <span className="h-2 w-[26px] rounded bg-[#2563eb]" />
          <span className="size-2 rounded bg-[#c7dcfb]" />
          <span className="size-2 rounded bg-[#c7dcfb]" />
        </div>
        <a href="#/onboard/2" className="flex min-h-14 items-center justify-center rounded-[28px] bg-[#2563eb] px-8 text-[17px] font-extrabold text-white shadow-[0_5px_0_#1e40af]">{t("common.next")}</a>
      </div>
    </div>
  );
}

export function Onboard2() {
  const { t } = useLanguage();
  const text = useToolText();
  const picks = [
    { id: "how-cooked", tilt: -3, drop: false },
    { id: "decision-wheel", tilt: 2.5, drop: true },
    { id: "excuse-generator", tilt: 2, drop: false },
    { id: "vibe-check", tilt: -2.5, drop: true },
  ].map((p) => ({ ...p, tool: byId(p.id) }));
  return (
    <div className="light-island bg-onboard-fun relative size-full overflow-hidden text-navy">
      <div className="flex h-14 items-center justify-between px-5 pt-3.5">
        <img src="./logo-mark-light.png" alt="TopperShelf" className="size-9" />
        <a href="#/signin" className="flex min-h-11 min-w-11 items-center justify-end px-2 text-[15px] font-bold text-white">{t("common.skip")}</a>
      </div>

      <div className="mx-7 mt-[18px] grid grid-cols-2 gap-[18px]">
        {picks.map(({ tool, tilt, drop }) => (
          <div
            key={tool.id}
            style={{ rotate: `${tilt}deg` }}
            className={`rounded-[26px] bg-card p-[9px] shadow-[0_22px_44px_-18px_rgb(60_8_40/55%)] ${drop ? "mt-[22px]" : ""}`}
          >
            <div className="aspect-square overflow-hidden rounded-[19px]" style={{ background: tool.imageBg }}>
              <img src={asset(tool.image!)} alt="" className="block size-full scale-[1.04] object-cover" />
            </div>
            <div className="px-1 pt-[9px] pb-[3px] text-sm font-extrabold">{text(tool).name}</div>
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 box-border flex h-[39%] min-h-[300px] flex-col rounded-t-[32px] bg-ivory px-6 pt-7 pb-8 shadow-[0_-10px_30px_-12px_rgba(60,8,40,.35)]">
        <h1 className="m-0 font-display text-[34px] leading-[1.08] font-normal tracking-[-0.01em]">{t("onboard.o2Title")}</h1>
        <p className="mt-3 mb-0 text-base leading-normal text-sub">{t("onboard.o2Body")}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex gap-2" aria-hidden="true">
            <span className="size-2 rounded bg-[#d9c7f5]" />
            <span className="h-2 w-[26px] rounded bg-[#7c3aed]" />
            <span className="size-2 rounded bg-[#d9c7f5]" />
          </div>
          <a href="#/onboard/3" className="flex min-h-14 items-center justify-center rounded-[28px] bg-deep px-8 text-[17px] font-extrabold text-white shadow-[0_5px_0_#050f1f]">{t("common.next")}</a>
        </div>
      </div>
    </div>
  );
}

const perks: { Icon: typeof BellIcon; bg: string; title: TranslationKey; text: TranslationKey }[] = [
  { Icon: BellIcon, bg: "bg-[#dbeafe] text-link", title: "onboard.perk1Title", text: "onboard.perk1Text" },
  { Icon: OfflineIcon, bg: "bg-[#ccfbf1] text-[#0f766e]", title: "onboard.perk2Title", text: "onboard.perk2Text" },
  { Icon: CloudIcon, bg: "bg-[#ede9fe] text-[#6d28d9]", title: "onboard.perk3Title", text: "onboard.perk3Text" },
];

/** Third intro screen: what else the app does, and the one place we ask to send notifications. */
export function Onboard3() {
  const { t } = useLanguage();
  const [state, setState] = useState<"idle" | "busy" | "on" | "blocked">(() => (pushWanted() ? "on" : "idle"));
  const [message, setMessage] = useState("");

  async function allow() {
    setState("busy");
    const problem = await enablePush();
    setMessage(problem ?? "");
    setState(problem ? "blocked" : "on");
  }
  const next = () => navigate("/signin");

  return (
    <div className="light-island flex size-full flex-col overflow-y-auto overflow-x-hidden bg-ivory text-navy">
      <div className="flex h-14 shrink-0 items-center justify-between px-5 pt-3.5">
        <img src="./logo-mark.png" alt="TopperShelf" className="size-9" />
        <a href="#/signin" className="flex min-h-11 min-w-11 items-center justify-end px-2 text-[15px] font-bold text-steel">{t("common.skip")}</a>
      </div>

      <div className="flex flex-col gap-3 px-6 pt-4">
        <h1 className="m-0 font-display text-[34px] leading-[1.08] font-normal tracking-[-0.01em]">{t("onboard.o3Title")}</h1>
        <p className="m-0 text-base leading-normal text-sub">{t("onboard.o3Body")}</p>
      </div>

      <ul className="m-0 mt-5 grid list-none gap-3 p-0 px-6">
        {perks.map(({ Icon, bg, title, text }) => (
          <li key={title} className="flex items-start gap-3.5 rounded-[22px] border border-line bg-card p-4">
            <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${bg}`}>
              <Icon size={22} />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-extrabold">{t(title)}</span>
              <span className="mt-0.5 block text-sm leading-5 text-sub">{t(text)}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-3 px-6 pt-6 pb-8">
        <p className="m-0 text-center text-[13px] leading-5 text-sub">
          {state === "on"
            ? t("onboard.notifOn")
            : t("onboard.notifAsk")}
        </p>
        {message && <p role="alert" className="m-0 text-center text-[13px] leading-5 text-rose-600">{message}</p>}
        <div className="flex items-center justify-between">
          <div className="flex gap-2" aria-hidden="true">
            <span className="size-2 rounded bg-[#c7dcfb]" />
            <span className="size-2 rounded bg-[#c7dcfb]" />
            <span className="h-2 w-[26px] rounded bg-[#2563eb]" />
          </div>
          <button
            type="button"
            disabled={state === "busy"}
            onClick={state === "idle" ? () => void allow() : next}
            className="flex min-h-14 cursor-pointer items-center justify-center rounded-[28px] border-0 bg-[#2563eb] px-8 text-[17px] font-extrabold text-white shadow-[0_5px_0_#1e40af] disabled:opacity-60"
          >
            {state === "idle" ? t("onboard.allow") : state === "busy" ? t("onboard.busy") : t("onboard.continue")}
          </button>
        </div>
        {state === "idle" && (
          <button type="button" onClick={next} className="min-h-11 cursor-pointer border-0 bg-transparent text-[15px] font-bold text-steel">
            {t("onboard.notNow")}
          </button>
        )}
      </div>
    </div>
  );
}
