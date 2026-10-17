"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import StatusPage from "@/components/ui/StatusPage";

const SUPPORT_EMAIL = "support@toppershelf.online";

// Shown when something breaks while a page is loading or running. The header and footer stay in place.
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      label="Something went wrong"
      title="This page hit a problem"
      actions={
        <>
          <Button onClick={() => retry()}>Try again</Button>
          <Button variant="secondary" href="/">
            Go to home
          </Button>
        </>
      }
    >
      <p className="m-0">
        It is on our side, not yours. Please try again in a moment. If it keeps happening, email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-navy underline">
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
      {error.digest && (
        <p className="m-0 mt-3 text-xs">
          Reference: <b>{error.digest}</b>
        </p>
      )}
    </StatusPage>
  );
}
