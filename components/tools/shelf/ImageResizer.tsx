"use client";

import { useEffect, useState } from "react";
import ToolIcon from "@/components/tools/ToolIcon";
import { Button } from "@/components/tools/ui";
import { DropZone, Hint, NumberField, downloadBlob, formatBytes, renameFile, toNumber } from "@/components/tools/kit";
import { useTr } from "@/lib/tools/useTr";
import { loadImage } from "./ImageCompressor";

type Ext = "jpg" | "png" | "webp";
type Result = { blob: Blob; url: string; width: number; height: number; ext: Ext; padded: boolean };
/** What the last run produced for one set of inputs (`key`): a picture, or the reason there isn't one. */
type Done = { key: string; result?: Result; problem?: string };

const MIN = 16;
const MAX = 8000;
const KB = 1024;

const mimeOf: Record<Ext, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
const formats: { value: Ext; label: string }[] = [
  { value: "jpg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
];

/** Sizes that exam and job forms commonly ask for. "Custom range" lets the person type their own. */
const presets = [
  { id: "any", label: "Any size", min: "", max: "" },
  { id: "10-20", label: "10–20 KB", min: "10", max: "20" },
  { id: "20-50", label: "20–50 KB", min: "20", max: "50" },
  { id: "50-100", label: "50–100 KB", min: "50", max: "100" },
  { id: "100-200", label: "100–200 KB", min: "100", max: "200" },
];

/* ---------- Drawing and encoding ---------- */

function draw(img: HTMLImageElement, width: number, height: number, ext: Ext) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  if (ext === "jpg") {
    // JPG has no transparency: fill white so transparent PNGs don't turn black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

function encode(canvas: HTMLCanvasElement, ext: Ext, quality: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => {
        // A browser that can't write WebP quietly hands back a PNG, so check what we really got.
        if (!blob) reject(new Error("encode"));
        else if (blob.type !== mimeOf[ext]) reject(new Error("format"));
        else resolve(blob);
      },
      mimeOf[ext],
      quality,
    ),
  );
}

/* ---------- Padding up to a minimum size ----------
 * When a picture is naturally smaller than the minimum the form asks for, we add invisible filler to the file
 * (a comment block). The picture itself is not touched, so quality never drops just to make a file bigger. */

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array) {
  let c = 0xffffffff;
  for (const b of bytes) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const ascii = (text: string) => Uint8Array.from(text, (ch) => ch.charCodeAt(0));

function joinBytes(parts: Uint8Array[]) {
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** JPEG: comment segments (FF FE, length, text) go right after the start-of-image marker. */
function padJpeg(src: Uint8Array, extra: number) {
  const parts: Uint8Array[] = [src.subarray(0, 2)];
  let left = extra;
  while (left >= 4) {
    const size = Math.min(left - 4, 65533);
    const segment = new Uint8Array(4 + size).fill(0x20);
    segment.set([0xff, 0xfe, (size + 2) >> 8, (size + 2) & 0xff]);
    parts.push(segment);
    left -= 4 + size;
  }
  parts.push(src.subarray(2));
  return joinBytes(parts);
}

/** PNG: one text chunk (length, "tEXt", data, CRC) goes just before the closing IEND chunk. */
function padPng(src: Uint8Array, extra: number) {
  const dataLength = Math.max(extra - 12, 9);
  const chunk = new Uint8Array(12 + dataLength).fill(0x20);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, dataLength);
  chunk.set(ascii("tEXt"), 4);
  chunk.set(ascii("Comment"), 8);
  chunk[15] = 0; // keyword ends with a zero byte
  view.setUint32(8 + dataLength, crc32(chunk.subarray(4, 8 + dataLength)));
  return joinBytes([src.subarray(0, src.length - 12), chunk, src.subarray(src.length - 12)]);
}

/** WebP: a JUNK chunk goes at the end of the file and the RIFF size is updated. Decoders skip it. */
function padWebp(src: Uint8Array, extra: number) {
  let payload = Math.max(extra - 8, 0);
  if (payload % 2) payload -= 1; // chunks must have an even length
  const chunk = new Uint8Array(8 + payload);
  chunk.set(ascii("JUNK"));
  new DataView(chunk.buffer).setUint32(4, payload, true);
  const out = joinBytes([src, chunk]);
  new DataView(out.buffer).setUint32(4, out.length - 8, true);
  return out;
}

async function padBlob(blob: Blob, ext: Ext, targetBytes: number) {
  const extra = targetBytes - blob.size;
  if (extra <= 0) return blob;
  const src = new Uint8Array(await blob.arrayBuffer());
  const out = ext === "jpg" ? padJpeg(src, extra) : ext === "png" ? padPng(src, extra) : padWebp(src, extra);
  return new Blob([out as BlobPart], { type: mimeOf[ext] });
}

/* ---------- The whole job: exact pixels, then the right file size ---------- */

type Made = { blob: Blob; padded: boolean } | { problem: "toobig" | "toobig-png" | "narrow"; size: number };

/**
 * Draws the picture at exactly width × height, then finds the best quality whose file fits under `maxBytes`
 * (binary search). If it ends up under `minBytes`, filler is added instead of lowering quality.
 * PNG is lossless, so its size can't be tuned: it is either inside the range, padded up, or too big.
 */
async function make(img: HTMLImageElement, width: number, height: number, ext: Ext, minBytes: number, maxBytes: number): Promise<Made> {
  const canvas = draw(img, width, height, ext);
  const hasMin = minBytes > 0;
  const hasMax = Number.isFinite(maxBytes);
  let blob: Blob;

  if (ext === "png") {
    blob = await encode(canvas, ext, 1);
  } else if (!hasMax) {
    blob = await encode(canvas, ext, hasMin ? 0.95 : 0.9);
  } else {
    const top = await encode(canvas, ext, 0.95);
    if (top.size <= maxBytes) blob = top;
    else {
      const floor = await encode(canvas, ext, 0.05);
      if (floor.size > maxBytes) return { problem: "toobig", size: floor.size };
      blob = floor;
      let lo = 0.05;
      let hi = 0.95;
      for (let i = 0; i < 8; i++) {
        const mid = (lo + hi) / 2;
        const candidate = await encode(canvas, ext, mid);
        if (candidate.size <= maxBytes) {
          blob = candidate;
          lo = mid;
        } else hi = mid;
      }
    }
  }

  if (hasMax && blob.size > maxBytes) return { problem: ext === "png" ? "toobig-png" : "toobig", size: blob.size };

  let padded = false;
  if (hasMin && blob.size < minBytes) {
    blob = await padBlob(blob, ext, hasMax ? Math.round((minBytes + maxBytes) / 2) : minBytes + KB);
    padded = true;
    if (blob.size < minBytes || blob.size > maxBytes) return { problem: "narrow", size: blob.size };
  }
  return { blob, padded };
}

/* ---------- The card ---------- */

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`min-h-10 cursor-pointer rounded-full border-0 px-4 text-sm font-semibold transition active:scale-95 ${
        active ? "bg-teal text-white shadow-sm" : "bg-surface text-navy hover:bg-blue-soft"
      }`}
    >
      {children}
    </button>
  );
}

/** A numbered section: one clear job per step, so the page reads top to bottom. */
function Step({ n, title, aside, children }: { n: number; title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-3">
      <div className="flex items-center gap-2.5">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-deep text-xs font-extrabold text-white">{n}</span>
        <h3 className="m-0 text-base font-extrabold text-navy">{title}</h3>
        {aside && <span className="ml-auto text-sm font-bold text-teal tabular-nums">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

/**
 * Image Resizer: exact width and height, the file type, and a KB range for the finished file. The preview updates
 * as you change things, then you download it. Everything runs in the browser.
 */
export default function ImageResizer() {
  const tr = useTr();
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lock, setLock] = useState(true);
  const [ext, setExt] = useState<Ext>("jpg");
  const [preset, setPreset] = useState("any");
  const [minKb, setMinKb] = useState("");
  const [maxKb, setMaxKb] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  const result = done?.result;
  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result.url);
  }, [result]);

  async function pick(files: File[]) {
    const chosen = files[0];
    setDone(null);
    setError("");
    if (!/^image\/(jpeg|png|webp|gif|bmp)$/.test(chosen.type)) {
      setError(tr("Use a JPG, PNG or WebP image. iPhone HEIC photos need converting to JPG first (share them as JPG from Photos)."));
      return;
    }
    try {
      const loaded = await loadImage(chosen);
      setFile(chosen);
      setImg(loaded);
      setWidth(String(loaded.naturalWidth));
      setHeight(String(loaded.naturalHeight));
    } catch {
      setError(tr("That image couldn't be opened. Try saving it again as a JPG."));
    }
  }

  // With "Keep the picture's shape" on, changing one side updates the other.
  function changeWidth(value: string) {
    setWidth(value);
    const n = toNumber(value);
    if (lock && img && n > 0) setHeight(String(Math.round((n * img.naturalHeight) / img.naturalWidth)));
  }
  function changeHeight(value: string) {
    setHeight(value);
    const n = toNumber(value);
    if (lock && img && n > 0) setWidth(String(Math.round((n * img.naturalWidth) / img.naturalHeight)));
  }

  function choosePreset(id: string) {
    setPreset(id);
    if (id === "custom") {
      if (!minKb.trim() && !maxKb.trim()) {
        setMinKb("30");
        setMaxKb("50");
      }
      return;
    }
    const p = presets.find((x) => x.id === id)!;
    setMinKb(p.min);
    setMaxKb(p.max);
  }

  const outW = Math.round(toNumber(width));
  const outH = Math.round(toNumber(height));
  const minV = toNumber(minKb);
  const maxV = toNumber(maxKb);
  const hasMin = minV > 0;
  const hasMax = maxV > 0;
  const minBytes = hasMin ? Math.round(minV * KB) : 0;
  const maxBytes = hasMax ? Math.round(maxV * KB) : Infinity;

  let inputError = "";
  if (!(outW >= MIN && outH >= MIN && outW <= MAX && outH <= MAX)) {
    inputError = tr("Width and height should be between {min} and {max} pixels.", { min: MIN, max: MAX });
  } else if (minKb.trim() && !(minV >= 0)) {
    inputError = tr("Enter the minimum size in KB, or leave it empty.");
  } else if (maxKb.trim() && !(maxV >= 1)) {
    inputError = tr("The maximum size should be at least 1 KB.");
  } else if (hasMin && hasMax && maxV < minV) {
    inputError = tr("The maximum should be bigger than the minimum.");
  }

  // The preview is rebuilt shortly after anything changes. `key` says which inputs a result belongs to.
  const key = `${outW}x${outH}|${ext}|${minBytes}|${maxBytes}`;
  useEffect(() => {
    if (!img || inputError) return;
    const timer = setTimeout(async () => {
      try {
        const made = await make(img, outW, outH, ext, minBytes, maxBytes);
        if ("problem" in made) {
          const problem =
            made.problem === "toobig"
              ? tr("Even at the lowest quality this picture is {size} at {w} × {h} px. Choose a bigger maximum or smaller pixels.", {
                  size: formatBytes(made.size),
                  w: outW,
                  h: outH,
                })
              : made.problem === "toobig-png"
                ? tr("PNG keeps every detail, so at {w} × {h} px it is {size} and can't be squeezed under {kb} KB. Switch to JPG or WebP, or choose a bigger maximum.", {
                    size: formatBytes(made.size),
                    w: outW,
                    h: outH,
                    kb: maxV,
                  })
                : tr("Couldn't land inside that range. Make the range a little wider.");
          setDone({ key, problem });
        } else {
          setDone({ key, result: { blob: made.blob, url: URL.createObjectURL(made.blob), width: outW, height: outH, ext, padded: made.padded } });
        }
      } catch (e) {
        const noWebp = e instanceof Error && e.message === "format";
        setDone({ key, problem: noWebp ? tr("This browser can't save WebP. Choose JPG or PNG.") : tr("Couldn't resize that image. Try a smaller size.") });
      }
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` already covers every input that changes the picture
  }, [img, key, inputError, tr]);

  if (!file || !img) {
    return (
      <div className="mx-auto grid grid-cols-1 max-w-3xl gap-4">
        <DropZone
          accept="image/jpeg,image/png,image/webp"
          onFiles={pick}
          title={tr("Drop a photo here")}
          note={tr("JPG, PNG or WebP. It stays on your device: nothing is uploaded.")}
        />
        {error && <Hint error>{error}</Hint>}
      </div>
    );
  }

  const current = done && done.key === key && !inputError ? done : null;
  const status: "working" | "ready" | "problem" = inputError || current?.problem ? "problem" : current?.result ? "ready" : "working";
  const shown = current?.result;
  const badge = {
    working: { text: tr("Working…"), cls: "bg-amber-50 text-amber-700" },
    ready: { text: tr("Ready"), cls: "bg-emerald-50 text-emerald-700" },
    problem: { text: tr("Check this"), cls: "bg-red-50 text-red-700" },
  }[status];

  const rangeLabel =
    hasMin && hasMax
      ? `${minV}–${maxV} KB`
      : hasMax
        ? tr("Up to {n} KB", { n: maxV })
        : hasMin
          ? tr("At least {n} KB", { n: minV })
          : tr("Any size");
  const formatNote =
    ext === "jpg"
      ? tr("JPG gives the smallest files for photos. Transparent areas become white.")
      : ext === "png"
        ? tr("PNG is sharp and keeps transparency, but it can't be squeezed to a small KB size.")
        : tr("WebP makes small files, but some forms and portals don't accept it.");

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 items-start gap-6 md:grid-cols-[1fr_17rem]">
      <div className="grid grid-cols-1 gap-7">
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-card p-2.5 pr-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- a local preview of the visitor's own file */}
          <img src={img.src} alt="" className="size-12 rounded-xl bg-surface object-contain" />
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-sm font-bold text-navy">{file.name}</p>
            <p className="m-0 text-xs text-muted">
              {formatBytes(file.size)} · {img.naturalWidth} × {img.naturalHeight} px
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setImg(null);
              setDone(null);
            }}
            className="cursor-pointer rounded-full border-0 bg-blue-soft px-3.5 py-1.5 text-sm font-bold text-blue-hover transition hover:bg-blue-hover hover:text-white"
          >
            {tr("Change")}
          </button>
        </div>

        <Step n={1} title={tr("Picture size")}>
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <NumberField label={tr("Width")} value={width} onChange={changeWidth} min={MIN} max={MAX} step={1} suffix="px" />
            <button
              type="button"
              aria-pressed={lock}
              aria-label={tr("Keep the picture's shape")}
              title={tr("Keep the picture's shape")}
              onClick={() => setLock(!lock)}
              className={`mb-0.5 grid size-11 cursor-pointer place-items-center rounded-full border-0 transition active:scale-90 ${
                lock ? "bg-teal text-white shadow-sm" : "bg-surface text-muted hover:bg-blue-soft"
              }`}
            >
              <ToolIcon name={lock ? "link" : "unlink"} size={18} />
            </button>
            <NumberField label={tr("Height")} value={height} onChange={changeHeight} min={MIN} max={MAX} step={1} suffix="px" />
          </div>
          <p className="m-0 text-xs leading-5 text-muted">
            <span className="font-bold text-navy">{tr("Keep the picture's shape")}: </span>
            {tr("Forms often ask for a fixed size, for example 200 × 230 px for a photo or 140 × 60 px for a signature. Turn off the shape lock to set both sides freely; the picture is stretched to fit, so crop it close to that shape first.")}
          </p>
        </Step>

        <Step n={2} title={tr("Output format")}>
          <div role="radiogroup" aria-label={tr("Output format")} className="grid grid-cols-3 gap-1 rounded-2xl bg-surface p-1">
            {formats.map((f) => (
              <button
                key={f.value}
                type="button"
                role="radio"
                aria-checked={ext === f.value}
                onClick={() => setExt(f.value)}
                className={`min-h-11 cursor-pointer rounded-xl border-0 text-sm font-bold transition ${
                  ext === f.value ? "bg-card text-navy shadow-sm" : "bg-transparent text-muted hover:text-navy"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="m-0 text-xs leading-5 text-muted">{formatNote}</p>
        </Step>

        <Step n={3} title={tr("Target file size")} aside={rangeLabel}>
          <div role="radiogroup" aria-label={tr("Target file size")} className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <Chip key={p.id} active={preset === p.id} onClick={() => choosePreset(p.id)}>
                {p.id === "any" ? tr(p.label) : p.label}
              </Chip>
            ))}
            <Chip active={preset === "custom"} onClick={() => choosePreset("custom")}>
              {tr("Custom range")}
            </Chip>
          </div>
          {preset === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <NumberField label={tr("Minimum")} value={minKb} onChange={setMinKb} min={0} suffix="KB" placeholder={tr("e.g. 30")} />
              <NumberField label={tr("Maximum")} value={maxKb} onChange={setMaxKb} min={1} suffix="KB" placeholder={tr("e.g. 50")} />
            </div>
          )}
          <p className="m-0 text-xs leading-5 text-muted">{tr("Adjust quality automatically to achieve the target size.")}</p>
        </Step>
      </div>

      {/* The result stays in view next to the settings on wider screens, and sits right under them on phones. */}
      <aside
        className="grid grid-cols-1 gap-4 rounded-3xl border border-line bg-card p-4 shadow-card md:sticky md:top-24"
        aria-live="polite"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="m-0 text-base font-extrabold text-navy">{tr("Output preview")}</h3>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge.cls} ${status === "working" ? "animate-pulse" : ""}`}>{badge.text}</span>
        </div>

        <div
          className="grid min-h-40 place-items-center overflow-hidden rounded-2xl p-3 ring-1 ring-line"
          style={{ backgroundColor: "#f7f0e6", backgroundImage: "radial-gradient(#e6dccb 1px, transparent 1px)", backgroundSize: "14px 14px" }}
        >
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element -- the resized result, generated in the browser
            <img key={shown.url} src={shown.url} alt={tr("Resized result")} className="max-h-48 max-w-full animate-[fc-pop_.35s_ease_both] rounded-lg bg-card object-contain shadow-sm" />
          ) : (
            <span className="size-10 animate-spin rounded-full border-4 border-line border-t-teal" aria-hidden="true" />
          )}
        </div>

        {!inputError && (
          <div className="grid grid-cols-1 gap-1">
            <p className="m-0 flex flex-wrap items-baseline gap-x-2 text-navy tabular-nums">
              <span className="text-3xl font-extrabold tracking-tight">{shown ? formatBytes(shown.blob.size) : "…"}</span>
              <span className="text-sm font-semibold text-muted">
                {outW} × {outH} px · {ext.toUpperCase()}
              </span>
            </p>
            {shown && <p className="m-0 text-xs text-muted tabular-nums">{formatBytes(file.size)} → {formatBytes(shown.blob.size)}</p>}
          </div>
        )}

        {(inputError || current?.problem) && (
          <p className="m-0 rounded-xl bg-red-50 p-3 text-sm leading-5 text-red-700">{inputError || current?.problem}</p>
        )}
        {shown?.padded && (
          <p className="m-0 text-xs leading-5 text-muted">
            {tr("The picture was already smaller than your minimum, so invisible filler was added to the file. The picture itself is unchanged.")}
          </p>
        )}

        <Button
          className="w-full"
          disabled={!shown}
          onClick={() => shown && downloadBlob(shown.blob, renameFile(file.name, `-${shown.width}x${shown.height}`, shown.ext))}
        >
          <ToolIcon name="download" size={18} /> {tr("Download Image")}
        </Button>
      </aside>
    </div>
  );
}
