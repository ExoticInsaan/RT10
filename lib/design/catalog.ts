// Shared helpers and labels from the design's "Find My Notes" flow.

export const resourceTypes = [
  "Detailed Notes",
  "Short Notes",
  "Question Banks",
  "Previous Year Papers",
  "Flashcards",
];

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

// Cover colour per subject. Subjects without a match use the default cover colour.
export const subjectAccent: Record<string, string> = {
  "Anatomy & Physiology": "anatomy",
  "Fundamentals of Nursing": "foundation",
  Pharmacology: "pharma",
  Microbiology: "pathology",
  "Medical-Surgical Nursing": "surgical",
  "Exam practice": "mental",
};
