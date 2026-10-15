"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

const ZOOMS = [0.75, 1, 1.25, 1.5, 2];
const BASE_MAX_WIDTH = 900; // CSS px: a comfortable reading width on desktop
const SUPPORT_EMAIL = "support@toppershelf.online";

type Size = { w: number; h: number };

/**
 * Burn the reader's email into the page picture itself (not an overlay a browser tool could
 * delete), repeated diagonally so a cropped screenshot still carries it.
 */
function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number, email: string, dpr: number) {
  if (!email) return;
  ctx.save();
  ctx.fillStyle = "#0b1f3a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const size = Math.max(13 * dpr, w / 32);
  ctx.font = `600 ${size}px system-ui, sans-serif`;
  ctx.globalAlpha = 0.11;
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 6);
  const stepX = ctx.measureText(email).width + size * 3;
  const stepY = size * 5;
  const reach = Math.hypot(w, h);
  let row = 0;
  for (let y = -reach; y <= reach; y += stepY, row++) {
    for (let x = -reach; x <= reach; x += stepX) ctx.fillText(email, x + (row % 2 ? stepX / 2 : 0), y);
  }
  ctx.restore();

  // A small line at the foot of every page.
  ctx.save();
  ctx.fillStyle = "#0b1f3a";
  ctx.globalAlpha = 0.45;
  ctx.font = `${10 * dpr}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(`Licensed to ${email} · Toppershelf · Do not share`, w / 2, h - 7 * dpr);
  ctx.restore();
}

export default function PdfViewer({ url, title, email }: { url: string; title: string; email: string }) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [zoomIndex, setZoomIndex] = useState(1);
  const [boxWidth, setBoxWidth] = useState(0);
  const [current, setCurrent] = useState(1);
  const boxRef = useRef<HTMLDivElement>(null);

  // 1. Download the PDF and read the size of every page.
  useEffect(() => {
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        const res = await fetch(url);
        if (!res.ok) throw new Error("download failed");
        const data = new Uint8Array(await res.arrayBuffer());
        const pdf = await pdfjs.getDocument({ data }).promise;
        loaded = pdf;
        if (cancelled) return;
        const list: Size[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const view = (await pdf.getPage(i)).getViewport({ scale: 1 });
          list.push({ w: view.width, h: view.height });
        }
        if (cancelled) return;
        setSizes(list);
        setDoc(pdf);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
      loaded?.destroy();
    };
  }, [url, attempt]);

  // 2. Keep track of how wide the screen area is.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const watcher = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));
    watcher.observe(el);
    return () => watcher.disconnect();
  }, [doc]);

  const pageWidth = Math.round(Math.min(boxWidth, BASE_MAX_WIDTH) * ZOOMS[zoomIndex]);

  // 3. Draw only the pages near the screen, and free the ones that scrolled far away.
  //    (A phone cannot hold fifty full-size pages in memory.)
  useEffect(() => {
    const root = boxRef.current;
    if (!doc || !root || !pageWidth) return;
    const holders = Array.from(root.querySelectorAll<HTMLElement>("[data-page]"));
    const tasks = new Map<number, RenderTask>();
    const drawn = new Set<number>();
    let stopped = false;

    const free = (n: number, canvas: HTMLCanvasElement) => {
      tasks.get(n)?.cancel();
      tasks.delete(n);
      drawn.delete(n);
      canvas.width = 0;
      canvas.height = 0;
    };

    const draw = async (n: number, canvas: HTMLCanvasElement) => {
      if (drawn.has(n)) return;
      drawn.add(n);
      try {
        const page = await doc.getPage(n);
        if (stopped || !drawn.has(n)) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: (pageWidth / base.width) * dpr });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const task = page.render({ canvasContext: ctx, viewport, background: "#ffffff" });
        tasks.set(n, task);
        await task.promise;
        tasks.delete(n);
        if (stopped || !drawn.has(n)) return;
        drawWatermark(ctx, canvas.width, canvas.height, email, dpr);
      } catch (err) {
        if ((err as Error).name !== "RenderingCancelledException") drawn.delete(n); // try again next time
      }
    };

    const watcher = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const holder = entry.target as HTMLElement;
          const canvas = holder.querySelector("canvas");
          if (!canvas) continue;
          const n = Number(holder.dataset.page);
          if (entry.isIntersecting) draw(n, canvas);
          else free(n, canvas);
        }
      },
      { rootMargin: "120% 0px" },
    );
    holders.forEach((h) => watcher.observe(h));

    return () => {
      stopped = true;
      watcher.disconnect();
      tasks.forEach((t) => t.cancel());
      holders.forEach((h) => {
        const canvas = h.querySelector("canvas");
        if (canvas) {
          canvas.width = 0;
          canvas.height = 0;
        }
      });
    };
  }, [doc, sizes, pageWidth, email]);

  // 4. Show which page the student is on.
  useEffect(() => {
    if (!doc) return;
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
  }, [doc, pageWidth]);

  // 5. Discourage saving and printing. (Deterrents only: the watermark is the real protection.)
  useEffect(() => {
    const block = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase())) e.preventDefault();
    };
    window.addEventListener("keydown", block);
    return () => window.removeEventListener("keydown", block);
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-line bg-white p-6 text-center">
        <p className="m-0 font-semibold text-navy">We could not open this PDF.</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Check your internet and try again. If it keeps happening, email {SUPPORT_EMAIL}.
        </p>
        <button
          type="button"
          className="mt-4 cursor-pointer rounded-full border-0 bg-navy px-5 py-2 text-sm font-semibold text-white"
          onClick={() => {
            setError(false);
            setAttempt((n) => n + 1);
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!doc) {
    return (
      <p className="flex items-center gap-3 py-10 text-muted" role="status">
        <span
          aria-hidden
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
        Opening your PDF…
      </p>
    );
  }

  const btn =
    "grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-line bg-white text-lg leading-none text-navy disabled:cursor-default disabled:opacity-40";

  return (
    <>
      <style>{`@media print{.reader-root{display:none!important}.reader-print-note{display:block!important}}`}</style>
      <p className="reader-print-note hidden p-6 text-center">Printing is turned off for this PDF.</p>
      <div
        className="reader-root select-none [-webkit-touch-callout:none]"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="sticky top-0 z-20 -mx-3 border-b border-line bg-white/95 px-3 py-2 backdrop-blur">
          <div className="flex items-center gap-3">
            <Link href="/library" className="shrink-0 text-sm font-semibold text-navy no-underline">
              ‹ Library
            </Link>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">{title}</span>
            <span className="shrink-0 text-sm tabular-nums text-muted" aria-live="polite">
              {current} / {sizes.length}
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
          <p className="m-0 mt-1 truncate text-xs text-muted">This copy is licensed to {email} only.</p>
        </div>

        <div ref={boxRef} className="w-full overflow-x-auto pb-10 pt-4">
          <div className="mx-auto flex flex-col gap-4" style={{ width: pageWidth || undefined }}>
            {sizes.map((s, i) => (
              <div
                key={i}
                data-page={i + 1}
                className="relative overflow-hidden border border-line bg-white shadow-sm"
                style={{ width: pageWidth, height: pageWidth ? (pageWidth * s.h) / s.w : 0 }}
              >
                <canvas draggable={false} className="absolute left-0 top-0 block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
