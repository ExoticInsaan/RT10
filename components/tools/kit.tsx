"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import ToolIcon from "@/components/tools/ToolIcon";

/*
 * Shared building blocks for the Shelf tools, so every tool looks and behaves the same:
 * labelled fields, a segmented switch, result panels, a file drop zone and download helpers.
 * Fields are 16px on phones so iOS does not zoom in when one is focused.
 */

export const inputClass =
  "h-12 w-full rounded-xl border border-line bg-white px-4 text-base text-navy outline-none transition placeholder:text-slate-400 focus:border-blue-hover focus:ring-4 focus:ring-blue-soft sm:text-sm";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-left">
      <span className="mb-1.5 block text-sm font-semibold text-navy">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-5 text-muted">{hint}</span>}
    </label>
  );
}

/** A number box that keeps what the person typed (including an empty box) and reports a parsed number or NaN. */
export function NumberField({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step = "any",
  placeholder,
  suffix,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number | "any";
  placeholder?: string;
  suffix?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <span className="relative block">
        <input
          className={`${inputClass} ${suffix ? "pr-12" : ""}`}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-4 grid place-items-center text-sm text-muted">
            {suffix}
          </span>
        )}
      </span>
    </Field>
  );
}

export const toNumber = (value: string) => (value.trim() === "" ? NaN : Number(value));

/** A row of mutually exclusive choices (tabs for modes, units, presets). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1 rounded-2xl bg-surface p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`min-h-10 flex-1 cursor-pointer rounded-xl border-0 px-3 text-sm font-semibold transition ${
              active ? "bg-white text-navy shadow-sm" : "bg-transparent text-muted hover:text-navy"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** The headline answer of a calculator: a big value, a label and an optional explanation underneath. */
export function ResultPanel({
  value,
  label,
  children,
  tone = "blue",
}: {
  value: ReactNode;
  label: ReactNode;
  children?: ReactNode;
  tone?: "blue" | "green" | "amber" | "red";
}) {
  const tones = {
    blue: "bg-blue-soft",
    green: "bg-emerald-50",
    amber: "bg-amber-50",
    red: "bg-red-50",
  };
  return (
    <div className={`rounded-2xl p-5 sm:p-6 ${tones[tone]}`} aria-live="polite">
      <p className="m-0 text-sm font-semibold text-muted">{label}</p>
      <p className="m-0 mt-1 text-4xl font-extrabold tracking-tight text-navy tabular-nums sm:text-5xl">{value}</p>
      {children && <div className="mt-3 text-sm leading-6 text-slate-700">{children}</div>}
    </div>
  );
}

/** Shown in place of a result when the inputs cannot produce one yet. */
export function Hint({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return (
    <p
      role={error ? "alert" : undefined}
      className={`m-0 rounded-2xl border border-dashed px-5 py-6 text-center text-sm ${
        error ? "border-red-200 bg-red-50 text-red-700" : "border-line text-muted"
      }`}
    >
      {children}
    </p>
  );
}

/** Click or drop files. Nothing is uploaded: the files go straight to the tool in the browser. */
export function DropZone({
  accept,
  multiple = false,
  onFiles,
  title,
  note,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  title: string;
  note: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const files = Array.from(event.dataTransfer.files);
        if (files.length) onFiles(multiple ? files : files.slice(0, 1));
      }}
      className={`rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
        over ? "border-blue-hover bg-blue-soft" : "border-line bg-surface/40"
      }`}
    >
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-white text-blue-hover shadow-sm">
        <ToolIcon name="upload" size={22} />
      </span>
      <p className="mb-1 mt-4 text-base font-bold text-navy">{title}</p>
      <p className="m-0 text-sm text-muted">{note}</p>
      <label
        htmlFor={id}
        className="mt-5 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-blue-hover px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy"
      >
        Choose {multiple ? "files" : "a file"}
      </label>
      <input
        ref={input}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) onFiles(files);
          if (input.current) input.current.value = "";
        }}
      />
    </div>
  );
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  // One decimal below 100 KB, so "19.7 KB" never shows as a misleading "20 KB" under a 20 KB limit.
  if (bytes < 1024 * 1024) return `${(Math.floor((bytes / 1024) * 10) / 10).toFixed(bytes < 100 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** "photo.jpg" plus "-small" and "jpg" becomes "photo-small.jpg". */
export function renameFile(name: string, suffix: string, extension: string) {
  const base = name.replace(/\.[^.]+$/, "") || "file";
  return `${base}${suffix}.${extension}`;
}

/** Keeps a value in this browser between visits. Falls back to plain state when storage is blocked. */
export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: the tool still works for this visit */
  }
}
