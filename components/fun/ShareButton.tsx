"use client";

import { useSyncExternalStore } from "react";
import { canNativeShare, nativeShare, whatsappHref } from "@/lib/fun/friends";

const subscribe = () => () => {};

/**
 * The one share button for friend links.
 * Phones and the Android app: a single "Share" button that opens the system share sheet (WhatsApp, Instagram, Messages and so on).
 * Browsers with no share sheet (most desktops): a "Send on WhatsApp" link instead. Copy stays next to the link in every case.
 */
export default function ShareButton({
  title,
  text,
  url,
  shareClass,
  whatsappClass,
  onFallback,
}: {
  title: string;
  text: string;
  url: string;
  /** Style of the Share button. */
  shareClass: string;
  /** Style of the WhatsApp link shown where there is no share sheet. */
  whatsappClass: string;
  /** Called if the share sheet fails to open, so the caller can copy the link. */
  onFallback?: () => void;
}) {
  const canShare = useSyncExternalStore(subscribe, canNativeShare, () => false);
  if (canShare) {
    return (
      <button
        type="button"
        className={shareClass}
        onClick={async () => {
          if (!(await nativeShare(title, text, url))) onFallback?.();
        }}
      >
        Share
      </button>
    );
  }
  return (
    <a className={whatsappClass} href={whatsappHref(text, url)} target="_blank" rel="noopener">
      Send on WhatsApp
    </a>
  );
}
