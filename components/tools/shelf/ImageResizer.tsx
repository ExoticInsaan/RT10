"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/tools/ui";
import { DropZone, Hint, NumberField, Segmented, downloadBlob, formatBytes, renameFile, toNumber } from "@/components/tools/kit";
import { compress, loadImage } from "./ImageCompressor";

type Result = { blob: Blob; url: string; width: number; height: number; ext: "jpg" | "png"; limitKb: number | null; hitTarget: boolean };

const limits = [20, 50, 100, 200, 500];

const MIN = 16;
const MAX = 8000;

function render(img: HTMLImageElement, width: number, height: number, ext: "jpg" | "png") {
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
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode"))), ext === "jpg" ? "image/jpeg" : "image/png", 0.92),
  );
}

/** Resize a picture to exact pixels (keeping its shape if you like) or by a percentage. Runs in the browser. */
export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [by, setBy] = useState<"pixels" | "percent">("pixels");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lock, setLock] = useState(true);
  const [percent, setPercent] = useState("50");
  const [ext, setExt] = useState<"jpg" | "png">("jpg");
  // Like the old tool, resizing also makes the file smaller by default. "none" keeps full quality.
  const [size, setSize] = useState("100");
  const [customKb, setCustomKb] = useState("");
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
      setExt(chosen.type === "image/png" ? "png" : "jpg");
    } catch {
      setError("That image couldn't be opened. Try saving it again as a JPG.");
    }
  }

  // With "Keep the picture's shape" on, changing one side updates the other.
  function changeWidth(value: string) {
    setWidth(value);
    setResult(null);
    const n = toNumber(value);
    if (lock && img && n > 0) setHeight(String(Math.round((n * img.naturalHeight) / img.naturalWidth)));
  }
  function changeHeight(value: string) {
    setHeight(value);
    setResult(null);
    const n = toNumber(value);
    if (lock && img && n > 0) setWidth(String(Math.round((n * img.naturalWidth) / img.naturalHeight)));
  }

  const limitKb = size === "none" ? null : size === "custom" ? toNumber(customKb) : Number(size);
  const pct = toNumber(percent);
  const outW = img ? (by === "pixels" ? Math.round(toNumber(width)) : Math.round((img.naturalWidth * pct) / 100)) : 0;
  const outH = img ? (by === "pixels" ? Math.round(toNumber(height)) : Math.round((img.naturalHeight * pct) / 100)) : 0;

  async function run() {
    if (!img || !file) return;
    if (by === "percent" && !(pct >= 1)) return setError("Enter a percentage of at least 1.");
    if (!(outW >= MIN && outH >= MIN && outW <= MAX && outH <= MAX)) {
      return setError(`Width and height should be between ${MIN} and ${MAX} pixels.`);
    }
    if (limitKb !== null && !(limitKb >= 5)) return setError("Choose a size limit of at least 5 KB.");
    setBusy(true);
    setError("");
    try {
      if (limitKb !== null) {
        // Exact pixels stay as set; the JPG quality is lowered until the file fits under the limit.
        const r = await compress(img, limitKb * 1024, outW, outH, true);
        setResult({ blob: r.blob, url: URL.createObjectURL(r.blob), width: outW, height: outH, ext: "jpg", limitKb, hitTarget: r.hitTarget });
      } else {
        const blob = await render(img, outW, outH, ext);
        setResult({ blob, url: URL.createObjectURL(blob), width: outW, height: outH, ext, limitKb: null, hitTarget: true });
      }
    } catch {
      setError("Couldn't resize that image. Try a smaller size.");
    } finally {
      setBusy(false);
    }
  }

  if (!file || !img) {
    return (
      <div className="mx-auto grid grid-cols-1 max-w-3xl gap-4">
        <DropZone
          accept="image/jpeg,image/png,image/webp"
          onFiles={pick}
          title="Drop a photo here"
          note="JPG, PNG or WebP. It stays on your device: nothing is uploaded."
        />
        {error && <Hint error>{error}</Hint>}
      </div>
    );
  }

  return (
    <div className="mx-auto grid grid-cols-1 max-w-3xl gap-6">
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

      <div className="grid grid-cols-1 gap-3">
        <Segmented
          label="Resize by"
          value={by}
          onChange={(v) => {
            setBy(v);
            setResult(null);
          }}
          options={[
            { value: "pixels", label: "Pixels" },
            { value: "percent", label: "Percentage" },
          ]}
        />
        {by === "pixels" ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <NumberField label="Width" value={width} onChange={changeWidth} min={MIN} max={MAX} step={1} suffix="px" />
              <NumberField label="Height" value={height} onChange={changeHeight} min={MIN} max={MAX} step={1} suffix="px" />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-navy">
              <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} className="size-4 accent-blue-hover" />
              Keep the picture&apos;s shape (changing one side updates the other)
            </label>
            <p className="m-0 text-xs leading-5 text-muted">
              Forms often ask for a fixed size, for example 200 × 230 px for a photo or 140 × 60 px for a signature. Turn off
              the shape lock to set both sides freely; the picture is stretched to fit, so crop it close to that shape first.
            </p>
          </>
        ) : (
          <>
            <div className="max-w-xs">
              <NumberField
                label="Scale to"
                value={percent}
                onChange={(v) => {
                  setPercent(v);
                  setResult(null);
                }}
                min={1}
                step={1}
                suffix="%"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[25, 50, 75, 150, 200].map((p) => (
                <Button key={p} variant="secondary" className="min-h-10 rounded-full px-4" onClick={() => { setPercent(String(p)); setResult(null); }}>
                  {p}%
                </Button>
              ))}
            </div>
            <p className="m-0 text-xs leading-5 text-muted">
              The new size will be {outW > 0 ? `${outW} × ${outH} px` : "…"}.
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Segmented
          label="File size"
          value={size}
          onChange={(v) => {
            setSize(v);
            setResult(null);
          }}
          options={[
            { value: "none", label: "No limit" },
            ...limits.map((kb) => ({ value: String(kb), label: `${kb} KB` })),
            { value: "custom", label: "Other" },
          ]}
        />
        {size === "custom" && (
          <div className="max-w-xs">
            <NumberField label="Size limit" value={customKb} onChange={setCustomKb} min={5} suffix="KB" placeholder="e.g. 30" />
          </div>
        )}
        <p className="m-0 text-xs leading-5 text-muted">
          {limitKb === null ? "The picture is resized and saved without squeezing the file." : `Resizes, then compresses the picture to stay under ${limitKb >= 5 ? limitKb : "…"} KB. Saved as JPG.`}
        </p>
      </div>

      {limitKb === null && (
        <Segmented
          label="Save as"
          value={ext}
          onChange={(v) => {
            setExt(v);
            setResult(null);
          }}
          options={[
            { value: "jpg", label: "JPG: smaller file" },
            { value: "png", label: "PNG: sharp, keeps transparency" },
          ]}
        />
      )}

      <Button onClick={run} disabled={busy} className="w-full sm:w-auto sm:justify-self-start">
        {busy ? "Working…" : limitKb === null ? "Resize image" : "Resize and compress"}
      </Button>
      {error && <Hint error>{error}</Hint>}

      {result && (
        <div className="grid grid-cols-1 gap-4 rounded-2xl bg-blue-soft p-5 sm:grid-cols-[10rem_1fr] sm:items-center" aria-live="polite">
          {/* eslint-disable-next-line @next/next/no-img-element -- the resized result, generated in the browser */}
          <img src={result.url} alt="Resized result" className="mx-auto max-h-40 rounded-xl bg-white object-contain" />
          <div>
            <p className="m-0 text-sm font-semibold text-muted">Resized to</p>
            <p className="m-0 mt-1 text-3xl font-extrabold tracking-tight text-navy tabular-nums">
              {result.width} × {result.height} px
            </p>
            <p className="m-0 mt-1 text-sm text-slate-700">
              {formatBytes(result.blob.size)}
              {result.limitKb !== null && result.hitTarget && ` (under ${result.limitKb} KB)`} · {result.ext.toUpperCase()} · was {img.naturalWidth} × {img.naturalHeight} px, {formatBytes(file.size)}
            </p>
            {!result.hitTarget && (
              <p className="m-0 mt-2 text-sm text-red-700">
                This is as small as a {result.width} × {result.height} picture gets. Use smaller pixel sizes or a bigger limit.
              </p>
            )}
            <Button className="mt-4" onClick={() => downloadBlob(result.blob, renameFile(file.name, `-${result.width}x${result.height}`, result.ext))}>
              Download {result.ext.toUpperCase()}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
