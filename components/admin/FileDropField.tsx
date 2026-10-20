"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_PICTURES, isPdfFile, isPictureFile } from "@/lib/documents";

// "document" takes a PDF or pictures (PNG, JPG, WebP); "pictures" takes pictures only. Several pictures can be
// added to either; they become pages in order.
type Kind = "pdf" | "image" | "document" | "pictures";

const RULES: Record<Kind, { accept: string; noun: string; ok: (f: File) => boolean }> = {
  pdf: {
    accept: "application/pdf,.pdf",
    noun: "a PDF",
    ok: (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
  },
  image: {
    accept: "image/png,image/jpeg,image/webp",
    noun: "a PNG, JPG or WebP picture",
    ok: (f) => ["image/png", "image/jpeg", "image/webp"].includes(f.type),
  },
  pictures: {
    accept: "image/png,image/jpeg,image/webp",
    noun: "a PNG, JPG or WebP picture",
    ok: (f) => isPictureFile(f),
  },
  document: {
    accept: "application/pdf,.pdf,image/png,image/jpeg,image/webp",
    noun: "a PDF or a PNG, JPG or WebP picture",
    ok: (f) => isPdfFile(f) || isPictureFile(f),
  },
};

const mb = (size: number) => `${(size / 1024 / 1024).toFixed(size > 1048576 ? 1 : 2)} MB`;

/**
 * A file box that takes a file three ways: the "Choose file" button, drag and drop, or paste
 * (hover over the box or click it, then press Ctrl+V / Cmd+V; works for copied files and screenshots).
 */
export default function FileDropField({
  id,
  kind,
  file = null,
  onFile,
  files,
  onFiles,
  disabled = false,
}: {
  id: string;
  kind: Kind;
  /** Single-file mode (PDF or cover picture). */
  file?: File | null;
  onFile?: (file: File | null) => void;
  /** Several-files mode (kind "document"): one PDF, or a list of pictures kept in page order. */
  files?: File[];
  onFiles?: (files: File[]) => void;
  disabled?: boolean;
}) {
  const rule = RULES[kind];
  const multi = onFiles !== undefined;
  const list = files ?? [];
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [armed, setArmed] = useState(false); // pointer over the box or box focused: pastes go here
  const [problem, setProblem] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function accept(candidates: (File | undefined | null)[]) {
    const given = candidates.filter((f): f is File => Boolean(f));
    if (given.length === 0) return;
    const valid = given.filter((f) => rule.ok(f));
    if (valid.length === 0) {
      setProblem(`That is not ${rule.noun}.`);
      return;
    }
    if (!multi) {
      setProblem(null);
      onFile?.(valid[0]);
      return;
    }
    // A PDF replaces everything; pictures are added after the ones already chosen.
    const pdf = valid.find(isPdfFile);
    if (pdf) {
      setProblem(valid.length > 1 ? "A PDF cannot be mixed with pictures, so only the PDF was kept." : null);
      onFiles?.([pdf]);
      return;
    }
    const next = [...list.filter(isPictureFile), ...valid];
    if (next.length > MAX_PICTURES) {
      setProblem(`Use at most ${MAX_PICTURES} pictures in one file.`);
      return;
    }
    setProblem(valid.length < given.length ? "Some files were skipped because they are not PDFs or pictures." : null);
    onFiles?.(next);
  }

  function move(index: number, by: number) {
    const next = [...list];
    const to = index + by;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
    onFiles?.(next);
  }

  // Forget the chosen file in the hidden input when the form is reset or the file is removed.
  const hasFile = multi ? list.length > 0 : Boolean(file);
  useEffect(() => {
    if (!hasFile && inputRef.current) inputRef.current.value = "";
  }, [hasFile]);

  // A small picture of an image that was chosen, pasted or dropped.
  useEffect(() => {
    if (!file || kind !== "image") {
      Promise.resolve().then(() => setPreviewUrl(null));
      return;
    }
    const url = URL.createObjectURL(file);
    Promise.resolve().then(() => setPreviewUrl(url));
    return () => URL.revokeObjectURL(url);
  }, [file, kind]);

  // Paste: only while this box is the one being pointed at or focused.
  useEffect(() => {
    if (!armed || disabled) return;
    const onPaste = (e: ClipboardEvent) => {
      const pasted = Array.from(e.clipboardData?.files ?? []);
      if (pasted.length === 0) return; // plain text pastes go to whatever field is focused
      e.preventDefault();
      accept(multi ? pasted : [pasted.find((f) => rule.ok(f)) ?? pasted[0]]);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, disabled, kind]);

  return (
    <div
      role="group"
      tabIndex={disabled ? -1 : 0}
      aria-label={`${kind === "pdf" ? "PDF" : kind === "document" ? "PDF or picture" : "Picture"} drop area. Drop a file here, or click and press Ctrl+V to paste.`}
      onMouseEnter={() => setArmed(true)}
      onMouseLeave={() => setArmed(false)}
      onFocus={() => setArmed(true)}
      onBlur={() => setArmed(false)}
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        const dropped = Array.from(e.dataTransfer.files);
        accept(multi ? dropped : [dropped.find((f) => rule.ok(f)) ?? dropped[0]]);
      }}
      className={`rounded-xl border-2 border-dashed px-3 py-3 outline-none transition focus-visible:ring-2 focus-visible:ring-blue/40 ${
        dragging ? "border-blue bg-blue/5" : armed ? "border-blue/60 bg-white" : "border-line bg-white"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={rule.accept}
        className="sr-only"
        tabIndex={-1}
        multiple={multi}
        disabled={disabled}
        onChange={(e) => {
          const chosen = Array.from(e.target.files ?? []);
          accept(multi ? chosen : [chosen[0]]);
          e.target.value = ""; // lets the same file be chosen again after removing it
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="rounded-full bg-navy px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-navy/90 disabled:cursor-not-allowed"
        >
          {multi && list.some(isPictureFile) ? "Add more" : "Choose file"}
        </button>
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Chosen picture" className="h-14 w-10 rounded border border-line bg-white object-contain" />
        )}
        <div className="min-w-0 flex-1 text-sm">
          {multi && list.length > 0 ? (
            <span className="text-xs text-muted">
              {list.length === 1 && isPdfFile(list[0])
                ? "PDF chosen"
                : `${list.length} picture${list.length === 1 ? "" : "s"} chosen. They become pages in this order.`}
            </span>
          ) : file ? (
            <span className="flex items-center gap-2">
              <span className="truncate font-semibold text-navy" title={file.name}>
                {file.name}
              </span>
              <span className="shrink-0 text-xs text-muted">{mb(file.size)}</span>
              <button
                type="button"
                onClick={() => {
                  setProblem(null);
                  onFile?.(null);
                }}
                aria-label="Remove the chosen file"
                className="shrink-0 rounded-full border border-line px-2 text-xs font-semibold text-muted hover:text-navy"
              >
                ✕
              </button>
            </span>
          ) : (
            <span className="text-muted">
              {dragging ? "Drop it here" : "or drag and drop here, or paste with Ctrl+V"}
            </span>
          )}
        </div>
      </div>
      {multi && list.length > 0 && (
        <ol className="mt-3 space-y-1.5">
          {list.map((f, i) => (
            <li key={`${f.name}-${f.size}-${i}`} className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm">
              {!isPdfFile(f) && <span className="w-5 shrink-0 text-xs font-semibold text-muted">{i + 1}.</span>}
              <span className="min-w-0 flex-1 truncate font-semibold text-navy" title={f.name}>{f.name}</span>
              <span className="shrink-0 text-xs text-muted">{mb(f.size)}</span>
              {list.length > 1 && (
                <>
                  <button type="button" disabled={disabled || i === 0} onClick={() => move(i, -1)} aria-label={`Move ${f.name} up`} className="shrink-0 rounded-full border border-line bg-white px-2 text-xs font-semibold text-navy disabled:opacity-40">↑</button>
                  <button type="button" disabled={disabled || i === list.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${f.name} down`} className="shrink-0 rounded-full border border-line bg-white px-2 text-xs font-semibold text-navy disabled:opacity-40">↓</button>
                </>
              )}
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  setProblem(null);
                  onFiles?.(list.filter((_, j) => j !== i));
                }}
                aria-label={`Remove ${f.name}`}
                className="shrink-0 rounded-full border border-line bg-white px-2 text-xs font-semibold text-muted hover:text-navy"
              >
                ✕
              </button>
            </li>
          ))}
        </ol>
      )}
      {problem && (
        <p className="mt-2 text-xs font-semibold text-red-600" role="alert">
          {problem}
        </p>
      )}
    </div>
  );
}
