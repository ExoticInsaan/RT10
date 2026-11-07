import RequestToolForm from "@/components/RequestToolForm";
import { BackIcon } from "../components/icons";
import { back } from "../shims/router";
import { useLanguage } from "../i18n/LanguageProvider";

/** "Ask for a tool". Uses the website's own form, so requests land in the same tool_requests table (and the /admin page). */
export default function RequestTool() {
  const { t } = useLanguage();
  return (
    <div className="hide-scrollbar absolute inset-0 overflow-y-auto overflow-x-hidden pb-10">
      <header className="sticky top-0 z-10 flex items-center gap-2 bg-ivory/95 px-3 pt-4 pb-2 backdrop-blur">
        <button type="button" onClick={back} aria-label={t("common.back")} className="grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-navy">
          <BackIcon />
        </button>
        <h1 className="m-0 font-display text-[30px] leading-none font-normal">{t("settings.askTool")}</h1>
      </header>
      <div className="px-5">
        <RequestToolForm />
      </div>
    </div>
  );
}
