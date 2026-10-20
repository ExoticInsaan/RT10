"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const ZOOMS = [0.75, 1, 1.25, 1.5, 2];
const BASE_MAX_WIDTH = 900; // CSS px: a comfortable reading width on desktop
const WIDTH_STEPS = [640, 960, 1280, 1920]; // picture widths the server will draw

export type PageSize = { w: number; h: number };

/**
 * Shows a PDF as page pictures. The PDF file itself never reaches this browser: the server
 * draws each page with the reader's email burned in. Nothing here can offer a download.
 *
 * The extra protections below (hide when the window loses focus, print and save blocked,
 * no right-click, no drag) make casual copying hard. They cannot stop a phone camera or the
 * phone's own screenshot button: the burned-in email is what makes any leak traceable.
 */
export default function PageViewer({
  slug,
  title,
  email,
  pages,
}: {
  slug: string;
  title: string;
  email: string;
  pages: PageSize[];
}) {
  const [zoomIndex, setZoomIndex] = useState(1);
  const [boxWidth, setBoxWidth] = useState(0);
  const [current, setCurrent] = useState(1);
  const [near, setNear] = useState<ReadonlySet<number>>(new Set());
  const [broken, setBroken] = useState<ReadonlySet<number>>(new Set());
  const [retries, setRetries] = useState<Record<number, number>>({});
  const [covered, setCovered] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // How wide is the reading area?
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const watcher = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));
    watcher.observe(el);
    return () => watcher.disconnect();
  }, []);

  const pageWidth = Math.round(Math.min(boxWidth, BASE_MAX_WIDTH) * ZOOMS[zoomIndex]);
  const dpr = typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  const wanted = pageWidth * dpr;
  const pictureWidth = WIDTH_STEPS.find((w) => w >= wanted) ?? WIDTH_STEPS[WIDTH_STEPS.length - 1];

  // Load only the pages near the screen; drop the ones far away (phones have little memory).
  useEffect(() => {
    const root = boxRef.current;
    if (!root || !pageWidth) return;
    const watcher = new IntersectionObserver(
      (entries) => {
        setNear((previous) => {
          const next = new Set(previous);
          for (const entry of entries) {
            const n = Number((entry.target as HTMLElement).dataset.page);
            if (entry.isIntersecting) next.add(n);
            else next.delete(n);
          }
          return next;
        });
      },
      { rootMargin: "150% 0px" },
    );
    root.querySelectorAll("[data-page]").forEach((el) => watcher.observe(el));
    return () => watcher.disconnect();
  }, [pageWidth, pages.length]);

  // Which page is the student on?
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const holders = boxRef.current?.querySelectorAll<HTMLElement>("[data-page]");
        if (!holders) return;
        const line = window.innerHeight * 0.4;
        let found = 1;
        holders.forEach((h, i) => {
          if (h.getBoundingClientRect().top <= line) found = i + 1;
        });
        setCurrent(found);
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, [pageWidth]);

  // Hide the pages whenever the window is not in front. Screenshot tools usually take focus
  // first, so they find a blank screen. Reading resumes as soon as the window is back.
  useEffect(() => {
    const check = () => setCovered(document.hidden || !document.hasFocus());
    const hide = () => setCovered(true);
    window.addEventListener("blur", hide);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    const first = window.setTimeout(check, 0);
    return () => {
      window.clearTimeout(first);
      window.removeEventListener("blur", hide);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  // Save and print are blocked. The Print Screen key blanks the page and replaces the clipboard.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase())) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== "PrintScreen") return;
      navigator.clipboard?.writeText("Screenshots are not allowed on Toppershelf.").catch(() => {});
      setCovered(true);
      window.setTimeout(() => setCovered(document.hidden || !document.hasFocus()), 1500);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const btn =
    "grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-line bg-white text-lg leading-none text-navy disabled:cursor-default disabled:opacity-40";

  return (
    <>
      <style>{`@media print{.reader-root{display:none!important}.reader-print-note{display:block!important}}`}</style>
      <p className="reader-print-note hidden p-6 text-center">Printing is turned off for this PDF.</p>

      <div
        className="reader-root select-none [-webkit-touch-callout:none]"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        <div className="sticky top-0 z-20 -mx-3 border-b border-line bg-white/95 px-3 py-2 backdrop-blur">
          <div className="flex items-center gap-3">
            <Link href="/library" className="shrink-0 text-sm font-semibold text-navy no-underline">
              ‹ Library
            </Link>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">{title}</span>
            <span className="shrink-0 text-sm tabular-nums text-muted" aria-live="polite">
              {current} / {pages.length}
            </span>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                className={btn}
                aria-label="Zoom out"
                disabled={zoomIndex === 0}
                onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
              >
                −
              </button>
              <span className="w-10 text-center text-xs tabular-nums text-muted">
                {Math.round(ZOOMS[zoomIndex] * 100)}%
              </span>
              <button
                type="button"
                className={btn}
                aria-label="Zoom in"
                disabled={zoomIndex === ZOOMS.length - 1}
                onClick={() => setZoomIndex((i) => Math.min(ZOOMS.length - 1, i + 1))}
              >
                +
              </button>
            </div>
          </div>
          {email ? <p className="m-0 mt-1 truncate text-xs text-muted">This copy is licensed to {email} only.</p> : null}
        </div>

        <div ref={boxRef} className="w-full overflow-x-auto pb-10 pt-4">
          <div className="mx-auto flex flex-col gap-4" style={{ width: pageWidth || undefined }}>
            {pages.map((size, i) => {
              const n = i + 1;
              const src = near.has(n)
                ? `/api/read/${encodeURIComponent(slug)}/page/${n}?w=${pictureWidth}${retries[n] ? `&r=${retries[n]}` : ""}`
                : undefined;
              return (
                <div
                  key={n}
                  data-page={n}
                  className="relative overflow-hidden border border-line bg-white shadow-sm"
                  style={{ width: pageWidth, height: pageWidth ? (pageWidth * size.h) / size.w : 0 }}
                >
                  <span className="absolute inset-0 grid place-items-center text-xs text-muted">
                    Page {n}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    draggable={false}
                    className={`pointer-events-none absolute inset-0 h-full w-full select-none ${broken.has(n) ? "invisible" : ""}`}
                    onLoad={() =>
                      setBroken((b) => {
                        if (!b.has(n)) return b;
                        const next = new Set(b);
                        next.delete(n);
                        return next;
                      })
                    }
                    onError={() => src && setBroken((b) => new Set(b).add(n))}
                  />
                  {broken.has(n) && (
                    <div className="absolute inset-0 flex justify-center bg-white/90 pt-24 text-center">
                      <div>
                        <p className="m-0 text-sm text-muted">This page did not load.</p>
                        <button
                          type="button"
                          className="mt-2 cursor-pointer rounded-full border-0 bg-navy px-4 py-1.5 text-sm font-semibold text-white"
                          onClick={() => setRetries((r) => ({ ...r, [n]: (r[n] ?? 0) + 1 }))}
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {covered && (
        <div
          className="fixed inset-0 z-50 grid cursor-pointer place-items-center bg-navy p-6 text-center text-white"
          role="alert"
          onClick={() => setCovered(document.hidden || !document.hasFocus())}
        >
          <div>
            <p className="m-0 text-xl font-semibold">Reading paused</p>
            <p className="mx-auto mb-0 mt-2 max-w-sm text-sm opacity-80">
              The pages are hidden while this window is not in front. Click here to continue.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
