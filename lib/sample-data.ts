// Placeholder catalogue so the site looks real before Supabase is connected.
export type ProductType = "notes" | "quiz" | "test";

export type Product = {
  slug: string;
  title: string;
  type: ProductType;
  subject: string;
  course: string;
  year: string;
  price: number; // rupees
  blurb: string;
};

export const typeLabel: Record<ProductType, string> = {
  notes: "Notes",
  quiz: "Quiz",
  test: "Full test",
};

export const products: Product[] = [
  { slug: "anatomy-cardiovascular-notes", title: "Cardiovascular System: Exam Notes", type: "notes", subject: "Anatomy & Physiology", course: "GNM", year: "1st year", price: 19, blurb: "Short, diagram-led notes for university exams." },
  { slug: "fundamentals-nursing-process-quiz", title: "Nursing Process: 50-Question Quiz", type: "quiz", subject: "Fundamentals of Nursing", course: "BSc Nursing", year: "1st year", price: 19, blurb: "Every answer comes with a clear explanation." },
  { slug: "pharmacology-mock-test-1", title: "Pharmacology Mock Test 1", type: "test", subject: "Pharmacology", course: "BSc Nursing", year: "2nd year", price: 28, blurb: "Timed test with score and weak-topic report." },
  { slug: "microbiology-infection-control-notes", title: "Infection Control: Quick Revision Notes", type: "notes", subject: "Microbiology", course: "GNM", year: "1st year", price: 19, blurb: "One-night revision sheets for practical and theory." },
  { slug: "medical-surgical-respiratory-quiz", title: "Respiratory Disorders Quiz", type: "quiz", subject: "Medical-Surgical Nursing", course: "Post Basic", year: "1st year", price: 19, blurb: "Case-style questions with rationales." },
  { slug: "norcet-style-mock-test-1", title: "NORCET-Style Mock Test 1", type: "test", subject: "Exam practice", course: "BSc Nursing", year: "Final year", price: 28, blurb: "Exam-pattern questions with timer and palette." },
];
