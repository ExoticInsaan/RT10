// Shared helpers and labels from the design's "Find My Notes" flow.

export const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

export function ordinal(number: number) {
  if (number === 1) return "1st";
  if (number === 2) return "2nd";
  if (number === 3) return "3rd";
  return `${number}th`;
}

export function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Cover colour for a resource. Subjects are typed freely by the admin, so match well-known
// words first and otherwise pick a stable colour from the subject text.
const accents = ["anatomy", "child", "community", "foundation", "mental", "nutrition", "obstetrics", "pathology", "pharma"];
const accentKeywords: [word: string, accent: string][] = [
  ["anatomy", "anatomy"],
  ["physiology", "anatomy"],
  ["pharma", "pharma"],
  ["micro", "pathology"],
  ["patho", "pathology"],
  ["fundamental", "foundation"],
  ["foundation", "foundation"],
  ["child", "child"],
  ["paediatric", "child"],
  ["pediatric", "child"],
  ["community", "community"],
  ["mental", "mental"],
  ["psych", "mental"],
  ["nutrition", "nutrition"],
  ["obstetric", "obstetrics"],
  ["midwifery", "obstetrics"],
];

// Short heading for a cover: the part of the title before " - " or ":" ("Applied Anatomy - Most
// Important Questions" becomes "Applied Anatomy"). Titles without a separator are used whole.
export function coverHeading(title: string) {
  const head = title.split(/\s[-\u2013\u2014]\s|:\s/)[0].trim();
  return head || title;
}

export function accentFor(text0: string) {
  const text = text0.toLowerCase();
  const hit = accentKeywords.find(([word]) => text.includes(word));
  if (hit) return hit[1];
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return accents[hash % accents.length];
}
