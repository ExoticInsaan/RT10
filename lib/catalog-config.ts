// The courses and content types the shop sells. The database enforces the same values
// (see supabase/migrations/0003_admin_and_catalogue.sql), so change both together.

export type CourseValue = "bsc-nursing" | "gnm" | "post-basic";
export type TypeValue =
  | "important-questions"
  | "care-plans"
  | "case-studies"
  | "flashcards"
  | "notes"
  | "assignments"
  | "others";

export const courses: {
  value: CourseValue;
  label: string;
  termLabel: "Semester" | "Year";
  terms: number;
}[] = [
  { value: "bsc-nursing", label: "B.Sc. Nursing", termLabel: "Semester", terms: 8 },
  { value: "gnm", label: "GNM", termLabel: "Year", terms: 3 },
  { value: "post-basic", label: "Post Basic", termLabel: "Year", terms: 2 },
];

export const contentTypes: { value: TypeValue; label: string }[] = [
  { value: "important-questions", label: "Important Questions" },
  { value: "care-plans", label: "Care Plans" },
  { value: "case-studies", label: "Case Studies" },
  { value: "flashcards", label: "Flashcards" },
  { value: "notes", label: "Notes" },
  { value: "assignments", label: "Assignments" },
  { value: "others", label: "Others" },
];

export function courseLabel(value: string | null) {
  return courses.find((c) => c.value === value)?.label ?? "";
}

export function typeLabelOf(value: string | null) {
  return contentTypes.find((t) => t.value === value)?.label ?? "";
}

export function termText(course: string | null, term: number | null) {
  if (!term) return "";
  const c = courses.find((x) => x.value === course);
  return `${c?.termLabel ?? "Term"} ${term}`;
}
