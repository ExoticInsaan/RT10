import { PDFDocument } from "pdf-lib";

// The shop stores and reads every resource as a PDF (the bucket only accepts PDFs, and the reader
// draws PDF pages). So when an admin chooses pictures instead of a PDF, the browser turns them
// into one PDF first (one picture per page, in the order chosen) and uploads that.

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_PDF_MB = 50;
export const MAX_PICTURE_MB = 12;
export const MAX_PICTURES = 150;

export function isPdfFile(f: File) {
  return f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
}

export function isPictureFile(f: File) {
  return IMAGE_TYPES.includes(f.type);
}

/** What is wrong with the chosen file(s), or null when they are fine. */
export function checkDocumentFiles(files: File[]): string | null {
  if (files.length === 0) return null;
  const pdfs = files.filter(isPdfFile);
  if (pdfs.length > 0 && files.length > 1) return "Choose either one PDF, or pictures only. They cannot be mixed.";
  if (pdfs.length === 1) {
    return pdfs[0].size > MAX_PDF_MB * 1024 * 1024 ? `"${pdfs[0].name}" is larger than ${MAX_PDF_MB} MB.` : null;
  }
  if (files.length > MAX_PICTURES) return `Use at most ${MAX_PICTURES} pictures in one file.`;
  for (const f of files) {
    if (!isPictureFile(f)) return `"${f.name}" is not a PDF, PNG, JPG or WebP file.`;
    if (f.size > MAX_PICTURE_MB * 1024 * 1024) return `"${f.name}" is larger than ${MAX_PICTURE_MB} MB.`;
  }
  return null;
}

const MAX_EDGE = 2200; // px, longest side of a picture inside the PDF
const PAGE_WIDTH = 595; // PDF points (A4 width); each page is as tall as its picture needs

async function pictureToJpeg(file: File): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.fillStyle = "#ffffff"; // white behind see-through areas
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (!blob) throw new Error("could not encode");
    return { bytes: new Uint8Array(await blob.arrayBuffer()), width: canvas.width, height: canvas.height };
  } finally {
    bitmap.close();
  }
}

/** One PDF file ready to upload: the PDF itself, or all the pictures joined into one PDF. */
export async function documentToPdf(files: File[]): Promise<File> {
  if (files.length === 1 && isPdfFile(files[0])) return files[0];
  const pdf = await PDFDocument.create();
  for (const file of files) {
    const { bytes, width, height } = await pictureToJpeg(file);
    const image = await pdf.embedJpg(bytes);
    const pageHeight = (PAGE_WIDTH * height) / width;
    const page = pdf.addPage([PAGE_WIDTH, pageHeight]);
    page.drawImage(image, { x: 0, y: 0, width: PAGE_WIDTH, height: pageHeight });
  }
  const out = await pdf.save();
  const name = `${files[0].name.replace(/\.[^.]+$/, "") || "document"}.pdf`;
  return new File([out as BlobPart], name, { type: "application/pdf" });
}
