/*
 * PDF work for the PDF Toolkit, entirely in the browser. pdf-lib builds and edits PDFs; pdf.js draws pages to images
 * (for compressing and PDF → JPG). Both are imported on demand, so they only download when a PDF action runs.
 */

export async function loadPdfLib() {
  return import("pdf-lib");
}

export async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  }
  return pdfjs;
}

/**
 * "1-3, 5, 8-" → zero-based page indexes, in the order written, without duplicates.
 * Throws a readable message for anything outside 1..pageCount.
 */
export function parseRanges(input: string, pageCount: number): number[] {
  const out: number[] = [];
  const seen = new Set<number>();
  const parts = input.split(",").map((p) => p.trim()).filter(Boolean);
  if (!parts.length) throw new Error("Type the pages you want, like 1-3, 5.");
  for (const part of parts) {
    const match = /^(\d+)?\s*(?:-\s*(\d+)?)?$/.exec(part);
    if (!match || (!match[1] && !match[2])) throw new Error(`“${part}” isn't a page or a range like 2-5.`);
    const isRange = part.includes("-");
    const start = match[1] ? Number(match[1]) : 1;
    const end = isRange ? (match[2] ? Number(match[2]) : pageCount) : start;
    if (start < 1 || end > pageCount || start > end) {
      throw new Error(`Pages go from 1 to ${pageCount}; “${part}” is outside that.`);
    }
    for (let page = start; page <= end; page++) {
      if (!seen.has(page)) {
        seen.add(page);
        out.push(page - 1);
      }
    }
  }
  return out;
}

const bytesOf = async (file: File) => new Uint8Array(await file.arrayBuffer());

export class PdfError extends Error {}

async function openPdf(file: File) {
  const { PDFDocument } = await loadPdfLib();
  try {
    return await PDFDocument.load(await bytesOf(file), { updateMetadata: false });
  } catch (error) {
    if (String(error).toLowerCase().includes("encrypt")) {
      throw new PdfError(`“${file.name}” is password-protected. Remove the password first, then try again.`);
    }
    throw new PdfError(`“${file.name}” couldn't be read as a PDF.`);
  }
}

export async function pageCountOf(file: File) {
  return (await openPdf(file)).getPageCount();
}

const toBlob = (bytes: Uint8Array) => new Blob([bytes as BlobPart], { type: "application/pdf" });

export async function mergePdfs(files: File[]) {
  const { PDFDocument } = await loadPdfLib();
  const merged = await PDFDocument.create();
  for (const file of files) {
    const doc = await openPdf(file);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  return toBlob(await merged.save({ useObjectStreams: true }));
}

export async function extractPages(file: File, indexes: number[]) {
  const { PDFDocument } = await loadPdfLib();
  const source = await openPdf(file);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(source, indexes);
  pages.forEach((page) => out.addPage(page));
  return toBlob(await out.save({ useObjectStreams: true }));
}

export async function splitEveryPage(file: File) {
  const { PDFDocument } = await loadPdfLib();
  const source = await openPdf(file);
  const blobs: Blob[] = [];
  for (const index of source.getPageIndices()) {
    const out = await PDFDocument.create();
    const [page] = await out.copyPages(source, [index]);
    out.addPage(page);
    blobs.push(toBlob(await out.save({ useObjectStreams: true })));
  }
  return blobs;
}

/** A4 portrait, in PDF points. Each image is centred on its own page with a small margin, never upscaled. */
const A4 = { width: 595.28, height: 841.89, margin: 24 };

async function imageAsJpegOrPng(file: File): Promise<{ bytes: Uint8Array; type: "jpg" | "png" }> {
  if (file.type === "image/jpeg") return { bytes: await bytesOf(file), type: "jpg" };
  if (file.type === "image/png") return { bytes: await bytesOf(file), type: "png" };
  // WebP and others: redraw to JPEG, which every PDF reader supports.
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92));
  return { bytes: new Uint8Array(await blob.arrayBuffer()), type: "jpg" };
}

/** Adds one A4 page with the image centred on it (small margin, never upscaled). */
async function addImagePage(doc: import("pdf-lib").PDFDocument, file: File) {
  let image;
  try {
    const { bytes, type } = await imageAsJpegOrPng(file);
    image = type === "jpg" ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
  } catch {
    throw new PdfError(`“${file.name}” couldn't be read as an image.`);
  }
  const page = doc.addPage([A4.width, A4.height]);
  const maxW = A4.width - A4.margin * 2;
  const maxH = A4.height - A4.margin * 2;
  const scale = Math.min(maxW / image.width, maxH / image.height, 1);
  const w = image.width * scale;
  const h = image.height * scale;
  page.drawImage(image, { x: (A4.width - w) / 2, y: (A4.height - h) / 2, width: w, height: h });
  return page;
}

export async function imagesToPdf(files: File[]) {
  const { PDFDocument } = await loadPdfLib();
  const doc = await PDFDocument.create();
  for (const file of files) await addImagePage(doc, file);
  return toBlob(await doc.save({ useObjectStreams: true }));
}

async function renderPages(file: File, scale: number, onPage: (canvas: HTMLCanvasElement, index: number, total: number) => Promise<void>) {
  const pdfjs = await loadPdfJs();
  const task = pdfjs.getDocument({ data: await bytesOf(file) });
  let pdf;
  try {
    pdf = await task.promise;
  } catch (error) {
    if (String((error as Error)?.name).includes("Password")) {
      throw new PdfError(`“${file.name}” is password-protected. Remove the password first, then try again.`);
    }
    throw new PdfError(`“${file.name}” couldn't be read as a PDF.`);
  }
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    await onPage(canvas, i - 1, pdf.numPages);
    page.cleanup();
  }
  await task.destroy();
}

const canvasToJpeg = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", quality));

/**
 * Compresses by turning every page into a JPEG at the chosen strength. Works well for scanned documents and
 * photo-heavy PDFs; text becomes part of the picture, so it can no longer be selected or searched.
 */
export async function compressPdf(file: File, level: "light" | "strong", onProgress: (done: number, total: number) => void) {
  const { PDFDocument } = await loadPdfLib();
  const settings = level === "light" ? { scale: 1.5, quality: 0.72 } : { scale: 1.1, quality: 0.5 };
  const out = await PDFDocument.create();
  await renderPages(file, settings.scale, async (canvas, index, total) => {
    const jpeg = await canvasToJpeg(canvas, settings.quality);
    const image = await out.embedJpg(new Uint8Array(await jpeg.arrayBuffer()));
    // Keep the original page size in points: the canvas was drawn at `scale` × points.
    const page = out.addPage([canvas.width / settings.scale, canvas.height / settings.scale]);
    page.drawImage(image, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
    onProgress(index + 1, total);
  });
  return toBlob(await out.save({ useObjectStreams: true }));
}

export async function pdfToImages(file: File, onProgress: (done: number, total: number) => void) {
  const images: Blob[] = [];
  await renderPages(file, 2, async (canvas, index, total) => {
    images.push(await canvasToJpeg(canvas, 0.9));
    onProgress(index + 1, total);
  });
  return images;
}

/* ---------------- Edit PDF: arrange, rotate, delete and add pages ---------------- */

/** One page of the edited PDF, in its final position. `rotate` is extra clockwise turning, in multiples of 90. */
export type EditPage =
  | { kind: "pdf"; source: number; index: number; rotate: number }
  | { kind: "blank"; width: number; height: number; rotate: number }
  | { kind: "image"; file: File; rotate: number };

export type Thumb = { url: string; landscape: boolean };

/** Small previews of every page (JPEG data URLs, about 240 px wide). */
export async function pageThumbnails(file: File, onProgress?: (done: number, total: number) => void) {
  const thumbs: Thumb[] = [];
  await renderPages(file, 0.4, async (canvas, index, total) => {
    thumbs.push({ url: canvas.toDataURL("image/jpeg", 0.7), landscape: canvas.width > canvas.height });
    onProgress?.(index + 1, total);
  });
  return thumbs;
}

/** Page size of a PDF's first page, so an added blank page can match the document. */
export async function firstPageSize(file: File) {
  const doc = await openPdf(file);
  const { width, height } = doc.getPage(0).getSize();
  return { width, height };
}

/**
 * Builds the edited PDF. Pages taken from PDFs are copied as they are (text stays selectable); only their rotation
 * changes if you turned them. Blank and image pages are created fresh.
 */
export async function buildEditedPdf(sources: File[], pages: EditPage[]) {
  const { PDFDocument, degrees } = await loadPdfLib();
  if (!pages.length) throw new PdfError("The PDF needs at least one page.");
  const out = await PDFDocument.create();
  const opened = await Promise.all(sources.map((file) => openPdf(file)));
  for (const item of pages) {
    let page;
    if (item.kind === "pdf") {
      [page] = await out.copyPages(opened[item.source], [item.index]);
      out.addPage(page);
    } else if (item.kind === "blank") {
      page = out.addPage([item.width, item.height]);
    } else {
      page = await addImagePage(out, item.file);
    }
    if (item.rotate) page.setRotation(degrees((page.getRotation().angle + item.rotate) % 360));
  }
  return toBlob(await out.save({ useObjectStreams: true }));
}

/** A small picture of an image file for the page grid. */
export async function imageThumbnail(file: File): Promise<Thumb> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new PdfError(`“${file.name}” couldn't be read as an image.`);
  }
  // Image pages are A4 portrait with the picture centred, so preview them that way.
  const canvas = document.createElement("canvas");
  canvas.width = 238;
  canvas.height = 337;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const margin = 10;
  const scale = Math.min((canvas.width - margin * 2) / bitmap.width, (canvas.height - margin * 2) / bitmap.height, 1);
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  ctx.drawImage(bitmap, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
  bitmap.close();
  return { url: canvas.toDataURL("image/jpeg", 0.75), landscape: false };
}
