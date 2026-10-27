import { ImageResponse } from "next/og";
import { parseShare } from "@/lib/tools/fun";

// Draws the result card as a 1080x1920 PNG (a full phone screen, ready for a story).
// Used by the Download button and as the preview image when the link is shared.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const shared = parseShare(id, url.searchParams.get("n"), url.searchParams.get("s"));
  if (!shared) return new Response("Not found", { status: 404 });
  const { result } = shared;
  const bigSize = result.big.length > 4 ? 280 : 340;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "90px 80px",
          background: "linear-gradient(155deg, #ffedd5, #e9d5ff 55%, #bae6fd)",
          color: "#102a4c",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 52, fontWeight: 800 }}>
          <div
            style={{
              display: "flex",
              width: 76,
              height: 76,
              borderRadius: 20,
              background: "#102a4c",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M12 2l2.6 6.9L22 10l-5.5 4.6L18 22l-6-3.8L6 22l1.5-7.4L2 10l7.4-1.1z" />
            </svg>
          </div>
          TopperShelf
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%" }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: 6, color: "#7e22ce", textTransform: "uppercase" }}>
            {result.kicker}
          </div>
          {result.subject ? (
            <div style={{ display: "flex", fontSize: 52, fontWeight: 600, color: "#475569", marginTop: 20, maxWidth: 900 }}>
              {result.subject}
            </div>
          ) : null}
          <div style={{ display: "flex", fontSize: bigSize, fontWeight: 800, letterSpacing: -10, lineHeight: 1, marginTop: 30 }}>
            {result.big}
          </div>
          <div style={{ display: "flex", fontSize: 110, fontWeight: 800, marginTop: 10, textAlign: "center" }}>{result.title}</div>
          <div style={{ display: "flex", fontSize: 54, lineHeight: 1.35, color: "#334155", marginTop: 40, maxWidth: 880, textAlign: "center" }}>
            {result.message}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            borderTop: "3px solid rgba(16,42,76,0.12)",
            paddingTop: 36,
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: 5,
            textTransform: "uppercase",
          }}
        >
          Try yours at toppershelf.online
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
