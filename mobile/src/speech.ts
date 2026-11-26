import { Capacitor, registerPlugin, type PluginListenerHandle } from "@capacitor/core";

/**
 * Android's WebView has no `speechSynthesis`, so Notes to Audio said "open TopperShelf in Chrome".
 * This gives the app one that is backed by the phone's own text-to-speech voices (android/.../TtsPlugin.java),
 * so the website's component works unchanged. It covers what that component uses: getVoices, the
 * `voiceschanged` event, speak, cancel, and the utterance's voice, lang, rate, onend and onerror.
 * A cancelled sentence stays silent (no end or error event): the component stops playback itself before it cancels.
 */

type NativeVoice = { id: string; name: string; lang: string; local: boolean; quality: number };
type TtsEvent = { id: string };

export const Tts = registerPlugin<{
  voices(): Promise<{ ready: boolean; failed: boolean; voices: NativeVoice[] }>;
  speak(o: { id: string; text: string; lang?: string; voice?: string; rate?: number; pitch?: number }): Promise<void>;
  stop(): Promise<void>;
  synthesize(o: { id: string; text: string; lang?: string; voice?: string; rate?: number }): Promise<void>;
  takeFile(o: { id: string }): Promise<{ data: string }>;
  addListener(event: "ttsDone" | "ttsError", cb: (e: TtsEvent) => void): Promise<PluginListenerHandle>;
}>("Tts");

type Handler = ((e: SpeechSynthesisEvent) => void) | null;

class NativeUtterance {
  text: string;
  lang = "";
  voice: SpeechSynthesisVoice | null = null;
  rate = 1;
  pitch = 1;
  volume = 1;
  onstart: Handler = null;
  onend: Handler = null;
  onerror: Handler = null;
  constructor(text = "") {
    this.text = String(text);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

class NativeSpeech extends EventTarget {
  paused = false;
  onvoiceschanged: ((e: Event) => void) | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private started = false;
  private queue: NativeUtterance[] = [];
  private current: { u: NativeUtterance; id: string } | null = null;
  private seq = 0;

  get speaking() {
    return this.current !== null;
  }
  get pending() {
    return this.queue.length > 0;
  }

  getVoices() {
    if (!this.started) {
      this.started = true;
      void this.load();
    }
    return this.voices;
  }

  /** The phone's engine can take a few seconds to start, so ask again until it is ready. */
  private async load() {
    for (let i = 0; i < 24; i++) {
      try {
        const r = await Tts.voices();
        if (r.failed) break;
        if (r.ready) {
          this.voices = this.toVoices(r.voices);
          const event = new Event("voiceschanged");
          this.onvoiceschanged?.(event);
          this.dispatchEvent(event);
          return;
        }
      } catch {
        break;
      }
      await sleep(250);
    }
    this.started = false; // nothing came back: the next getVoices() tries again
  }

  /** Own voices first, best quality first, and a unique readable name for each (the page uses the name as the key). */
  private toVoices(list: NativeVoice[]) {
    const sorted = [...list].sort((a, b) => Number(b.local) - Number(a.local) || b.quality - a.quality);
    const total = new Map<string, number>();
    const label = (v: NativeVoice) => `${v.name || v.lang}${v.local ? "" : " (needs internet)"}`;
    sorted.forEach((v) => total.set(label(v), (total.get(label(v)) ?? 0) + 1));
    const seen = new Map<string, number>();
    return sorted.map((v) => {
      const base = label(v);
      const n = (seen.get(base) ?? 0) + 1;
      seen.set(base, n);
      return { name: total.get(base)! > 1 ? `${base} ${n}` : base, lang: v.lang, voiceURI: v.id, default: false, localService: v.local } as SpeechSynthesisVoice;
    });
  }

  speak(u: NativeUtterance) {
    this.queue.push(u);
    this.pump();
  }

  cancel() {
    this.queue = [];
    this.current = null;
    void Tts.stop().catch(() => undefined);
  }

  pause() {
    /* not used by the page */
  }
  resume() {
    /* not used by the page */
  }

  private pump() {
    if (this.current) return;
    const u = this.queue.shift();
    if (!u) return;
    const id = `u${++this.seq}`;
    this.current = { u, id };
    u.onstart?.(this.event("start", u));
    Tts.speak({ id, text: u.text, lang: u.voice?.lang || u.lang || undefined, voice: u.voice?.voiceURI || undefined, rate: u.rate, pitch: u.pitch }).catch(() => this.finish(id, true));
  }

  finish(id: string, failed: boolean) {
    if (this.current?.id !== id) return; // an older or cancelled sentence
    const { u } = this.current;
    this.current = null;
    (failed ? u.onerror : u.onend)?.(this.event(failed ? "error" : "end", u));
    this.pump();
  }

  private event(type: string, u: NativeUtterance) {
    return { type, utterance: u, charIndex: 0, elapsedTime: 0 } as unknown as SpeechSynthesisEvent;
  }
}

/** Call once at start-up. Does nothing in a normal browser, where the real speechSynthesis works. */
export function installNativeSpeech() {
  if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable("Tts")) return;
  const speech = new NativeSpeech();
  void Tts.addListener("ttsDone", (e) => speech.finish(e.id, false));
  void Tts.addListener("ttsError", (e) => speech.finish(e.id, true));
  // Replace it even if the WebView has a stand-in: those exist on some phones but never speak.
  Object.defineProperty(window, "speechSynthesis", { value: speech, configurable: true, writable: true });
  Object.defineProperty(window, "SpeechSynthesisUtterance", { value: NativeUtterance, configurable: true, writable: true });
}
