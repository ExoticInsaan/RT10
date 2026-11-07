"use client";

// Last resort: used only when the whole site layout itself fails, so it cannot rely on the site's styles or components.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#FFFBF7", color: "#0f2744" }}>
        <main style={{ maxWidth: 480, margin: "0 auto", padding: "96px 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: 28, margin: "0 0 12px" }}>That didn’t work</h1>
          <p style={{ margin: "0 0 24px", lineHeight: 1.6 }}>
            Something broke on our side. Please try again, or come back in a minute.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ background: "#2563eb", color: "#fff", border: 0, borderRadius: 999, padding: "12px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
