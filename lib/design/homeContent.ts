export type Review = {
  name: string;
  initials: string;
  course: string;
  quote: string;
  subject: string;
  tone: "rose" | "blue" | "gold" | "green" | "violet" | "teal";
};

export const reviews: Review[] = [
  {
    name: "Priya Sharma",
    initials: "PS",
    course: "B.Sc. Nursing · 4th Sem",
    quote: "The important questions helped me focus on the topics that mattered most before my internal exams.",
    subject: "Important Questions",
    tone: "rose",
  },
  {
    name: "Rohit Kumar",
    initials: "RK",
    course: "B.Sc. Nursing · 2nd Sem",
    quote: "The flashcards made quick revision feel much more manageable, especially for terms I needed to recall often.",
    subject: "Flashcards",
    tone: "blue",
  },
  {
    name: "Anjali Verma",
    initials: "AV",
    course: "B.Sc. Nursing · 6th Sem",
    quote: "I like how the important questions are organized clearly. It gave my exam preparation more structure.",
    subject: "Important Questions",
    tone: "gold",
  },
  {
    name: "Sameer Patel",
    initials: "SP",
    course: "B.Sc. Nursing · 8th Sem",
    quote: "The flashcards are concise and easy to revisit between study sessions. They work well for rapid recall.",
    subject: "Flashcards",
    tone: "green",
  },
  {
    name: "Neha Singh",
    initials: "NS",
    course: "B.Sc. Nursing · 3rd Sem",
    quote: "The important questions gave me a useful starting point when I was unsure what to revise first.",
    subject: "Important Questions",
    tone: "violet",
  },
  {
    name: "Arjun Mehta",
    initials: "AM",
    course: "B.Sc. Nursing · 5th Sem",
    quote: "The flashcards are simple, focused and convenient for short revision sessions before class.",
    subject: "Flashcards",
    tone: "teal",
  },
];

export const faqs: [question: string, answer: string][] = [
  [
    "What is Toppershelf?",
    "Toppershelf is a focused marketplace for exam-ready B.Sc. Nursing notes, question banks, revision resources and previous-year papers.",
  ],
  [
    "Which nursing courses and semesters are covered?",
    "Our current library focuses on B.Sc. Nursing and includes resources organized across the 1st through 8th semesters.",
  ],
  [
    "What is included in each PDF?",
    "Each resource includes clearly structured, syllabus-focused material. The product page lists its resource type, subject and page count before you buy.",
  ],
  [
    "Are the notes aligned with my university syllabus?",
    "Resources are created around common B.Sc. Nursing syllabus topics. Please review the product details to confirm alignment with your university.",
  ],
  [
    "How do I receive my purchase?",
    "Resources are designed for instant digital delivery. Checkout is not enabled in this demo marketplace.",
  ],
  [
    "Can I preview notes before buying?",
    "Product pages provide the title, type, page count, rating and a detailed overview to help you choose the right resource.",
  ],
  [
    "What happens if my download doesn’t work?",
    "Contact our support team with your order details and we’ll help resolve access issues.",
  ],
  [
    "What is your refund policy?",
    "Digital-resource refund eligibility depends on whether the file has been accessed. Contact support so each request can be reviewed fairly.",
  ],
];
