"use client";

import { useEffect, useRef, useState } from "react";

type Kind = "pdf" | "image";

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
};

/**
 * A file box that takes a file three ways: the "Choose file" button, drag and drop, or paste
 * (hover over the box or click it, then press Ctrl+V / Cmd+V; works for copied files and screenshots).
 */
export default function FileDropField({
  id,
  kind,
  file,
  onFile,
  disabled = false,
}: {
  id: string;
  kind: Kind;
  file: File | null;
  onFile: (file: File | null) => void;
  disabled?: boolean;
}) {
  const rule = RULES[kind];
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [armed, setArmed] = useState(false); // pointer over the box or box focused: pastes go here
  const [problem, setProblem] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function accept(candidate: File | undefined | null) {
    if (!candidate) return;
    if (!rule.ok(candidate)) {
      setProblem(`That is not ${rule.noun}.`);
      return;
    }
    setProblem(null);
    onFile(candidate);
  }

  // Forget the chosen file in the hidden input when the form is reset or the file is removed.
  useEffect(() => {
    if (!file && inputRef.current) inputRef.current.value = "";
  }, [file]);

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
      const files = Array.from(e.clipboardData?.files ?? []);
      const match = files.find((f) => rule.ok(f)) ?? files[0];
      if (!match) return; // plain text pastes go to whatever field is focused
      e.preventDefault();
      accept(match);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, disabled, kind]);

  return (
    <div
      role="group"
      tabIndex={disabled ? -1 : 0}
      aria-label={`${kind === "pdf" ? "PDF" : "Picture"} drop area. Drop a file here, or click and press Ctrl+V to paste.`}
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
        accept(dropped.find((f) => rule.ok(f)) ?? dropped[0]);
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
        disabled={disabled}
        onChange={(e) => accept(e.target.files?.[0])}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="rounded-full bg-navy px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-navy/90 disabled:cursor-not-allowed"
        >
          Choose file
        </button>
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Chosen picture" className="h-14 w-10 rounded border border-line bg-white object-contain" />
        )}
        <div className="min-w-0 flex-1 text-sm">
          {file ? (
            <span className="flex items-center gap-2">
              <span className="truncate font-semibold text-navy" title={file.name}>
                {file.name}
              </span>
              <span className="shrink-0 text-xs text-muted">{(file.size / 1024 / 1024).toFixed(file.size > 1048576 ? 1 : 2)} MB</span>
              <button
                type="button"
                onClick={() => {
                  setProblem(null);
                  onFile(null);
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
      {problem && (
        <p className="mt-2 text-xs font-semibold text-red-600" role="alert">
          {problem}
        </p>
      )}
    </div>
  );
}
