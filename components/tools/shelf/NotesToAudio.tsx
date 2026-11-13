"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/tools/ui";
import { DropZone, Field, Hint, Segmented, downloadBlob, inputClass } from "@/components/tools/kit";
import { ExtractError, extractFromPdf, extractFromPhotos, type OcrLang } from "@/lib/tools/extract-text";
import { MAX_CHARS, cleanText, detectLang, formatClock, partSeconds, splitParts, voicesFor, wordCount } from "@/lib/tools/notes-audio";

type Source = "paste" | "pdf" | "photos";
const RATES = [1, 1.25, 1.5, 1.75, 0.8];
const SLEEP = [0, 10, 20, 30];
const BARS = Array.from({ length: 40 }, (_, i) => ({ h: 12 + Math.abs(Math.sin(i * 0.55)) * 40 + ((i * 7) % 10), d: (i % 9) * 70 }));

export default function NotesToAudio() {
  const [source, setSource] = useState<Source>("paste");
  const [text, setText] = useState("");
  const [ocrLang, setOcrLang] = useState<OcrLang>("eng");
  const [busy, setBusy] = useState<{ label: string; fraction: number } | null>(null);
  const [error, setError] = useState("");

  const [parts, setParts] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [lang, setLang] = useState("en-IN");
  const [voiceList, setVoiceList] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState("");
  const [sleep, setSleep] = useState(0);
  const [canSpeak] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);

  // Live values the speech callbacks read, so they never see a stale part or setting.
  const playRef = useRef(false);
  const idxRef = useRef(0);
  const rateRef = useRef(1);
  const partsRef = useRef<string[]>([]);
  const langRef = useRef("en-IN");
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const allVoices = useRef<SpeechSynthesisVoice[]>([]);
  const guard = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wake = useRef<{ release: () => Promise<void> } | null>(null);
  const speakRef = useRef<() => void>(() => undefined);
  const list = useRef<HTMLDivElement>(null);

  const refreshVoices = useCallback(() => {
    allVoices.current = window.speechSynthesis.getVoices();
    const matching = voicesFor(allVoices.current, langRef.current);
    setVoiceList(matching);
    if (!matching.some((v) => v === voiceRef.current)) {
      voiceRef.current = matching[0] ?? null;
      setVoiceName(matching[0]?.name ?? "");
    }
  }, []);

  useEffect(() => {
    if (!canSpeak) return;
    refreshVoices();
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", refreshVoices);
      window.speechSynthesis.cancel();
      if (guard.current) clearTimeout(guard.current);
      if (sleepTimer.current) clearTimeout(sleepTimer.current);
      void wake.current?.release().catch(() => undefined);
    };
  }, [canSpeak, refreshVoices]);

  const total = useMemo(() => parts.reduce((sum, p) => sum + partSeconds(p, rate), 0), [parts, rate]);
  const elapsed = useMemo(() => parts.slice(0, idx).reduce((sum, p) => sum + partSeconds(p, rate), 0), [parts, idx, rate]);

  const goTo = useCallback((n: number) => {
    idxRef.current = n;
    setIdx(n);
  }, []);

  const stop = useCallback(() => {
    playRef.current = false;
    setPlaying(false);
    if (guard.current) clearTimeout(guard.current);
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    void wake.current?.release().catch(() => undefined);
    wake.current = null;
  }, []);

  const speak = useCallback(() => {
    const all = partsRef.current;
    const part = all[idxRef.current];
    if (!playRef.current || !part) return;
    let moved = false;
    const next = () => {
      if (moved || !playRef.current) return;
      moved = true;
      if (guard.current) clearTimeout(guard.current);
      if (idxRef.current < all.length - 1) {
        goTo(idxRef.current + 1);
        speakRef.current();
      } else {
        stop();
        goTo(0);
      }
    };
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(part);
    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.lang = voiceRef.current?.lang ?? langRef.current;
    utterance.rate = rateRef.current;
    utterance.onend = next;
    utterance.onerror = next;
    window.speechSynthesis.speak(utterance);
    // Some phones never fire onend; move on after a safe time so the audio cannot freeze.
    guard.current = setTimeout(next, partSeconds(part, rateRef.current) * 1000 + 8000);
  }, [goTo, stop]);

  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  const start = async () => {
    playRef.current = true;
    setPlaying(true);
    try {
      const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
      wake.current = (await nav.wakeLock?.request("screen")) ?? null; // keeps the screen on so the voice keeps going
    } catch {
      /* not allowed here: playback still works */
    }
    speakRef.current();
  };

  const restartIfPlaying = (action: () => void) => {
    const was = playRef.current;
    stop();
    action();
    if (was) void start();
  };

  const jump = (n: number) => restartIfPlaying(() => goTo(Math.min(Math.max(n, 0), parts.length - 1)));

  const changeRate = () => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    rateRef.current = next;
    restartIfPlaying(() => setRate(next));
  };

  const changeVoice = (name: string) => {
    voiceRef.current = voiceList.find((v) => v.name === name) ?? null;
    setVoiceName(name);
    restartIfPlaying(() => undefined);
  };

  const changeSleep = (minutes: number) => {
    setSleep(minutes);
    if (sleepTimer.current) clearTimeout(sleepTimer.current);
    if (minutes) sleepTimer.current = setTimeout(stop, minutes * 60_000);
  };

  useEffect(() => {
    const el = list.current?.querySelector<HTMLElement>(".na-now");
    if (el && list.current) list.current.scrollTop = el.offsetTop - list.current.offsetTop - 60;
  }, [idx]);

  const run = async (job: () => Promise<string>) => {
    setError("");
    stop();
    setBusy({ label: "Starting…", fraction: 0 });
    try {
      const out = cleanText(await job());
      if (out.replace(/\s/g, "").length < 10) throw new ExtractError("We could not find any text to read. Try a clearer file, or paste the text instead.");
      setText((old) => (old.trim() ? `${old.trim()}\n\n${out}` : out).slice(0, MAX_CHARS));
      setSource("paste"); // the text now sits in the box below, ready to check and fix
    } catch (e) {
      setError(e instanceof ExtractError ? e.message : "Something went wrong while reading that file. Try another file, or paste the text instead.");
    } finally {
      setBusy(null);
    }
  };

  const onProgress = (label: string, fraction: number) => setBusy({ label, fraction });

  const listen = () => {
    const clean = cleanText(text);
    const split = splitParts(clean);
    if (!split.length) return setError("Add some text first: paste it, or upload a PDF or photos.");
    setError("");
    stop();
    const detected = detectLang(clean);
    langRef.current = detected;
    setLang(detected);
    partsRef.current = split;
    setParts(split);
    goTo(0);
    refreshVoices();
    void start();
  };

  const words = wordCount(text);
  const ready = parts.length > 0;
  const noVoice = canSpeak && ready && voiceList.length === 0;

  return (
    <div className="grid items-start gap-5 text-left lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="grid gap-4">
        <Segmented<Source>
          label="Where is your text?"
          value={source}
          onChange={setSource}
          options={[
            { value: "paste", label: "Paste text" },
            { value: "pdf", label: "PDF" },
            { value: "photos", label: "Photos" },
          ]}
        />
        {source !== "paste" && (
          <>
            <Field label="Text in the pages is" hint="Pick “Hindi + English” for notes that contain Hindi. The first read downloads a small text reader.">
              <Segmented<OcrLang> label="Text language" value={ocrLang} onChange={setOcrLang} options={[{ value: "eng", label: "English" }, { value: "eng+hin", label: "Hindi + English" }]} />
            </Field>
            {busy ? (
              <div className="rounded-2xl border border-line bg-surface/40 p-5" role="status">
                <p className="m-0 text-sm font-semibold text-navy">{busy.label}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-blue-hover transition-all" style={{ width: `${Math.round(busy.fraction * 100)}%` }} />
                </div>
              </div>
            ) : source === "pdf" ? (
              <DropZone accept="application/pdf" title="Drop a PDF here" note="Typed or scanned, up to 40 MB. It never leaves your device." onFiles={(files) => run(() => extractFromPdf(files[0], ocrLang, onProgress))} />
            ) : (
              <DropZone accept="image/*" multiple title="Drop photos of your notes" note="Up to 12 photos. Printed text works best; handwriting is often unclear." onFiles={(files) => run(() => extractFromPhotos(files, ocrLang, onProgress))} />
            )}
          </>
        )}
        <Field label="Text to read" hint={`${words.toLocaleString("en-IN")} words. Fix any mistakes from a scan before you listen.`}>
          <textarea
            className={`${inputClass} h-52 resize-y py-3`}
            value={text}
            maxLength={MAX_CHARS}
            placeholder="Paste a chapter, a summary or your class notes here."
            onChange={(e) => setText(e.target.value)}
          />
        </Field>
        <Button onClick={listen} disabled={!!busy || !canSpeak} className="!min-h-14 !rounded-2xl !bg-gradient-to-br !from-blue-hover !to-violet !text-base !font-extrabold">
          {ready ? "Listen from the start" : "Listen to my notes"}
        </Button>
        {text && (
          <button type="button" onClick={() => { stop(); setText(""); setParts([]); }} className="cursor-pointer border-0 bg-transparent text-sm font-semibold text-muted hover:text-navy">Clear text</button>
        )}
        {error && <Hint error>{error}</Hint>}
        {!canSpeak && <Hint error>This browser cannot play voices. Open TopperShelf in Chrome, Edge or Safari to listen.</Hint>}
        <p className="m-0 text-center text-xs leading-5 text-muted">Free, no limits. Your notes are read on your device and never uploaded or saved.</p>
      </div>

      <section className="na-studio" aria-live="polite" aria-label="Audio player">
        {!ready ? (
          <div className="relative m-auto max-w-[32ch] text-center">
            <b className="mb-1 block font-display text-3xl font-normal">Your studio is ready.</b>
            <span className="text-sm leading-6 text-[#aab9d0]">Add your notes and press the button. They play here, one sentence at a time.</span>
          </div>
        ) : (
          <div className="relative flex flex-col">
            <div className={`na-av ${playing ? "na-talk" : ""}`} aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></svg>
            </div>
            <div className={`na-wave mt-3 ${playing ? "na-live" : ""}`} aria-hidden="true">
              {BARS.map((b, i) => (
                <i key={i} style={{ "--h": `${b.h}px`, "--d": `${b.d}ms` } as React.CSSProperties} />
              ))}
            </div>
            <p className="m-0 min-h-[5.5rem] px-1 text-center text-base leading-relaxed">{parts[idx]}</p>
            <div className="mt-3 h-1.5 rounded-full bg-white/15" role="progressbar" aria-label="Progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((elapsed / total) * 100)}>
              <div className="na-fill" style={{ width: `${(elapsed / total) * 100}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-xs text-[#aab9d0]"><span>{formatClock(elapsed)}</span><span>about {formatClock(total)}</span></div>
            <div className="mt-3 flex items-center justify-center gap-4">
              <button type="button" aria-label="Previous sentence" onClick={() => jump(idx - 1)} className="size-11 cursor-pointer rounded-full border-0 bg-white/10 text-white">⏮</button>
              <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={() => (playing ? stop() : void start())} className="size-16 cursor-pointer rounded-full border-0 bg-white text-xl text-deep shadow-lg">{playing ? "❚❚" : "▶"}</button>
              <button type="button" aria-label="Next sentence" onClick={() => jump(idx + 1)} className="size-11 cursor-pointer rounded-full border-0 bg-white/10 text-white">⏭</button>
              <button type="button" aria-label="Change speed" onClick={changeRate} className="h-11 cursor-pointer rounded-full border-0 bg-white/10 px-4 text-xs font-bold text-white">{rate}×</button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {voiceList.length > 0 && (
                <select aria-label="Voice" value={voiceName} onChange={(e) => changeVoice(e.target.value)}>
                  {voiceList.map((v) => <option key={v.name} value={v.name}>{v.name}</option>)}
                </select>
              )}
              <select aria-label="Sleep timer" value={sleep} onChange={(e) => changeSleep(Number(e.target.value))}>
                {SLEEP.map((m) => <option key={m} value={m}>{m ? `Stop in ${m} min` : "No sleep timer"}</option>)}
              </select>
              <button type="button" onClick={() => downloadBlob(new Blob([parts.join("\n")], { type: "text/plain" }), "notes.txt")} className="cursor-pointer rounded-full border border-white/25 bg-transparent px-4 py-2 text-xs font-semibold text-white hover:bg-white/10">Save text</button>
            </div>
            {noVoice && <p className="m-0 mt-3 text-center text-xs leading-5 text-[#f6c08a]">No {lang === "hi-IN" ? "Hindi" : "English"} voice was found on this device. Add one in your phone’s text-to-speech settings, or try Chrome.</p>}
            <div ref={list} className="relative mt-4 max-h-44 overflow-auto border-t border-white/10 pt-3 text-sm leading-7">
              {parts.map((p, i) => (
                <span key={i} onClick={() => jump(i)} className={`na-part ${i === idx ? "na-now" : ""}`}>{p} </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
