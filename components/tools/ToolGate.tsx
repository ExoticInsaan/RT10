"use client";

import { useEffect } from "react";
import FunRunner from "@/components/tools/FunRunner";
import ToolIcon from "@/components/tools/ToolIcon";
import { Button, RECENT_KEY } from "@/components/tools/ui";
import { useAuth } from "@/components/AuthProvider";
import { isFunTool } from "@/lib/tools/fun";
import { useStoredList } from "@/lib/tools/useStoredList";

/**
 * The working area of a tool page (the page draws the card around it). Anyone can open the page; signing in is needed to run the tool.
 * The real tool UIs plug in here in a later step; for now it shows the sign-in gate and a "coming soon" panel.
 */
export default function ToolGate({ toolId, toolName }: { toolId: string; toolName: string }) {
  const { user, ready, openSignIn } = useAuth();
  const [, setRecent] = useStoredList(RECENT_KEY);

  useEffect(() => {
    setRecent((current) => [toolId, ...current.filter((x) => x !== toolId)].slice(0, 8));
  }, [toolId, setRecent]);

  return (
    <section>
      <div className="mx-auto max-w-xl text-center">
        {!(ready && user && isFunTool(toolId)) && (
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-soft text-blue-hover">
            <ToolIcon name={ready && user ? "zap" : "lock"} size={26} />
          </span>
        )}
        {ready && user && isFunTool(toolId) ? (
          <FunRunner toolId={toolId} />
        ) : ready && user ? (
          <>
            <h2 className="mb-2 mt-5 text-xl font-extrabold text-navy">{toolName} is coming soon</h2>
            <p className="m-0 text-sm leading-6 text-muted">
              You are signed in and ready. This tool is being built and will appear here shortly.
            </p>
          </>
        ) : (
          <>
            <h2 className="mb-2 mt-5 text-xl font-extrabold text-navy">Sign in to use {toolName}</h2>
            <p className="mb-5 mt-0 text-sm leading-6 text-muted">
              It takes one tap with Google. Free, with no watermark and nothing to install.
            </p>
            <Button onClick={openSignIn}>Continue with Google</Button>
          </>
        )}
      </div>
    </section>
  );
}
