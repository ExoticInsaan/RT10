"use client";

import { useState } from "react";
import ToolIcon from "@/components/tools/ToolIcon";
import { Button } from "@/components/tools/ui";
import { DropZone, Field, Hint, Segmented, downloadBlob, formatBytes, inputClass, renameFile } from "@/components/tools/kit";
import PdfEditor from "./PdfEditor";
import PdfModeCards, { ModeIcon } from "./PdfModeCards";

type Mode = "merge" | "compress" | "to-pdf" | "edit" | "split" | "to-images";
type Output = { name: string; blob: Blob };

const MAX_BYTES = 150 * 1024 * 1024;
const modes: { value: Mode; label: string; intro: string }[] = [
  { value: "merge", label: "Merge", intro: "Join several PDFs into one, in the order you choose." },
  { value: "compress", label: "Compress", intro: "Shrink a heavy PDF, such as a scanned document, to upload or email." },
  { value: "to-pdf", label: "Images → PDF", intro: "Turn photos or scans into one PDF, one image per page." },
  { value: "edit", label: "Edit PDF", intro: "Add pages, photos or pages from another PDF, and remove, turn or reorder pages." },
  { value: "split", label: "Split", intro: "Pull out the pages you need, or save every page as its own PDF." },
  { value: "to-images", label: "PDF → JPG", intro: "Save every page of a PDF as a JPG image." },
];

const engine = () => import("./pdf-engine");

export default function PdfToolkit() {
  const [mode, setMode] = useState<Mode>("merge");
  // Phones and tablets start on the grid of cards; desktop always shows the switch and the tool.
  const [picked, setPicked] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [ranges, setRanges] = useState("");
  const [splitHow, setSplitHow] = useState<"pick" | "every">("pick");
  const [level, setLevel] = useState<"light" | "strong">("light");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [outputs, setOutputs] = useState<Output[]>([]);

  const wantsImages = mode === "to-pdf";
  const multiple = mode === "merge" || mode === "to-pdf";
  const current = modes.find((m) => m.value === mode)!;

  function reset(next: Mode) {
    setMode(next);
    setFiles([]);
    setPageCount(null);
    setRanges("");
    setOutputs([]);
    setError("");
  }

  async function add(chosen: File[]) {
    setError("");
    setOutputs([]);
    const tooBig = chosen.find((f) => f.size > MAX_BYTES);
    if (tooBig) return setError(`“${tooBig.name}” is over 150 MB, which is too large to handle in a browser.`);
    const ok = chosen.filter((f) => (wantsImages ? /^image\/(jpeg|png|webp)$/.test(f.type) : f.type === "application/pdf" || /\.pdf$/i.test(f.name)));
    if (ok.length < chosen.length) {
      setError(wantsImages ? "Only JPG, PNG and WebP images can go into a PDF." : "Only PDF files work here.");
    }
    if (!ok.length) return;
    const next = multiple ? [...files, ...ok].slice(0, 50) : ok.slice(0, 1);
    setFiles(next);
    if (mode === "split") {
      try {
        const { pageCountOf } = await engine();
        setPageCount(await pageCountOf(next[0]));
      } catch (e) {
        setFiles([]);
        setError((e as Error).message);
      }
    }
  }

  function move(index: number, by: number) {
    const target = index + by;
    if (target < 0 || target >= files.length) return;
    const next = [...files];
    [next[index], next[target]] = [next[target], next[index]];
    setFiles(next);
    setOutputs([]);
  }

  async function run() {
    setError("");
    setOutputs([]);
    const pdf = await engine();
    try {
      if (mode === "merge") {
        if (files.length < 2) return setError("Add at least two PDFs to merge.");
        setBusy("Merging…");
        setOutputs([{ name: "merged.pdf", blob: await pdf.mergePdfs(files) }]);
      } else if (mode === "split") {
        const file = files[0];
        if (splitHow === "every") {
          setBusy("Splitting…");
          const blobs = await pdf.splitEveryPage(file);
          setOutputs(blobs.map((blob, i) => ({ name: renameFile(file.name, `-page-${i + 1}`, "pdf"), blob })));
        } else {
          const indexes = pdf.parseRanges(ranges, pageCount ?? 0);
          setBusy("Extracting pages…");
          setOutputs([{ name: renameFile(file.name, "-pages", "pdf"), blob: await pdf.extractPages(file, indexes) }]);
        }
      } else if (mode === "compress") {
        const file = files[0];
        setBusy("Compressing…");
        const blob = await pdf.compressPdf(file, level, (done, total) => setBusy(`Compressing page ${done} of ${total}…`));
        setOutputs([{ name: renameFile(file.name, "-compressed", "pdf"), blob }]);
      } else if (mode === "to-pdf") {
        if (!files.length) return;
        setBusy("Making your PDF…");
        setOutputs([{ name: files.length === 1 ? renameFile(files[0].name, "", "pdf") : "images.pdf", blob: await pdf.imagesToPdf(files) }]);
      } else {
        const file = files[0];
        setBusy("Saving pages…");
        const images = await pdf.pdfToImages(file, (done, total) => setBusy(`Saving page ${done} of ${total}…`));
        setOutputs(images.map((blob, i) => ({ name: renameFile(file.name, `-page-${i + 1}`, "jpg"), blob })));
      }
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Something went wrong with that file.");
    } finally {
      setBusy(null);
    }
  }

  const original = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      {!picked && (
        <PdfModeCards
          cards={modes.map(({ value, label, intro }) => ({ value, label, intro }))}
          onPick={(value) => {
            reset(value as Mode);
            setPicked(true);
          }}
        />
      )}

      <div className={`grid gap-6 ${picked ? "" : "max-lg:hidden"}`}>
      {picked && (
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setPicked(false)}
            aria-label="Back to all PDF tools"
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-white text-navy"
          >
            <span className="rotate-180">
              <ToolIcon name="arrow" size={18} />
            </span>
          </button>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-soft text-blue-hover">
            <ModeIcon id={mode} size={22} />
          </span>
          <h2 className="m-0 text-lg font-extrabold text-navy">{current.label}</h2>
        </div>
      )}
      <div className="grid gap-2">
        <div className="max-lg:hidden">
          <Segmented label="What do you want to do?" value={mode} onChange={reset} options={modes.map(({ value, label }) => ({ value, label }))} />
        </div>
        <p className="m-0 text-sm text-muted">{current.intro}</p>
      </div>

      {mode === "edit" && <PdfEditor />}

      {mode !== "edit" && (multiple || files.length === 0) && (
        <DropZone
          key={mode}
          accept={wantsImages ? "image/jpeg,image/png,image/webp" : "application/pdf,.pdf"}
          multiple={multiple}
          onFiles={add}
          title={
            files.length && multiple
              ? `Add more ${wantsImages ? "images" : "PDFs"}`
              : `Drop ${multiple ? (wantsImages ? "images" : "PDFs") : "a PDF"} here`
          }
          note="Everything happens on your device. Your files are never uploaded."
        />
      )}

      {files.length > 0 && (
        <ol className="m-0 grid list-none gap-2 p-0">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-red-50 text-xs font-extrabold text-red-600">
                {wantsImages ? "IMG" : "PDF"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-navy">{file.name}</span>
                <span className="block text-xs text-muted">
                  {formatBytes(file.size)}
                  {mode === "split" && pageCount !== null && ` · ${pageCount} page${pageCount === 1 ? "" : "s"}`}
                </span>
              </span>
              {multiple && files.length > 1 && (
                <>
                  <IconButton label={`Move ${file.name} up`} disabled={index === 0} onClick={() => move(index, -1)} rotate="-rotate-90" />
                  <IconButton label={`Move ${file.name} down`} disabled={index === files.length - 1} onClick={() => move(index, 1)} rotate="rotate-90" />
                </>
              )}
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => {
                  setFiles(files.filter((_, i) => i !== index));
                  setOutputs([]);
                  if (!multiple) setPageCount(null);
                }}
                className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-muted hover:bg-surface hover:text-navy"
              >
                <ToolIcon name="close" size={17} />
              </button>
            </li>
          ))}
        </ol>
      )}

      {mode === "split" && files.length > 0 && pageCount !== null && (
        <div className="grid gap-3">
          <Segmented
            label="How to split"
            value={splitHow}
            onChange={setSplitHow}
            options={[
              { value: "pick", label: "Pick pages" },
              { value: "every", label: "Every page separately" },
            ]}
          />
          {splitHow === "pick" && (
            <Field label="Pages to keep" hint={`For example 1-3, 5 or 4- (page 4 to the end). This PDF has ${pageCount} pages.`}>
              <input className={inputClass} value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="e.g. 1-3, 5" />
            </Field>
          )}
        </div>
      )}

      {mode === "compress" && files.length > 0 && (
        <div className="grid gap-2">
          <Segmented
            label="Compression strength"
            value={level}
            onChange={setLevel}
            options={[
              { value: "light", label: "Light: sharper" },
              { value: "strong", label: "Strong: smallest" },
            ]}
          />
          <p className="m-0 text-xs leading-5 text-muted">
            Each page is redrawn as an image, which shrinks scanned and photo-heavy PDFs a lot. Text in the result can&apos;t be
            selected or searched, so keep your original too.
          </p>
        </div>
      )}

      {files.length > 0 && (
        <Button onClick={run} disabled={Boolean(busy) || (mode === "split" && pageCount === null)} className="w-full sm:w-auto sm:justify-self-start">
          {busy ?? actionLabel(mode, files.length)}
        </Button>
      )}

      {error && <Hint error>{error}</Hint>}

      {outputs.length > 0 && (
        <div className="grid gap-3 rounded-2xl bg-blue-soft p-5" aria-live="polite">
          {outputs.length === 1 ? (
            <>
              <p className="m-0 text-sm font-semibold text-muted">Ready</p>
              <p className="m-0 text-3xl font-extrabold tracking-tight text-navy">{formatBytes(outputs[0].blob.size)}</p>
              {mode === "compress" && (
                <p className="m-0 text-sm text-slate-700">
                  {outputs[0].blob.size < original
                    ? `${Math.round((1 - outputs[0].blob.size / original) * 100)}% smaller than the original ${formatBytes(original)}.`
                    : `That's not smaller than the original (${formatBytes(original)}), so this PDF is already well compressed. Keep the original.`}
                </p>
              )}
              <Button className="justify-self-start" onClick={() => downloadBlob(outputs[0].blob, outputs[0].name)}>
                Download {outputs[0].name.endsWith(".pdf") ? "PDF" : "file"}
              </Button>
            </>
          ) : (
            <>
              <p className="m-0 text-sm font-semibold text-navy">
                {outputs.length} files ready. Download the ones you need.
              </p>
              <ul className="m-0 grid max-h-80 list-none gap-2 overflow-y-auto p-0">
                {outputs.map((output) => (
                  <li key={output.name} className="flex items-center gap-3 rounded-xl bg-white px-4 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-sm text-navy">{output.name}</span>
                    <span className="text-xs text-muted">{formatBytes(output.blob.size)}</span>
                    <button
                      type="button"
                      onClick={() => downloadBlob(output.blob, output.name)}
                      className="cursor-pointer rounded-lg border-0 bg-blue-hover px-3 py-1.5 text-xs font-bold text-white hover:bg-navy"
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

function actionLabel(mode: Mode, count: number) {
  if (mode === "merge") return `Merge ${count} PDF${count === 1 ? "" : "s"}`;
  if (mode === "split") return "Split PDF";
  if (mode === "compress") return "Compress PDF";
  if (mode === "to-pdf") return `Make a PDF from ${count} image${count === 1 ? "" : "s"}`;
  return "Save pages as JPG";
}

function IconButton({ label, onClick, disabled, rotate }: { label: string; onClick: () => void; disabled: boolean; rotate: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-muted hover:bg-surface hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
    >
      <span className={rotate}>
        <ToolIcon name="arrow" size={16} />
      </span>
    </button>
  );
}
