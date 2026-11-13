// Notes to Audio: text helpers. Everything runs in the browser; the text is read aloud by the device's own voices
// (Web Speech API), so nothing is uploaded, generated on a server or stored.

export const MAX_CHARS = 100_000;

/** Tidies text from a PDF or photo: joins words split by a line-end hyphen and turns single line breaks into spaces. */
export function cleanText(raw: string) {
  return raw
    .replace(/\r/g, "")
    .replace(/(\p{L})-\n(\p{Ll})/gu, "$1$2")
    .replace(/[ \t]+/g, " ")
    .replace(/([^\n])\n(?!\n)(?=[^\n])/g, "$1 ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Splits text into short spoken parts (sentences; very long ones are cut at a comma or space), so speech starts fast. */
export function splitParts(text: string, maxLength = 220) {
  const parts: string[] = [];
  for (const paragraph of text.split(/\n{2,}/)) {
    const sentences = paragraph.match(/[^.!?।\n]+[.!?।]*["”’)]*\s*/g) ?? [];
    for (const sentence of sentences) {
      let rest = sentence.trim();
      while (rest.length > maxLength) {
        let cut = rest.lastIndexOf(",", maxLength);
        if (cut < maxLength / 2) cut = rest.lastIndexOf(" ", maxLength);
        if (cut < 1) cut = maxLength;
        parts.push(rest.slice(0, cut + 1).trim());
        rest = rest.slice(cut + 1).trim();
      }
      if (rest) parts.push(rest);
    }
  }
  return parts.filter((p) => /[\p{L}\p{N}]/u.test(p));
}

/** "hi-IN" when most letters are Devanagari, otherwise "en-IN". */
export function detectLang(text: string) {
  const letters = text.match(/\p{L}/gu)?.length ?? 0;
  const deva = text.match(/[\u0900-\u097F]/g)?.length ?? 0;
  return letters && deva / letters > 0.3 ? "hi-IN" : "en-IN";
}

export const wordCount = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

/** Speaking time of a part in seconds (about 2.6 words a second at normal speed). */
export const partSeconds = (text: string, rate = 1) => Math.max(1.2, wordCount(text) / 2.6 / rate);

export function formatClock(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}` : `${m}:${String(s % 60).padStart(2, "0")}`;
}

/** Voices that match the language (Hindi, or any English), best first (Google and Microsoft neural voices lead). */
export function voicesFor(all: SpeechSynthesisVoice[], lang: string) {
  const base = lang.slice(0, 2).toLowerCase();
  const rank = (v: SpeechSynthesisVoice) => (/natural|neural|google|online/i.test(v.name) ? 0 : 1) + (v.lang.toLowerCase().replace("_", "-") === lang.toLowerCase() ? 0 : 0.5);
  return all.filter((v) => v.lang.toLowerCase().startsWith(base)).sort((a, b) => rank(a) - rank(b));
}
