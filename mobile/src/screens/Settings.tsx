import { useState, type ReactNode } from "react";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { FAVOURITES_KEY, RECENT_KEY } from "@/components/tools/ui";
import { useAuth } from "@/components/AuthProvider";
import { useStoredList } from "@/lib/tools/useStoredList";
import { clearLocalData, deleteMyAccount } from "../account";
import { BackIcon } from "../components/icons";
import { openExternal } from "../external";
import { disablePush, enablePush, pushSupported, pushWanted } from "../push";
import { back, navigate } from "../shims/router";
import { setChoice, useThemeChoice, type ThemeChoice } from "../theme";
import { useLanguage } from "../i18n/LanguageProvider";
import type { TranslationKey } from "../i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

const SUPPORT_EMAIL = "support@toppershelf.online";
const SITE = "https://www.toppershelf.online";
const PLAY_LINK = "https://play.google.com/store/apps/details?id=online.toppershelf.app";
const INSTAGRAM = "https://www.instagram.com/toppershelf_official";

const androidVersion = () => /Android\s([\d.]+)/.exec(navigator.userAgent)?.[1] ?? "unknown";
const mail = (subject: string, body: string) => `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
const goMail = (href: string) => {
  window.location.href = href;
};

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 px-5">
      <h2 className="m-0 mb-2 px-1 text-xs font-extrabold tracking-[0.08em] text-sub uppercase">{title}</h2>
      <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-card">{children}</div>
    </section>
  );
}

function Row({ label, hint, onClick, right, danger }: { label: string; hint?: string; onClick?: () => void; right?: ReactNode; danger?: boolean }) {
  const inner = (
    <>
      <span className="min-w-0 flex-1 text-left">
        <span className={`block text-[15px] font-bold ${danger ? "text-danger" : "text-navy"}`}>{label}</span>
        {hint && <span className="block truncate text-[13px] text-sub">{hint}</span>}
      </span>
      {right}
    </>
  );
  const cls = "flex min-h-14 w-full items-center gap-3 border-0 bg-transparent px-4 py-2.5";
  return onClick ? (
    <button type="button" onClick={onClick} className={`${cls} cursor-pointer`}>
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

const THEME_OPTIONS = [
  { value: "system", key: "appearance.system" },
  { value: "light", key: "appearance.light" },
  { value: "dark", key: "appearance.dark" },
] as const satisfies readonly { value: ThemeChoice; key: TranslationKey }[];

/** Three-way choice: follow the phone, always light, or always dark. */
function ThemePicker() {
  const choice = useThemeChoice();
  const { t } = useLanguage();
  return (
    <div className="px-4 py-3">
      <span className="block text-[15px] font-bold text-navy">{t("appearance.theme")}</span>
      <span className="mb-3 block text-[13px] text-sub">{t("appearance.hint")}</span>
      <div role="radiogroup" aria-label={t("appearance.theme")} className="grid grid-cols-3 gap-1 rounded-2xl bg-blue-soft p-1">
        {THEME_OPTIONS.map(({ value, key }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={choice === value}
            onClick={() => setChoice(value)}
            className={`min-h-11 cursor-pointer rounded-xl border-0 text-sm font-bold ${choice === value ? "bg-[#2563eb] text-white" : "bg-transparent text-sub"}`}
          >
            {t(key)}
          </button>
        ))}
      </div>
    </div>
  );
}

const Chevron = () => <span className="text-lg font-bold text-[#9aa3af]">›</span>;

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full border-0 transition-colors ${on ? "bg-[#2563eb]" : "bg-track"}`}
    >
      <span className={`absolute top-1 left-1 size-6 rounded-full bg-card shadow transition-transform ${on ? "translate-x-6" : ""}`} />
    </button>
  );
}

export default function Settings() {
  const { user, ready, openSignIn, signOut } = useAuth();
  const { t } = useLanguage();
  const [, setFavs] = useStoredList(FAVOURITES_KEY);
  const [, setRecent] = useStoredList(RECENT_KEY);
  const [pushOn, setPushOn] = useState(pushWanted);
  const [note, setNote] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const name = (user?.user_metadata?.name as string | undefined) ?? user?.email;
  const version = __APP_VERSION__;

  async function togglePush() {
    setNote(null);
    if (pushOn) {
      await disablePush();
      setPushOn(false);
      return;
    }
    const problem = await enablePush();
    setPushOn(!problem);
    setNote(problem);
  }

  async function share() {
    const text = "TopperShelf: free study tools, games and calculators for students.";
    try {
      if (Capacitor.isNativePlatform()) await Share.share({ title: "TopperShelf", text, url: PLAY_LINK, dialogTitle: "Share TopperShelf" });
      else await navigator.share?.({ title: "TopperShelf", text, url: PLAY_LINK });
    } catch {
      /* closed the share sheet */
    }
  }

  function clearData() {
    setFavs([]);
    setRecent([]);
    clearLocalData();
    setNote(t("settings.cleared"));
  }

  async function removeAccount() {
    setBusy(true);
    setDeleteError(null);
    const problem = await deleteMyAccount();
    setBusy(false);
    if (problem) {
      setDeleteError(problem);
      return;
    }
    clearLocalData();
    setFavs([]);
    setRecent([]);
    await signOut();
    setConfirmDelete(false);
    navigate("/home", true);
  }

  return (
    <div className="hide-scrollbar absolute inset-0 overflow-y-auto overflow-x-hidden pb-10">
      <header className="sticky top-0 z-10 flex items-center gap-2 bg-ivory/95 px-3 pt-4 pb-2 backdrop-blur">
        <button type="button" onClick={back} aria-label={t("common.back")} className="grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-navy">
          <BackIcon />
        </button>
        <h1 className="m-0 font-display text-[30px] leading-none font-normal">{t("settings.title")}</h1>
      </header>

      <Group title={t("appearance.title")}>
        <ThemePicker />
      </Group>

      <Group title={t("language.title")}>
        <Row label={t("language.label")} hint={t("language.hint")} right={<LanguageSwitcher />} />
      </Group>

      <Group title={t("settings.account")}>
        {ready && (
          <Row
            label={user ? t("settings.signedIn") : t("settings.guest")}
            hint={user ? name : t("settings.guestHint")}
            right={
              <span
                role="button"
                tabIndex={0}
                onClick={user ? () => void signOut() : openSignIn}
                onKeyDown={(e) => e.key === "Enter" && (user ? void signOut() : openSignIn())}
                className="inline-flex min-h-10 shrink-0 cursor-pointer items-center rounded-full bg-deep px-5 text-sm font-bold text-white"
              >
                {user ? t("settings.signOut") : t("settings.signIn")}
              </span>
            }
          />
        )}
        {user && <Row label={t("settings.deleteAccount")} hint={t("settings.deleteAccountHint")} danger onClick={() => setConfirmDelete(true)} right={<Chevron />} />}
      </Group>

      <Group title={t("settings.notifications")}>
        <Row
          label={t("settings.updates")}
          hint={pushSupported() ? t("settings.updatesHint") : t("settings.updatesUnsupported")}
          right={pushSupported() ? <Switch on={pushOn} onChange={() => void togglePush()} label={t("settings.notifications")} /> : undefined}
        />
      </Group>

      <Group title={t("settings.help")}>
        <Row label={t("settings.askTool")} hint={t("settings.askToolHint")} onClick={() => navigate("/request-tool")} right={<Chevron />} />
        <Row
          label={t("settings.report")}
          hint={SUPPORT_EMAIL}
          onClick={() => goMail(mail("Problem in the TopperShelf app", `What went wrong:\n\n\n---\nApp version: ${version}\nAndroid: ${androidVersion()}`))}
          right={<Chevron />}
        />
        <Row label={t("settings.share")} hint={t("settings.shareHint")} onClick={() => void share()} right={<Chevron />} />
        <Row label={t("settings.rate")} onClick={() => void openExternal(PLAY_LINK)} right={<Chevron />} />
      </Group>

      <Group title={t("settings.about")}>
        <Row label={t("settings.terms")} onClick={() => void openExternal(`${SITE}/terms`)} right={<Chevron />} />
        <Row label={t("settings.privacy")} onClick={() => void openExternal(`${SITE}/privacy`)} right={<Chevron />} />
        <Row label={t("settings.founders")} onClick={() => void openExternal(`${SITE}/founders`)} right={<Chevron />} />
        <Row label="Instagram" hint="@toppershelf_official" onClick={() => void openExternal(INSTAGRAM)} right={<Chevron />} />
        <Row label={t("settings.version")} right={<span className="text-sm font-semibold text-sub">{version}</span>} />
      </Group>

      <Group title={t("settings.data")}>
        <Row label={t("settings.clear")} hint={t("settings.clearHint")} onClick={clearData} right={<Chevron />} />
      </Group>

      {note && (
        <p role="status" className="mx-6 mt-4 mb-0 text-center text-[13px] leading-5 text-sub">
          {note}
        </p>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-[#102a4c]/55 sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="del-title">
          <div className="mx-auto w-full max-w-[480px] rounded-t-[32px] bg-card p-6 pb-8">
            <h2 id="del-title" className="m-0 text-xl font-extrabold">{t("settings.deleteTitle")}</h2>
            <p className="mt-2 mb-0 text-[15px] leading-6 text-sub">
              {t("settings.deleteBody")}
            </p>
            {deleteError && <p role="alert" className="mt-3 mb-0 text-sm font-semibold text-danger">{deleteError}</p>}
            <button
              type="button"
              disabled={busy}
              onClick={() => void removeAccount()}
              className="mt-5 min-h-12 w-full cursor-pointer rounded-[28px] border-0 bg-[#b91c1c] text-base font-extrabold text-white disabled:opacity-60"
            >
              {busy ? t("settings.deleting") : t("settings.deleteYes")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setConfirmDelete(false);
                setDeleteError(null);
              }}
              className="mt-2 min-h-12 w-full cursor-pointer rounded-[28px] border-0 bg-transparent text-base font-bold text-navy"
            >
              {t("settings.deleteKeep")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
