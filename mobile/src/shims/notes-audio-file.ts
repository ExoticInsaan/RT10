import { Tts } from "../speech";

/**
 * The app's version of lib/tools/notes-audio-file.ts (the website keeps its own).
 * The website makes the audio file with a 90 MB voice model fetched from the internet. Here the phone's own
 * text-to-speech voice saves each sentence as sound, so there is nothing to download and it works offline.
 * Same exports as the website file, so Notes to Audio runs unchanged.
 */

export const FILE_MAX_CHARS = 15_000;

export const FILE_VOICES: ReadonlyArray<{ id: string; label: string }> = [{ id: "phone", label: "Phone voice (no download)" }];

/** Nothing to fetch first, so the page never shows the "one-time download" question. */
export function voiceModelReady() {
  return true;
}

type Wav = { rate: number; channels: number; pcm: Int16Array };

/** Reads a WAV file made by the phone's engine. Only plain 16-bit sound is accepted. */
function readWav(base64: string): Wav {
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  const view = new DataView(bytes.buffer);
  const tag = (at: number) => String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);
  if (bytes.length < 44 || tag(0) !== "RIFF" || tag(8) !== "WAVE") throw new Error("Not a WAV file");
  let rate = 0;
  let channels = 1;
  let format = 0;
  let bits = 0;
  let at = 12;
  while (at + 8 <= bytes.length) {
    const name = tag(at);
    const size = view.getUint32(at + 4, true);
    if (name === "fmt ") {
      format = view.getUint16(at + 8, true);
      channels = view.getUint16(at + 10, true);
      rate = view.getUint32(at + 12, true);
      bits = view.getUint16(at + 22, true);
    } else if (name === "data") {
      if (format !== 1 || bits !== 16 || !rate) throw new Error("Unsupported sound format");
      const start = at + 8;
      // Some engines leave the size empty while writing: then the sound runs to the end of the file.
      const end = size === 0 || start + size > bytes.length ? bytes.length : start + size;
      const count = Math.floor((end - start) / 2);
      const pcm = new Int16Array(count);
      for (let i = 0; i < count; i++) pcm[i] = view.getInt16(start + i * 2, true);
      return { rate, channels: channels || 1, pcm };
    }
    at += 8 + size + (size % 2);
  }
  throw new Error("No sound in the file");
}

function wavFile(chunks: Int16Array[], rate: number, channels: number) {
  const length = chunks.reduce((sum, c) => sum + c.length, 0);
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const write = (offset: number, text: string) => [...text].forEach((ch, i) => view.setUint8(offset + i, ch.charCodeAt(0)));
  write(0, "RIFF");
  view.setUint32(4, 36 + length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, length * 2, true);
  return new Blob([header, ...(chunks as BlobPart[])], { type: "audio/wav" });
}

/** Waits until the phone says the sentence is saved (or failed). */
function saved(id: string) {
  return new Promise<void>((resolve, reject) => {
    const handles: Array<{ remove: () => Promise<void> }> = [];
    const timer = setTimeout(() => done(new Error("Timed out")), 60_000);
    const done = (error?: Error) => {
      clearTimeout(timer);
      handles.forEach((h) => void h.remove().catch(() => undefined));
      if (error) reject(error);
      else resolve();
    };
    void Tts.addListener("ttsDone", (e) => e.id === id && done()).then((h) => handles.push(h));
    void Tts.addListener("ttsError", (e) => e.id === id && done(new Error("The phone could not make the audio"))).then((h) => handles.push(h));
  });
}

/** Saves each part as sound with the phone's voice and joins them into one WAV file. */
export async function makeAudioFile(opts: {
  parts: string[];
  voice: string;
  speed: number;
  onProgress: (done: number, total: number) => void;
  onModelProgress?: (percent: number) => void;
  isCancelled: () => boolean;
}) {
  const { parts, speed, onProgress, isCancelled } = opts;
  const chunks: Int16Array[] = [];
  let rate = 0;
  let channels = 1;
  onProgress(0, parts.length);
  for (let i = 0; i < parts.length; i++) {
    if (isCancelled()) return null;
    const id = `f${Date.now()}-${i}`;
    // Listen before asking, so a very quick sentence cannot finish unheard.
    const finished = saved(id);
    finished.catch(() => undefined);
    await Tts.synthesize({ id, text: parts[i], lang: "en-IN", rate: speed });
    await finished;
    const wav = readWav((await Tts.takeFile({ id })).data);
    if (!rate) {
      rate = wav.rate;
      channels = wav.channels;
    } else if (wav.rate !== rate || wav.channels !== channels) {
      throw new Error("The phone changed its voice settings part-way");
    }
    chunks.push(wav.pcm, new Int16Array(Math.round(rate * channels * 0.18))); // a short breath between sentences
    onProgress(i + 1, parts.length);
  }
  return wavFile(chunks, rate, channels);
}
