"use client";

import { useState } from "react";
import ToolIcon from "@/components/tools/ToolIcon";
import { Segmented } from "@/components/tools/kit";
import ImageCompressor from "./ImageCompressor";
import ImageResizer from "./ImageResizer";
import PdfModeCards, { ModeIcon } from "./PdfModeCards";

type Mode = "compress" | "resize";

const modes: { value: Mode; label: string; intro: string }[] = [
  { value: "compress", label: "Compress", intro: "Shrink a photo or signature under the KB size a form asks for." },
  { value: "resize", label: "Resize", intro: "Set exact pixels, pick JPG, PNG or WebP, and keep the file inside a KB range." },
];

/** Same pattern as the PDF Toolkit: cards on phones and tablets, a one-line switch on desktop. */
export default function ImageToolkit() {
  const [mode, setMode] = useState<Mode>("compress");
  const [picked, setPicked] = useState(false);
  const current = modes.find((m) => m.value === mode)!;

  return (
    <div className="mx-auto grid grid-cols-1 max-w-3xl gap-6">
      {!picked && (
        <PdfModeCards
          cards={modes}
          onPick={(value) => {
            setMode(value as Mode);
            setPicked(true);
          }}
        />
      )}

      <div className={`grid grid-cols-1 gap-6 ${picked ? "" : "max-lg:hidden"}`}>
        {picked && (
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setPicked(false)}
              aria-label="Back to all image tools"
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
        <div className="grid grid-cols-1 gap-2">
          <div className="max-lg:hidden">
            <Segmented label="What do you want to do?" value={mode} onChange={setMode} options={modes.map(({ value, label }) => ({ value, label }))} />
          </div>
          <p className="m-0 text-sm text-muted">{current.intro}</p>
        </div>
        {/* Keyed by mode so switching starts that job fresh, like the PDF Toolkit. */}
        {mode === "compress" ? <ImageCompressor key="compress" /> : <ImageResizer key="resize" />}
      </div>
    </div>
  );
}
