"use client";

import { useState } from "react";
import { SITE_URL } from "@/lib/site";
import { useTr } from "@/lib/tools/useTr";

type Bridge = (o: { title: string; text: string; url: string }) => Promise<void>;

/**
 * "Share" for a tool page, used by the website and the Android app.
 * On a phone it opens the normal share sheet (WhatsApp, Telegram, Messages and so on). Where there is no share sheet,
 * such as a desktop browser, it opens a small menu with WhatsApp, Telegram and Copy link instead.
 */
export default function ShareToolButton({ toolId, toolName, onDark = false }: { toolId: string; toolName: string; onDark?: boolean }) {
  const tr = useTr();
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = `${SITE_URL}/tool/${toolId}`;
  const text = tr("Try the free {name} on TopperShelf:", { name: toolName });

  async function share() {
    const bridge = (window as unknown as { __tsShare?: Bridge }).__tsShare; // set by the Android app
    try {
      if (bridge) return await bridge({ title: toolName, text, url });
      if (navigator.share) return await navigator.share({ title: toolName, text, url });
    } catch {
      return; // the person closed the share sheet
    }
    setMenu((open) => !open);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the person can still use the other options */
    }
  }

  const encoded = { text: encodeURIComponent(`${text} ${url}`), url: encodeURIComponent(url), message: encodeURIComponent(text) };
  const item = "block w-full cursor-pointer rounded-lg border-0 bg-transparent px-3 py-2.5 text-left text-sm font-semibold text-navy no-underline hover:bg-blue-soft";

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={share}
        aria-expanded={menu}
        className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition active:translate-y-px ${
          onDark ? "border-white/40 bg-white/10 text-white hover:bg-white/20" : "border-line bg-white text-navy hover:border-blue hover:bg-blue-soft"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
        {tr("Share")}
      </button>
      {menu && (
        <div role="menu" className="absolute right-0 top-full z-30 mt-2 w-48 rounded-xl border border-line bg-white p-1.5 shadow-float sm:left-0 sm:right-auto">
          <a role="menuitem" className={item} href={`https://wa.me/?text=${encoded.text}`} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <a role="menuitem" className={item} href={`https://t.me/share/url?url=${encoded.url}&text=${encoded.message}`} target="_blank" rel="noopener noreferrer">
            Telegram
          </a>
          <button role="menuitem" type="button" className={item} onClick={copy}>
            {copied ? tr("Link copied") : tr("Copy link")}
          </button>
        </div>
      )}
    </span>
  );
}
