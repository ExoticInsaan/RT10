"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/tools/ui";
import {
  DropZone,
  Hint,
  NumberField,
  Segmented,
  downloadBlob,
  formatBytes,
  renameFile,
  toNumber,
} from "@/components/tools/kit";

type Result = { blob: Blob; url: string; width: number; height: number; quality: number; hitTarget: boolean };

const presets = [20, 50, 100, 200, 500];

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable"));
    };
    img.src = url;
  });
}

function encode(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode"))), "image/jpeg", quality),
  );
}

function draw(img: HTMLImageElement, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  // JPEG has no transparency: fill white so transparent PNGs don't turn black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

/**
 * Finds the best JPEG quality that fits under `limit` bytes (binary search). If even the lowest quality is too big
 * and the size is not fixed, shrinks the picture step by step until it fits.
 */
async function compress(img: HTMLImageElement, limit: number, width: number, height: number, fixedSize: boolean) {
  let w = width;
  let h = height;
  for (let attempt = 0; attempt < 12; attempt++) {
    const canvas = draw(img, w, h);
    let lo = 0.05;
    let hi = 0.95;
    let best: { blob: Blob; q: number } | null = null;
    const top = await encode(canvas, hi);
    if (top.size <= limit) best = { blob: top, q: hi };
    else {
      for (let i = 0; i < 8; i++) {
        const mid = (lo + hi) / 2;
        const blob = await encode(canvas, mid);
        if (blob.size <= limit) {
          best = { blob, q: mid };
          lo = mid;
        } else hi = mid;
      }
      if (!best) {
        const floor = await encode(canvas, 0.05);
        if (floor.size <= limit) best = { blob: floor, q: 0.05 };
        else if (fixedSize || w < 64 || h < 64) {
          return { blob: floor, width: w, height: h, quality: 0.05, hitTarget: false };
        }
      }
    }
    if (best) return { blob: best.blob, width: w, height: h, quality: best.q, hitTarget: true };
    w = Math.round(w * 0.85);
    h = Math.round(h * 0.85);
  }
  throw new Error("too-big");
}

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [preset, setPreset] = useState("50");
  const [customKb, setCustomKb] = useState("");
  const [resize, setResize] = useState<"keep" | "exact">("keep");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result.url);
  }, [result]);

  async function pick(files: File[]) {
    const chosen = files[0];
    setResult(null);
    setError("");
    if (!/^image\/(jpeg|png|webp|gif|bmp)$/.test(chosen.type)) {
      setError("Use a JPG, PNG or WebP image. iPhone HEIC photos need converting to JPG first (share them as JPG from Photos).");
      return;
    }
    try {
      const loaded = await loadImage(chosen);
      setFile(chosen);
      setImg(loaded);
      setWidth(String(loaded.naturalWidth));
      setHeight(String(loaded.naturalHeight));
    } catch {
      setError("That image couldn't be opened. Try saving it again as a JPG.");
    }
  }

  const targetKb = preset === "custom" ? toNumber(customKb) : Number(preset);
  const w = toNumber(width);
  const h = toNumber(height);

  async function run() {
    if (!img || !file) return;
    if (!(targetKb >= 5)) return setError("Choose a target of at least 5 KB.");
    if (resize === "exact" && !(w >= 16 && h >= 16 && w <= 8000 && h <= 8000)) {
      return setError("Width and height should be between 16 and 8000 pixels.");
    }
    setBusy(true);
    setError("");
    try {
      const outW = resize === "exact" ? Math.round(w) : img.naturalWidth;
      const outH = resize === "exact" ? Math.round(h) : img.naturalHeight;
      const r = await compress(img, targetKb * 1024, outW, outH, resize === "exact");
      setResult({ ...r, url: URL.createObjectURL(r.blob) });
    } catch {
      setError("Couldn't get the image that small. Try a bigger target size.");
    } finally {
      setBusy(false);
    }
  }

  if (!file || !img) {
    return (
      <div className="mx-auto grid max-w-3xl gap-4">
        <DropZone
          accept="image/jpeg,image/png,image/webp"
          onFiles={pick}
          title="Drop a photo or signature here"
          note="JPG, PNG or WebP. It stays on your device: nothing is uploaded."
        />
        {error && <Hint error>{error}</Hint>}
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div className="flex items-center gap-4 rounded-2xl bg-surface p-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- a local preview of the visitor's own file */}
        <img src={img.src} alt="" className="size-16 rounded-xl bg-white object-contain" />
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-sm font-bold text-navy">{file.name}</p>
          <p className="m-0 text-sm text-muted">
            {formatBytes(file.size)} · {img.naturalWidth} × {img.naturalHeight} px
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            setFile(null);
            setImg(null);
            setResult(null);
          }}
        >
          Change
        </Button>
      </div>

      <div className="grid gap-2">
        <p className="m-0 text-sm font-semibold text-navy">Make it smaller than</p>
        <Segmented
          label="Target size"
          value={preset}
          onChange={(v) => {
            setPreset(v);
            setResult(null);
          }}
          options={[...presets.map((kb) => ({ value: String(kb), label: `${kb} KB` })), { value: "custom", label: "Other" }]}
        />
        {preset === "custom" && (
          <div className="max-w-xs">
            <NumberField label="Size limit" value={customKb} onChange={setCustomKb} min={5} suffix="KB" placeholder="e.g. 30" />
          </div>
        )}
      </div>

      <div className="grid gap-3">
        <Segmented
          label="Picture size"
          value={resize}
          onChange={(v) => {
            setResize(v);
            setResult(null);
          }}
          options={[
            { value: "keep", label: "Keep the same size" },
            { value: "exact", label: "Set exact pixels" },
          ]}
        />
        {resize === "exact" && (
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Width" value={width} onChange={setWidth} min={16} step={1} suffix="px" />
            <NumberField label="Height" value={height} onChange={setHeight} min={16} step={1} suffix="px" />
            <p className="col-span-2 m-0 text-xs leading-5 text-muted">
              Exam forms often ask for a fixed size, for example 200 × 230 px for a photo or 140 × 60 px for a signature. The
              picture is stretched to fit exactly, so crop it close to that shape first for the best look.
            </p>
          </div>
        )}
      </div>

      <Button onClick={run} disabled={busy} className="w-full sm:w-auto sm:justify-self-start">
        {busy ? "Compressing…" : "Compress image"}
      </Button>
      {error && <Hint error>{error}</Hint>}

      {result && (
        <div className="grid gap-4 rounded-2xl bg-blue-soft p-5 sm:grid-cols-[10rem_1fr] sm:items-center" aria-live="polite">
          {/* eslint-disable-next-line @next/next/no-img-element -- the compressed result, generated in the browser */}
          <img src={result.url} alt="Compressed result" className="mx-auto max-h-40 rounded-xl bg-white object-contain" />
          <div>
            <p className="m-0 text-sm font-semibold text-muted">
              {result.hitTarget ? `Under ${targetKb} KB` : `Smallest possible at this size`}
            </p>
            <p className="m-0 mt-1 text-4xl font-extrabold tracking-tight text-navy tabular-nums">{formatBytes(result.blob.size)}</p>
            <p className="m-0 mt-1 text-sm text-slate-700">
              {result.width} × {result.height} px · JPG · down from {formatBytes(file.size)}
            </p>
            {result.hitTarget && resize === "keep" && result.width < img.naturalWidth && (
              <p className="m-0 mt-2 text-sm text-slate-700">
                The picture was made smaller ({img.naturalWidth} × {img.naturalHeight} → {result.width} × {result.height} px) to fit
                under {targetKb} KB.
              </p>
            )}
            {!result.hitTarget && (
              <p className="m-0 mt-2 text-sm text-red-700">
                This is as small as a {result.width} × {result.height} picture gets. Use smaller pixel sizes or a bigger target.
              </p>
            )}
            <Button className="mt-4" onClick={() => downloadBlob(result.blob, renameFile(file.name, "-compressed", "jpg"))}>
              Download JPG
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
