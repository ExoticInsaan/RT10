"use client";

import { useEffect } from "react";

const SUPPORT_EMAIL = "support@toppershelf.online";

// Last resort: used only when the root layout itself fails. It replaces the whole page, so it
// carries its own <html>/<body> and inline styles (the site stylesheet is not loaded here).
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const button = {
    border: "1px solid #102a4c",
    borderRadius: 6,
    padding: "12px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  } as const;

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fffbf7",
          color: "#1f2937",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <title>Something went wrong | Toppershelf</title>
        <main style={{ maxWidth: 440 }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: "#146db0", fontWeight: 700 }}>
            Toppershelf
          </p>
          <h1 style={{ margin: "0 0 12px", fontSize: 30, fontWeight: 500, color: "#102a4c" }}>Something went wrong</h1>
          <p style={{ margin: "0 0 24px", lineHeight: 1.6, color: "#687483" }}>
            The site hit an unexpected problem. Please try again in a moment. If it keeps happening, email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: "#102a4c", fontWeight: 600 }}>
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
          <button type="button" onClick={() => retry()} style={{ ...button, background: "#102a4c", color: "#fff" }}>
            Try again
          </button>{" "}
          {/* A plain link on purpose: this page replaces the whole app, so a full reload is the safe way out. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" style={{ ...button, background: "transparent", color: "#102a4c" }}>
            Go to home
          </a>
          {error.digest && (
            <p style={{ margin: "20px 0 0", fontSize: 12, color: "#8a9097" }}>
              Reference: <b>{error.digest}</b>
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
