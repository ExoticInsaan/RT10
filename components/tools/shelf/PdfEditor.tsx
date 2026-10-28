"use client";

import { useId, useState } from "react";
import ToolIcon from "@/components/tools/ToolIcon";
import { Button } from "@/components/tools/ui";
import { DropZone, Field, Hint, Segmented, downloadBlob, formatBytes, inputClass, renameFile } from "@/components/tools/kit";
import type { EditPage, Thumb } from "./pdf-engine";

type Item = { key: string; page: EditPage; thumb: Thumb | null };
type AddKind = "blank" | "images" | "pdf";

const MAX_PAGES = 300;
const MAX_BYTES = 150 * 1024 * 1024;
const engine = () => import("./pdf-engine");
const newKey = () => crypto.randomUUID();
const isPdf = (f: File) => f.type === "application/pdf" || /\.pdf$/i.test(f.name);
const isImage = (f: File) => /^image\/(jpeg|png|webp)$/.test(f.type);

/** Edit PDF: open one PDF, then add, remove, turn and reorder its pages, and save a new copy. */
export default function PdfEditor() {
  const [sources, setSources] = useState<File[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState({ width: 595.28, height: 841.89 });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Blob | null>(null);

  const edited = (next: Item[]) => {
    setItems(next);
    setResult(null);
  };

  async function open(files: File[]) {
    const file = files[0];
    setError("");
    if (!isPdf(file)) return setError("Choose a PDF file to edit.");
    if (file.size > MAX_BYTES) return setError("That PDF is over 150 MB, which is too large to edit in a browser.");
    setBusy("Opening your PDF…");
    try {
      const pdf = await engine();
      const size = await pdf.firstPageSize(file);
      const thumbs = await pdf.pageThumbnails(file, (done, total) => setBusy(`Reading page ${done} of ${total}…`));
      if (thumbs.length > MAX_PAGES) throw new Error(`This PDF has ${thumbs.length} pages. Edit PDF works with up to ${MAX_PAGES}.`);
      setSources([file]);
      setPageSize(size);
      setItems(thumbs.map((thumb, index) => ({ key: newKey(), page: { kind: "pdf", source: 0, index, rotate: 0 }, thumb })));
      setResult(null);
    } catch (e) {
      setError((e as Error).message || "That PDF couldn't be opened.");
    } finally {
      setBusy(null);
    }
  }

  /** Inserts new pages so they come after `after` pages (0 = at the start). */
  async function addPages(kind: AddKind, after: number, files: File[]) {
    setError("");
    const position = Math.min(Math.max(after, 0), items.length);
    try {
      let added: Item[] = [];
      if (kind === "blank") {
        added = [{ key: newKey(), page: { kind: "blank", width: pageSize.width, height: pageSize.height, rotate: 0 }, thumb: null }];
      } else if (kind === "images") {
        const images = files.filter(isImage);
        if (!images.length) return setError("Only JPG, PNG and WebP images can be added as pages.");
        setBusy("Adding images…");
        const pdf = await engine();
        for (const file of images) {
          added.push({ key: newKey(), page: { kind: "image", file, rotate: 0 }, thumb: await pdf.imageThumbnail(file) });
        }
      } else {
        const file = files[0];
        if (!file || !isPdf(file)) return setError("Choose a PDF to take pages from.");
        if (file.size > MAX_BYTES) return setError("That PDF is over 150 MB, which is too large to handle in a browser.");
        setBusy("Reading the other PDF…");
        const pdf = await engine();
        const thumbs = await pdf.pageThumbnails(file, (done, total) => setBusy(`Reading page ${done} of ${total}…`));
        const source = sources.length;
        setSources([...sources, file]);
        added = thumbs.map((thumb, index) => ({ key: newKey(), page: { kind: "pdf", source, index, rotate: 0 }, thumb }));
      }
      if (items.length + added.length > MAX_PAGES) return setError(`An edited PDF can have up to ${MAX_PAGES} pages.`);
      edited([...items.slice(0, position), ...added, ...items.slice(position)]);
    } catch (e) {
      setError((e as Error).message || "Those pages couldn't be added.");
    } finally {
      setBusy(null);
    }
  }

  function move(index: number, by: number) {
    const target = index + by;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    edited(next);
  }

  function rotate(index: number) {
    edited(items.map((item, i) => (i === index ? { ...item, page: { ...item.page, rotate: (item.page.rotate + 90) % 360 } } : item)));
  }

  async function save() {
    setError("");
    setBusy("Saving your PDF…");
    try {
      const pdf = await engine();
      setResult(await pdf.buildEditedPdf(sources, items.map((item) => item.page)));
    } catch (e) {
      setError((e as Error).message || "The PDF couldn't be saved.");
    } finally {
      setBusy(null);
    }
  }

  if (!sources.length) {
    return (
      <div className="grid gap-4">
        {busy ? (
          <Hint>{busy}</Hint>
        ) : (
          <DropZone
            accept="application/pdf,.pdf"
            onFiles={open}
            title="Drop the PDF you want to edit"
            note="You'll see every page and can add, remove, turn or move pages. Nothing is uploaded."
          />
        )}
        {error && <Hint error>{error}</Hint>}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 min-w-0 text-sm text-navy">
          <strong className="block truncate">{sources[0].name}</strong>
          <span className="text-muted">
            {items.length} page{items.length === 1 ? "" : "s"} now
          </span>
        </p>
        <Button
          variant="ghost"
          onClick={() => {
            setSources([]);
            setItems([]);
            setResult(null);
            setError("");
          }}
        >
          Start over
        </Button>
      </div>

      <AddPanel pageCount={items.length} busy={Boolean(busy)} onAdd={addPages} />

      {items.length === 0 ? (
        <Hint>Every page has been removed. Add a page, or start over.</Hint>
      ) : (
        <ol className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item, index) => (
            <PageCard
              key={item.key}
              item={item}
              number={index + 1}
              first={index === 0}
              last={index === items.length - 1}
              onLeft={() => move(index, -1)}
              onRight={() => move(index, 1)}
              onRotate={() => rotate(index)}
              onDelete={() => edited(items.filter((_, i) => i !== index))}
            />
          ))}
        </ol>
      )}

      <div className="sticky bottom-24 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/95 p-3 shadow-card backdrop-blur md:bottom-4">
        <Button onClick={save} disabled={Boolean(busy) || items.length === 0}>
          {busy ?? "Save edited PDF"}
        </Button>
        {result && (
          <>
            <span className="text-sm text-navy" aria-live="polite">
              Ready · {items.length} page{items.length === 1 ? "" : "s"} · {formatBytes(result.size)}
            </span>
            <Button variant="secondary" onClick={() => downloadBlob(result, renameFile(sources[0].name, "-edited", "pdf"))}>
              Download PDF
            </Button>
          </>
        )}
      </div>
      {error && <Hint error>{error}</Hint>}
    </div>
  );
}

function AddPanel({
  pageCount,
  busy,
  onAdd,
}: {
  pageCount: number;
  busy: boolean;
  onAdd: (kind: AddKind, after: number, files: File[]) => void;
}) {
  const [kind, setKind] = useState<AddKind>("blank");
  const [after, setAfter] = useState<number | "end">("end");
  const inputId = useId();
  const position = after === "end" ? pageCount : Math.min(after, pageCount);

  return (
    <div className="grid gap-4 rounded-2xl bg-surface p-5">
      <p className="m-0 text-base font-bold text-navy">Add pages</p>
      <Segmented
        label="What to add"
        value={kind}
        onChange={setKind}
        options={[
          { value: "blank", label: "Blank page" },
          { value: "images", label: "Photos or scans" },
          { value: "pdf", label: "Pages from a PDF" },
        ]}
      />
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Field label="Where">
          <select
            className={inputClass}
            value={String(after)}
            onChange={(e) => setAfter(e.target.value === "end" ? "end" : Number(e.target.value))}
          >
            <option value="end">At the end</option>
            <option value="0">At the start</option>
            {Array.from({ length: Math.max(pageCount - 1, 0) }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                After page {i + 1}
              </option>
            ))}
          </select>
        </Field>
        {kind === "blank" ? (
          <Button disabled={busy} onClick={() => onAdd("blank", position, [])}>
            Add blank page
          </Button>
        ) : (
          <>
            <label
              htmlFor={inputId}
              className={`inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-blue-hover px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy ${
                busy ? "pointer-events-none opacity-60" : ""
              }`}
            >
              {kind === "images" ? "Choose photos" : "Choose a PDF"}
            </label>
            <input
              id={inputId}
              type="file"
              className="sr-only"
              multiple={kind === "images"}
              accept={kind === "images" ? "image/jpeg,image/png,image/webp" : "application/pdf,.pdf"}
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                if (files.length) onAdd(kind, position, files);
              }}
            />
          </>
        )}
      </div>
      <p className="m-0 text-xs leading-5 text-muted">
        {kind === "blank"
          ? "A blank page the same size as your document's first page."
          : kind === "images"
            ? "Each photo becomes its own A4 page, in the order you pick them."
            : "Every page of the other PDF is added. Remove the ones you don't need afterwards."}
      </p>
    </div>
  );
}

function PageCard({
  item,
  number,
  first,
  last,
  onLeft,
  onRight,
  onRotate,
  onDelete,
}: {
  item: Item;
  number: number;
  first: boolean;
  last: boolean;
  onLeft: () => void;
  onRight: () => void;
  onRotate: () => void;
  onDelete: () => void;
}) {
  const turned = item.page.rotate % 180 !== 0;
  const label = item.page.kind === "blank" ? "Blank page" : item.page.kind === "image" ? "Photo page" : `Page ${number}`;
  return (
    <li className="grid gap-2 rounded-2xl border border-line bg-white p-2.5">
      <div className="relative grid aspect-[3/4] place-items-center overflow-hidden rounded-xl bg-surface">
        {item.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element -- a preview drawn in the browser from the visitor's own PDF
          <img
            src={item.thumb.url}
            alt={label}
            className="max-h-full max-w-full shadow-sm transition-transform"
            style={{ transform: `rotate(${item.page.rotate}deg) scale(${turned ? 0.74 : 1})` }}
          />
        ) : (
          <span
            className="grid aspect-[1/1.414] w-3/4 place-items-center bg-white text-xs text-muted shadow-sm transition-transform"
            style={{ transform: `rotate(${item.page.rotate}deg) scale(${turned ? 0.74 : 1})` }}
          >
            Blank
          </span>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-navy px-2 py-0.5 text-xs font-bold text-white">{number}</span>
        {(item.page.kind !== "pdf" || item.page.source > 0) && (
          <span className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[0.65rem] font-bold text-white">New</span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <PageButton label={`Move page ${number} earlier`} disabled={first} onClick={onLeft}>
          <span className="rotate-180">
            <ToolIcon name="arrow" size={15} />
          </span>
        </PageButton>
        <PageButton label={`Turn page ${number}`} onClick={onRotate}>
          <span aria-hidden="true" className="text-base leading-none">↻</span>
        </PageButton>
        <PageButton label={`Remove page ${number}`} onClick={onDelete} danger>
          <ToolIcon name="close" size={15} />
        </PageButton>
        <PageButton label={`Move page ${number} later`} disabled={last} onClick={onRight}>
          <ToolIcon name="arrow" size={15} />
        </PageButton>
      </div>
    </li>
  );
}

function PageButton({
  label,
  onClick,
  disabled = false,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-transparent transition disabled:cursor-not-allowed disabled:opacity-30 ${
        danger ? "text-muted hover:bg-red-50 hover:text-red-600" : "text-muted hover:bg-surface hover:text-navy"
      }`}
    >
      {children}
    </button>
  );
}
