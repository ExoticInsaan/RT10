"use client";

/* Turns a story card (drawn at 540x960) into a 1080x1920 PNG, and downloads or shares it.
   Website: Download saves the file; Share opens the phone's share sheet with the picture where the browser allows it.
   Android app: both go through the native share sheet (see mobile/src/native.ts). */

type NativeShareImage = (o: { blob: Blob; filename: string; text: string }) => Promise<void>;

export async function cardToBlob(node: HTMLElement): Promise<Blob> {
  const { toBlob } = await import("html-to-image");
  const options = { pixelRatio: 2, width: 540, height: 960, cacheBust: true, style: { transform: "none" } };
  // The first pass lets fonts and pictures load into the clone; the second is the one that has them all.
  await toBlob(node, options).catch(() => null);
  const blob = await toBlob(node, options);
  if (!blob) throw new Error("Could not draw the card");
  return blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Opens the share sheet with the card picture. Returns "shared", "closed" (the person backed out) or "unsupported". */
export async function shareImage(blob: Blob, filename: string, text: string, url?: string): Promise<"shared" | "closed" | "unsupported"> {
  try {
    const native = (window as unknown as { __tsShareImage?: NativeShareImage }).__tsShareImage;
    if (native) {
      await native({ blob, filename, text: url ? `${text} ${url}` : text });
      return "shared";
    }
    const file = new File([blob], filename, { type: "image/png" });
    if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text: url ? `${text} ${url}` : text });
      return "shared";
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return "closed";
  }
  return "unsupported";
}
