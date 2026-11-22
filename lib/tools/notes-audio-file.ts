// Notes to Audio: makes a downloadable audio file (WAV) inside the user's own browser with the free Kokoro voice model.
// Nothing is uploaded, nothing is saved on our servers and no database is used. The voice model (about 90 MB) is fetched
// once from Hugging Face and then kept by the browser, so later downloads work without fetching it again.

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const READY_KEY = "ts-kokoro-ready";
const SAMPLE_RATE = 24_000;

/** Longest text turned into one audio file. About 15 minutes of speech (a 40 MB file) keeps phones from running out of memory. */
export const FILE_MAX_CHARS = 15_000;

export const FILE_VOICES = [
  { id: "af_heart", label: "Heart (US woman)" },
  { id: "af_bella", label: "Bella (US woman)" },
  { id: "am_michael", label: "Michael (US man)" },
  { id: "bf_emma", label: "Emma (UK woman)" },
  { id: "bm_george", label: "George (UK man)" },
] as const;

type Tts = { generate: (text: string, options: { voice: string; speed?: number }) => Promise<{ audio: Float32Array; sampling_rate: number }> };

let loading: Promise<Tts> | null = null;

/** True once the voice model has been fetched on this device (so no big download is needed). */
export function voiceModelReady() {
  try {
    return localStorage.getItem(READY_KEY) === "1";
  } catch {
    return false;
  }
}

/** Loads the voice model once and reuses it. `onProgress` gets 0 to 100 while the model is fetched the first time. */
export function loadVoice(onProgress?: (percent: number) => void): Promise<Tts> {
  if (!loading) {
    loading = (async () => {
      const { KokoroTTS } = await import("kokoro-js");
      const files = new Map<string, { loaded: number; total: number }>();
      const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: "q8",
        device: "wasm",
        progress_callback: (p: { status?: string; file?: string; loaded?: number; total?: number }) => {
          if (p.status !== "progress" || !p.file || !p.total) return;
          files.set(p.file, { loaded: p.loaded ?? 0, total: p.total });
          let loaded = 0;
          let total = 0;
          files.forEach((f) => {
            loaded += f.loaded;
            total += f.total;
          });
          onProgress?.(Math.min(100, Math.round((loaded / total) * 100)));
        },
      });
      try {
        localStorage.setItem(READY_KEY, "1");
      } catch {
        /* storage blocked: the file still works, it just asks again next time */
      }
      return tts as unknown as Tts;
    })().catch((error) => {
      loading = null; // let the person try again after a failed download
      throw error;
    });
  }
  return loading;
}

function floatToPcm16(samples: Float32Array) {
  const out = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function wavFile(chunks: Int16Array[], sampleRate: number) {
  const length = chunks.reduce((sum, c) => sum + c.length, 0);
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const write = (offset: number, text: string) => [...text].forEach((ch, i) => view.setUint8(offset + i, ch.charCodeAt(0)));
  write(0, "RIFF");
  view.setUint32(4, 36 + length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // plain PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, length * 2, true);
  return new Blob([header, ...(chunks as BlobPart[])], { type: "audio/wav" });
}

/** Reads each part aloud into one WAV file. Lets the screen breathe between parts so the page never freezes. */
export async function makeAudioFile(opts: {
  parts: string[];
  voice: string;
  speed: number;
  onProgress: (done: number, total: number) => void;
  onModelProgress?: (percent: number) => void;
  isCancelled: () => boolean;
}) {
  const { parts, voice, speed, onProgress, onModelProgress, isCancelled } = opts;
  const tts = await loadVoice(onModelProgress);
  const chunks: Int16Array[] = [];
  const pause = new Int16Array(Math.round(SAMPLE_RATE * 0.18)); // a short breath between sentences
  let rate = SAMPLE_RATE;
  onProgress(0, parts.length);
  for (let i = 0; i < parts.length; i++) {
    if (isCancelled()) return null;
    const result = await tts.generate(parts[i], { voice, speed });
    rate = result.sampling_rate || SAMPLE_RATE;
    chunks.push(floatToPcm16(result.audio), pause);
    onProgress(i + 1, parts.length);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return wavFile(chunks, rate);
}
