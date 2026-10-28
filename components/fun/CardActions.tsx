"use client";

import { useState } from "react";
import { copyText } from "@/components/fun/kit";
import { cardToBlob, downloadBlob, shareImage } from "@/lib/fun/cardImage";
import { nativeShare } from "@/lib/fun/friends";

/**
 * Download card + Share card under a story card.
 * Share opens the phone's share sheet with the picture (WhatsApp, Instagram, Messages and so on).
 * Where the browser cannot share a picture it shares the link, or copies the link if there is nothing to share with.
 */
export default function CardActions({
  getNode,
  fileName,
  shareText,
  shareUrl,
  btnClass,
  ghostClass,
}: {
  getNode: () => HTMLElement | null;
  fileName: string;
  shareText: string;
  /** A page that rebuilds the same result for anyone who opens it. */
  shareUrl?: string;
  btnClass: string;
  ghostClass: string;
}) {
  const [busy, setBusy] = useState<"" | "download" | "share">("");
  const [note, setNote] = useState("");

  async function draw() {
    const node = getNode();
    if (!node) throw new Error("no card");
    return cardToBlob(node);
  }

  async function download() {
    if (busy) return;
    setBusy("download");
    setNote("");
    try {
      downloadBlob(await draw(), fileName);
      setNote("Card saved.");
    } catch {
      setNote("Could not make the card. Please try again.");
    }
    setBusy("");
  }

  async function share() {
    if (busy) return;
    setBusy("share");
    setNote("");
    try {
      const blob = await draw();
      const result = await shareImage(blob, fileName, shareText, shareUrl);
      if (result === "unsupported") {
        if (shareUrl && (await nativeShare("TopperShelf", shareText, shareUrl))) {
          /* link shared */
        } else if (shareUrl) {
          copyText(shareUrl);
          setNote("Link copied. Paste it in any chat.");
        } else {
          downloadBlob(blob, fileName);
          setNote("Card saved. Share it from your gallery.");
        }
      }
    } catch {
      setNote("Could not make the card. Please try again.");
    }
    setBusy("");
  }

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-2 gap-3">
        <button type="button" className={ghostClass} onClick={download} disabled={!!busy}>{busy === "download" ? "Making…" : "Download card"}</button>
        <button type="button" className={btnClass} onClick={share} disabled={!!busy}>{busy === "share" ? "Opening…" : "Share card"}</button>
      </div>
      <p className="m-0 mt-2 min-h-5 text-center text-[13px] font-semibold opacity-80" role="status">{note}</p>
    </div>
  );
}
