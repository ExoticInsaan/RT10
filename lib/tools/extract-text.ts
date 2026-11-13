// Reads text out of a PDF or photos, on the visitor's device. Text PDFs are read directly; scanned pages and photos go
// through OCR (Tesseract). Nothing is uploaded. Libraries load only when this is used.
import { loadPdfJs } from "@/components/tools/shelf/pdf-engine";

export type OcrLang = "eng" | "eng+hin";
export type Progress = (message: string, fraction: number) => void;

export const MAX_PDF_MB = 40;
export const MAX_PHOTO_MB = 15;
export const MAX_PHOTOS = 12;
export const MAX_OCR_PAGES = 40;

export class ExtractError extends Error {}

type Worker = import("tesseract.js").Worker;

async function ocrWorker(lang: OcrLang, onProgress: Progress, label: string): Promise<Worker> {
  const { createWorker } = await import("tesseract.js");
  onProgress("Getting the text reader ready (first time only)…", 0);
  return createWorker(lang, 1, {
    logger: (m) => {
      if (m.status === "recognizing text") onProgress(label, m.progress);
    },
  });
}

export async function extractFromPdf(file: File, lang: OcrLang, onProgress: Progress): Promise<string> {
  if (file.size > MAX_PDF_MB * 1024 * 1024) throw new ExtractError(`This PDF is larger than ${MAX_PDF_MB} MB. Split it into smaller parts first.`);
  const pdfjs = await loadPdfJs();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  let pdf;
  try {
    pdf = await task.promise;
  } catch (error) {
    if (String((error as Error)?.name).includes("Password")) throw new ExtractError("This PDF is password-protected. Remove the password first, then try again.");
    throw new ExtractError("This file could not be read as a PDF.");
  }
  const pages: string[] = [];
  let worker: Worker | null = null;
  let ocrPages = 0;
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress(`Reading page ${i} of ${pdf.numPages}…`, (i - 1) / pdf.numPages);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      let text = content.items.map((item) => ("str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "")).join("");
      if (text.replace(/\s/g, "").length < 20) {
        // A scanned page: draw it and read it with OCR.
        if (++ocrPages > MAX_OCR_PAGES) throw new ExtractError(`This scanned PDF has more than ${MAX_OCR_PAGES} pages to read. Upload fewer pages at a time.`);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        worker ??= await ocrWorker(lang, onProgress, `Reading scanned page ${i} of ${pdf.numPages}…`);
        text = (await worker.recognize(canvas)).data.text;
      }
      pages.push(text);
      page.cleanup();
    }
  } finally {
    await worker?.terminate();
    await task.destroy();
  }
  return pages.join("\n\n");
}

export async function extractFromPhotos(files: File[], lang: OcrLang, onProgress: Progress): Promise<string> {
  if (files.length > MAX_PHOTOS) throw new ExtractError(`Choose up to ${MAX_PHOTOS} photos at a time.`);
  for (const f of files) {
    if (!f.type.startsWith("image/")) throw new ExtractError(`“${f.name}” is not a photo.`);
    if (f.size > MAX_PHOTO_MB * 1024 * 1024) throw new ExtractError(`“${f.name}” is larger than ${MAX_PHOTO_MB} MB.`);
  }
  const results: string[] = [];
  let worker: Worker | null = null;
  try {
    for (let i = 0; i < files.length; i++) {
      const label = `Reading photo ${i + 1} of ${files.length}…`;
      worker ??= await ocrWorker(lang, (m, f) => onProgress(m, f), label);
      onProgress(label, i / files.length);
      results.push((await worker.recognize(files[i])).data.text);
    }
  } finally {
    await worker?.terminate();
  }
  return results.join("\n\n");
}
