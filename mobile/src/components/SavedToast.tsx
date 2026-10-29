import { useEffect, useRef, useState } from "react";
import { SAVED_EVENT, openSaved, shareSaved, type SavedFile } from "../native";

/**
 * "Saved to Downloads" message with Open and Share, shown after a download is saved on the phone.
 * Without it people would not know where the file went. Disappears by itself after a few seconds.
 */
export default function SavedToast() {
  const [file, setFile] = useState<SavedFile | null>(null);
  const [note, setNote] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onSaved = (e: Event) => {
      setFile((e as CustomEvent<SavedFile>).detail);
      setNote("");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setFile(null), 8000);
    };
    window.addEventListener(SAVED_EVENT, onSaved);
    return () => {
      window.removeEventListener(SAVED_EVENT, onSaved);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!file) return null;

  async function open() {
    if (!file) return;
    try {
      await openSaved(file);
      setFile(null);
    } catch {
      setNote("No app can open this file. Use Share instead.");
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-x-3 z-50 flex animate-fz-pop items-center gap-3 rounded-2xl bg-navy p-3.5 text-white shadow-float"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-extrabold">{file.folder === "Pictures" ? "Saved to Gallery" : "Saved to Downloads"}</div>
        <div className="truncate text-xs text-white/70">{note || file.name}</div>
      </div>
      <button type="button" className="min-h-10 cursor-pointer rounded-xl border-0 bg-white px-4 text-sm font-extrabold text-navy" onClick={() => void open()}>
        Open
      </button>
      <button
        type="button"
        className="min-h-10 cursor-pointer rounded-xl border-0 bg-white/15 px-4 text-sm font-extrabold text-white"
        onClick={() => void shareSaved(file).catch(() => {})}
      >
        Share
      </button>
    </div>
  );
}
