import path from "node:path";
import { GlobalFonts } from "@napi-rs/canvas";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { createAdminClient } from "@/lib/supabase/admin";

// Turns one PDF page into a watermarked picture. The original PDF stays on the server:
// the browser only ever receives pictures with the reader's email already burned in.

export type PageSize = { w: number; h: number };
type Loaded = { doc: PDFDocumentProxy; sizes: PageSize[] };

const WATERMARK_FONT = "WM";
let fontReady = false;
function ensureFont() {
  if (fontReady) return;
  GlobalFonts.registerFromPath(path.join(process.cwd(), "lib/fonts/DejaVuSans-Bold.ttf"), WATERMARK_FONT);
  fontReady = true;
}

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;
function loadPdfjs() {
  pdfjsPromise ??= (async () => {
    // Handing pdf.js its worker directly avoids it looking for the file by path at run time,
    // which breaks on serverless hosts.
    const worker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
    (globalThis as unknown as { pdfjsWorker: unknown }).pdfjsWorker = worker;
    return (await import("pdfjs-dist/legacy/build/pdf.mjs")) as unknown as typeof import("pdfjs-dist");
  })();
  return pdfjsPromise;
}

// ---- Keep a few opened PDFs in memory so each page request is quick ---------------------------
const MAX_DOCS = 3;
const KEEP_MS = 10 * 60_000;
const opened = new Map<string, { at: number; loading: Promise<Loaded> }>();

async function open(filePath: string): Promise<Loaded> {
  const { data, error } = await createAdminClient().storage.from("notes").download(filePath);
  if (error || !data) throw new Error(`download failed: ${error?.message ?? "no data"}`);
  const bytes = new Uint8Array(await data.arrayBuffer());
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({
    data: bytes,
    isEvalSupported: false,
    standardFontDataUrl: path.join(process.cwd(), "node_modules/pdfjs-dist/standard_fonts/") + path.sep,
  }).promise;
  const sizes: PageSize[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const v = (await doc.getPage(i)).getViewport({ scale: 1 });
    sizes.push({ w: v.width, h: v.height });
  }
  return { doc, sizes };
}

// Forget the in-memory copy of a PDF (used when an admin has replaced the file).
export function forgetPdf(filePath: string) {
  const entry = opened.get(filePath);
  if (!entry) return;
  opened.delete(filePath);
  entry.loading.then((l) => l.doc.destroy()).catch(() => {});
}

export async function getPdf(filePath: string): Promise<Loaded> {
  const now = Date.now();
  for (const [key, entry] of opened) {
    if (now - entry.at > KEEP_MS || opened.size > MAX_DOCS) {
      opened.delete(key);
      entry.loading.then((l) => l.doc.destroy()).catch(() => {});
    }
  }
  let entry = opened.get(filePath);
  if (!entry) {
    entry = { at: now, loading: open(filePath) };
    opened.set(filePath, entry);
    entry.loading.catch(() => opened.delete(filePath)); // do not remember failures
  }
  entry.at = now;
  return entry.loading;
}

// ---- Draw at most two pages at a time (each one uses real memory and CPU) ---------------------
let running = 0;
const waiting: (() => void)[] = [];
async function slot<T>(work: () => Promise<T>): Promise<T> {
  if (running >= 2) await new Promise<void>((resolve) => waiting.push(resolve));
  running++;
  try {
    return await work();
  } finally {
    running--;
    waiting.shift()?.();
  }
}

type Ctx = {
  fillStyle: string | CanvasGradient | CanvasPattern;
  globalAlpha: number;
  font: string;
  textAlign: string;
  textBaseline: string;
  save(): void;
  restore(): void;
  translate(x: number, y: number): void;
  rotate(a: number): void;
  fillText(t: string, x: number, y: number): void;
  measureText(t: string): { width: number };
};

/** Email repeated diagonally over the page, plus a small line at the foot. Part of the picture. */
function drawWatermark(ctx: Ctx, w: number, h: number, email: string) {
  if (!email) return;
  const unit = w / 900; // everything scales with the picture width

  ctx.save();
  ctx.fillStyle = "#0b1f3a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const size = Math.max(13 * unit, w / 32);
  ctx.font = `${size}px ${WATERMARK_FONT}`;
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

  ctx.save();
  ctx.fillStyle = "#0b1f3a";
  ctx.globalAlpha = 0.45;
  ctx.font = `${10 * unit}px ${WATERMARK_FONT}`;
  ctx.textAlign = "center";
  ctx.fillText(`Licensed to ${email} · Toppershelf · Do not share`, w / 2, h - 7 * unit);
  ctx.restore();
}

/** Picture widths we are willing to draw. Anything else is rounded up to one of these. */
export const WIDTHS = [640, 960, 1280, 1920];
export function pickWidth(wanted: number) {
  return WIDTHS.find((w) => w >= wanted) ?? WIDTHS[WIDTHS.length - 1];
}

export async function renderPage(
  filePath: string,
  pageNumber: number,
  width: number,
  email: string,
): Promise<Buffer | null> {
  ensureFont();
  const { doc } = await getPdf(filePath);
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > doc.numPages) return null;

  return slot(async () => {
    const page = await doc.getPage(pageNumber);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: width / base.width });
    const factory = (doc as unknown as {
      canvasFactory: {
        create(w: number, h: number): { canvas: { width: number; height: number; toBuffer(m: string, q?: number): Buffer }; context: Ctx };
        destroy(c: unknown): void;
      };
    }).canvasFactory;
    const made = factory.create(Math.ceil(viewport.width), Math.ceil(viewport.height));
    try {
      made.context.fillStyle = "#ffffff";
      (made.context as unknown as CanvasRenderingContext2D).fillRect(0, 0, made.canvas.width, made.canvas.height);
      await page.render({
        canvasContext: made.context as unknown as CanvasRenderingContext2D,
        viewport,
      }).promise;
      drawWatermark(made.context, made.canvas.width, made.canvas.height, email);
      return made.canvas.toBuffer("image/webp", 82);
    } finally {
      page.cleanup();
      factory.destroy(made);
    }
  });
}
