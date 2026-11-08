import { useEffect } from "react";
import FunGame, { hasFunGame } from "@/components/fun/FunGame";
import { shelfTools } from "@/components/tools/shelf";
import { RECENT_KEY } from "@/components/tools/ui";
import { useAuth } from "@/components/AuthProvider";
import { toolById } from "@/lib/tools/registry";
import ShareToolButton from "@/components/tools/ShareToolButton";
import { trackToolOpen } from "@/lib/tools/track";
import { useStoredList } from "@/lib/tools/useStoredList";
import AppReminder from "../components/AppReminder";
import WidgetTip from "../components/WidgetTip";
import { BackIcon } from "../components/icons";
import { back } from "../shims/router";
import { useTr } from "@/lib/tools/useTr";
import { useToolText } from "../i18n/toolText";

/** One tool or game, full screen. Same sign-in rule as the website: browse freely, sign in to run a tool. */
export default function ToolScreen({ id }: { id: string }) {
  const tool = toolById(id);
  const tr = useTr();
  const toolText = useToolText();
  const name = tool ? toolText(tool).name : "";
  const { user, ready, openSignIn } = useAuth();
  const [, setRecent] = useStoredList(RECENT_KEY);
  const fun = hasFunGame(id);
  // The app has its own Reminder (real phone notifications, no calendar buttons).
  const Shelf = id === "reminder" ? AppReminder : shelfTools[id];

  useEffect(() => {
    setRecent((cur) => [id, ...cur.filter((x) => x !== id)].slice(0, 8));
  }, [id, setRecent]);

  // Count the visit once the sign-in state is known, so "signed in or not" is right.
  useEffect(() => {
    if (ready && tool) trackToolOpen(id, !!user);
  }, [id, ready, user, tool]);

  if (!tool || (!fun && !Shelf)) {
    return (
      <Frame fun={false} backLabel={tr("Back")} title={tr("Not found")}>
        <p className="m-0 py-10 text-center text-sub">{tr("This tool is not in the app yet.")}</p>
      </Frame>
    );
  }

  const signedIn = ready && !!user;
  const gate = (
    <div className="mx-auto mt-6 max-w-sm rounded-3xl bg-card p-6 text-center text-navy shadow-card">
      <img src="./mascot/owl-peek.webp" alt="" className="mx-auto mb-3 w-28" />
      <h2 className="m-0 text-xl font-extrabold">{tr("Sign in to use {name}", { name })}</h2>
      <p className="mt-2 mb-5 text-sm leading-6 text-sub">{tr("One quick Google sign-in. Free, no watermarks.")}</p>
      <button type="button" onClick={openSignIn} className="min-h-12 w-full cursor-pointer rounded-[28px] border-0 bg-[#2563eb] text-base font-extrabold text-white shadow-[0_4px_0_#1e40af]">
        {ready ? tr("Continue") : tr("Loading…")}
      </button>
    </div>
  );

  if (fun) {
    return (
      <Frame fun backLabel={tr("Fun Zone")} title={name} toolId={tool.id}>
        {signedIn ? <FunGame id={id} /> : gate}
      </Frame>
    );
  }
  return (
    <Frame fun={false} backLabel={tr("The Shelf")} title={name} toolId={tool.id}>
      {signedIn ? <div className="rounded-3xl border border-edge bg-card p-4 shadow-card">{Shelf && <Shelf />}</div> : gate}
      {signedIn && id === "days-countdown" && <WidgetTip />}
    </Frame>
  );
}

function Frame({ fun, backLabel, title, toolId, children }: { fun: boolean; backLabel: string; title: string; toolId?: string; children: React.ReactNode }) {
  return (
    <div className={`hide-scrollbar absolute inset-0 overflow-y-auto overflow-x-hidden pb-[max(28px,env(safe-area-inset-bottom))] ${fun ? "light-island bg-fun-field" : "bg-ivory"}`}>
      <div className="flex items-center justify-between pr-3">
        <button
          type="button"
          onClick={back}
          className={`mt-1 inline-flex min-h-12 cursor-pointer items-center gap-1 border-0 bg-transparent pr-4 pl-2.5 text-base font-extrabold ${fun ? "text-white" : "text-navy"}`}
        >
          <BackIcon />
          {backLabel}
        </button>
        {toolId && <ShareToolButton toolId={toolId} toolName={title} onDark={fun} />}
      </div>
      {!fun && <h1 className="m-0 px-5 pb-3 font-display text-[34px] leading-[1.05] font-normal text-navy">{title}</h1>}
      <div className={fun ? "px-3" : "px-4"}>{children}</div>
    </div>
  );
}
