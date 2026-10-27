import { ImageResponse } from "next/og";

// The picture shown when a link to the site is shared (WhatsApp, Instagram, X, LinkedIn and so on).
export const alt = "TopperShelf: Useful tools. A few silly ones. All free.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "linear-gradient(135deg, #fffbf7 0%, #e8f5ff 55%, #f3e8ff 100%)",
          color: "#102a4c",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: 110,
              height: 110,
              borderRadius: 28,
              background: "#102a4c",
            }}
          >
            <div style={{ display: "flex", width: 58, height: 12, borderRadius: 6, background: "#2f8ee8" }} />
            <div style={{ display: "flex", width: 58, height: 12, borderRadius: 6, background: "#7c3aed" }} />
            <div style={{ display: "flex", width: 58, height: 12, borderRadius: 6, background: "#0f9f8f" }} />
          </div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>
            Topper<span style={{ color: "#146db0" }}>Shelf</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.1, marginTop: 56, letterSpacing: -2 }}>
          Useful tools. A few silly ones.
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.1, color: "#146db0", letterSpacing: -2 }}>
          All free.
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#475569", marginTop: 40 }}>
          Free online tools · Fun Zone · toppershelf.online
        </div>
      </div>
    ),
    size,
  );
}
