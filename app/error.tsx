"use client";

import { useEffect } from "react";
import StatusPage from "@/components/shell/StatusPage";
import { SUPPORT_EMAIL } from "@/components/shell/Legal";
import { Button, ButtonLink } from "@/components/tools/ui";

// Shown inside the normal site layout when something breaks while a page is running (a tool crashing, the database not
// answering). Instead of a blank screen or a technical message, people get a way to retry or move on.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      label="Something went wrong"
      title="That didn’t work"
      actions={
        <>
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/the-shelf" variant="secondary">
            Browse all tools
          </ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Go to home
          </ButtonLink>
        </>
      }
    >
      <p className="m-0">
        Something broke on our side. Please try again, and if it keeps happening, email us at{" "}
        <a className="font-semibold text-navy underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
      {error.digest && <p className="mb-0 mt-3 text-xs">Reference: {error.digest}</p>}
    </StatusPage>
  );
}
