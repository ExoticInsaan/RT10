// Blog posts for the study-guide section (/blog). Plain data, so adding a post means adding one
// object here: it then appears on /blog, gets its own page, and is added to the sitemap.

export type PostSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  ordered?: boolean;
  after?: string[]; // paragraphs shown after the list
};

export type Post = {
  slug: string;
  title: string;
  description: string; // shown under the title in Google, keep under about 155 characters
  date: string; // YYYY-MM-DD
  intro: string;
  sections: PostSection[];
  cta: { text: string; label: string; href: string };
};

export const AUTHOR = "Toppershelf Team";

export const posts: Post[] = [
  {
    slug: "how-to-study-for-bsc-nursing-exams",
    title: "How to Study for B.Sc. Nursing Exams: A Simple Weekly Plan",
    description:
      "A practical weekly plan for B.Sc. Nursing students: how to split subjects, revise in cycles, practise writing answers and avoid last-minute stress.",
    date: "2026-10-20",
    intro:
      "B.Sc. Nursing has many subjects, practicals and internal assessments running at the same time. Most students do not fail because they are lazy. They struggle because they have no system. This guide gives you a simple weekly routine you can adjust to your own college timetable.",
    sections: [
      {
        heading: "Start from the syllabus, not from the textbook",
        paragraphs: [
          "Get the latest syllabus for each subject from your college or university. List every unit and topic on one page. Next to each topic, mark it as strong, medium or weak. This short list becomes your map for the whole semester, and it stops you from spending three days on a topic you already know.",
        ],
      },
      {
        heading: "A weekly rhythm that is easy to follow",
        paragraphs: ["Use this as a starting point and change the timings to fit your classes and clinical postings."],
        list: [
          "Weekdays: after college, do one or two focused study blocks of about 60 to 90 minutes. Pick one subject per block, so your mind is not jumping around.",
          "Saturday: revise what you studied during the week and practise writing answers on paper.",
          "Sunday: do a light review of weak topics, prepare for the coming week and take real rest.",
        ],
      },
      {
        heading: "Study actively, not just by reading",
        paragraphs: [
          "Reading a chapter again and again feels productive, but research on learning keeps finding that testing yourself works better. After reading a topic, close the book and write down everything you remember. Then check what you missed.",
          "Also space your revision. Revisit a topic the next day, then after about a week, then after about a month. Short, repeated revisions stay in memory far better than one long session before the exam.",
        ],
      },
      {
        heading: "Practise writing, because exams are written",
        paragraphs: [
          "Many students know the answer but lose marks because they never practised writing it in the time allowed. Once a week, pick a question and answer it by hand with a timer. Compare it with your notes and fix the gaps. Our guide to writing long answers, linked at the end of this post, gives you a structure you can reuse.",
        ],
      },
      {
        heading: "Do not neglect internals, records and practicals",
        paragraphs: [
          "Keep your record books, assignments and clinical files up to date as you go. Leaving them for the last week is one of the most common causes of stress. A little each week is far easier than everything at once.",
        ],
      },
      {
        heading: "Protect your sleep and breaks",
        paragraphs: [
          "Sleep is when your brain stores what you learned. Short breaks every hour, some movement and regular meals will help you study better than extra hours of tired reading.",
        ],
      },
    ],
    cta: {
      text: "Looking for exam-focused material to go with your plan? Browse important questions and notes organized by course and semester.",
      label: "Browse B.Sc. Nursing resources",
      href: "/browse?course=bsc-nursing",
    },
  },
  {
    slug: "how-to-use-important-questions-nursing-exams",
    title: "How to Use Important Questions to Prepare for Nursing Exams",
    description:
      "Important questions can save time, but only if you use them well. Learn a simple method to practise them without skipping the syllabus.",
    date: "2026-10-20",
    intro:
      "Important questions are popular with nursing students for a good reason: they show you where to focus. But used the wrong way, they can leave gaps in your preparation. Here is how to get the benefit without the risk.",
    sections: [
      {
        heading: "What important questions are good for",
        paragraphs: [
          "Important questions are usually based on topics that have appeared often in earlier papers or that carry a lot of weight in the syllabus. They help you decide what to study first when time is short, and they show you the kind of question you will be asked.",
        ],
      },
      {
        heading: "What they cannot do",
        paragraphs: [
          "No list can predict a paper exactly. Question patterns change, and examiners can ask from any unit. Treat important questions as a priority list, not as the whole syllabus. Make sure you have at least read every unit once.",
        ],
      },
      {
        heading: "A simple five-step method",
        ordered: true,
        list: [
          "Read the topic once from your textbook or class notes so that you understand it.",
          "Look at the question and try to answer it from memory, on paper, without looking.",
          "Check your answer against your notes or a reliable source and mark what you missed.",
          "Add the missing points in a different colour so you can see your weak spots at a glance.",
          "Come back after a few days and answer the same question again.",
        ],
      },
      {
        heading: "Sort questions by marks and by difficulty",
        paragraphs: [
          "Group questions into long answers, short answers and very short answers. Long answers need structure and diagrams, short answers need clear key points, and very short answers need exact definitions. Spend your practice time in proportion to the marks each type carries in your university pattern.",
        ],
      },
      {
        heading: "Use them for revision, not for first-time learning",
        paragraphs: [
          "Important questions work best in the last few weeks before an exam, when you already know the basics. If you meet a topic for the first time through a question list, you will memorise answers without understanding them, and that breaks down the moment the question is worded differently.",
        ],
      },
    ],
    cta: {
      text: "Toppershelf has Most Important Questions for several B.Sc. Nursing subjects, organized by semester.",
      label: "See important questions",
      href: "/browse?type=important-questions",
    },
  },
  {
    slug: "bsc-nursing-first-year-how-to-start",
    title: "B.Sc. Nursing First Year: How to Start Without Feeling Lost",
    description:
      "Starting B.Sc. Nursing? Here is how to handle first-semester subjects, new terminology, anatomy diagrams and communicative English from day one.",
    date: "2026-10-20",
    intro:
      "The first semester of B.Sc. Nursing can feel overwhelming. There are new subjects, unfamiliar medical words and a hostel or college routine to adjust to. The good news is that a few habits in the first weeks make the next four years much easier.",
    sections: [
      {
        heading: "Know your subjects early",
        paragraphs: [
          "Subjects differ between universities, so check the syllabus your college follows. First-semester papers usually include subjects such as Applied Anatomy and Communicative English. Ask your seniors which topics take the most time, and plan around them.",
        ],
      },
      {
        heading: "Learn medical terminology in small pieces",
        paragraphs: [
          "Medical words look long, but they are built from small parts: roots, prefixes and suffixes. Learn a few every day, for example five new word parts, and write a short example for each. After a month you will recognise many new terms without memorising them one by one.",
        ],
      },
      {
        heading: "Make anatomy visual",
        list: [
          "Draw each diagram yourself, then label it from memory.",
          "Use colours for different systems or structures.",
          "Say the names aloud while you draw, so that you link the sight and the sound.",
          "Revise one system every few days instead of leaving it for the exam month.",
        ],
      },
      {
        heading: "Treat Communicative English as a daily habit",
        paragraphs: [
          "English is not only a subject. It is how you will speak to patients, doctors and colleagues. Read a short article every day, write three or four sentences about your day, and speak with classmates in simple English. Small daily practice beats cramming grammar rules.",
        ],
      },
      {
        heading: "Keep one good notebook system",
        paragraphs: [
          "Decide early how you will keep notes: one notebook per subject, with the date and unit name on every page. Neat notes saved now are a huge help at revision time.",
        ],
      },
      {
        heading: "Do not compare yourself with others",
        paragraphs: [
          "Everyone learns at a different speed. If you are stuck, ask a teacher or a senior. Asking early is a sign of a serious student, not a weak one.",
        ],
      },
    ],
    cta: {
      text: "Find first-semester practice material, such as Applied Anatomy and Communicative English important questions.",
      label: "Browse Semester 1",
      href: "/browse?course=bsc-nursing&term=1",
    },
  },
  {
    slug: "how-to-write-long-answers-nursing-exams",
    title: "How to Write Long Answers in Nursing Exams That Score Marks",
    description:
      "A clear structure for long answers in nursing exams: what to include, how to present it, and how to manage your time on 10-mark questions.",
    date: "2026-10-20",
    intro:
      "A long answer is not a place to write everything you know. It is a place to show the examiner that you know the right things, in a clear order. A fixed structure helps you do that, even when you are nervous.",
    sections: [
      {
        heading: "A structure for disease and condition questions",
        paragraphs: ["Many long questions about a condition can be answered in this order. Include only the parts the question asks for."],
        ordered: true,
        list: [
          "Definition: one or two clear lines.",
          "Causes and risk factors.",
          "Signs and symptoms (clinical manifestations).",
          "Diagnostic evaluation: the main investigations.",
          "Medical and surgical management.",
          "Nursing management: assessment, nursing diagnoses, interventions and evaluation.",
          "Complications.",
          "Health education and prevention.",
        ],
      },
      {
        heading: "Use the nursing process for nursing management",
        paragraphs: [
          "When the question asks for nursing management or a nursing care plan, follow the nursing process: assessment, diagnosis, planning, implementation and evaluation. Writing in this order shows the examiner that you think like a nurse, not only like a student who has memorised a disease.",
        ],
      },
      {
        heading: "Make the answer easy to read",
        list: [
          "Write a heading for each part and underline key terms.",
          "Use short points rather than long paragraphs.",
          "Add a neat, labelled diagram or flowchart where it fits, since it often saves many lines of text.",
          "Leave a little space between sections so that the page looks organized.",
        ],
      },
      {
        heading: "Manage your time",
        paragraphs: [
          "Look at the marks and the time for each question before you start. Give more space to parts that carry more marks, and do not spend half the time on the introduction. If you run short, write the remaining headings with key points instead of leaving them blank.",
        ],
      },
      {
        heading: "Practise before the exam",
        paragraphs: [
          "Choose one question a day, set a timer and write the answer by hand. Then compare it with your notes. Marking schemes differ between universities, so check how your own university awards marks and practise in that pattern.",
        ],
      },
    ],
    cta: {
      text: "Practise with exam-focused questions for your semester and compare your answers with your notes.",
      label: "Browse important questions",
      href: "/browse?type=important-questions",
    },
  },
  {
    slug: "how-to-write-a-nursing-care-plan",
    title: "How to Write a Nursing Care Plan: Step by Step",
    description:
      "Learn how to write a nursing care plan using the nursing process: assessment, nursing diagnosis, goals, interventions with rationale, and evaluation.",
    date: "2026-10-20",
    intro:
      "Care plans are a core part of nursing education, and every nursing student has to write many of them. They look difficult at first, but they follow the same five steps every time. Once you know the pattern, you can write one for any patient problem.",
    sections: [
      {
        heading: "Step 1: Assessment",
        paragraphs: [
          "Collect information about the patient. Subjective data is what the patient tells you, such as pain or worry. Objective data is what you can observe or measure, such as vital signs, wound appearance or lab results. Write both clearly, because everything else depends on them.",
        ],
      },
      {
        heading: "Step 2: Nursing diagnosis",
        paragraphs: [
          "A nursing diagnosis names the patient's problem and its cause. A common way to write it is: problem, related to cause, as evidenced by signs and symptoms. For example: Acute pain related to surgical incision, as evidenced by a pain score of 7 out of 10 and guarding of the abdomen.",
        ],
      },
      {
        heading: "Step 3: Goals and expected outcomes",
        paragraphs: [
          "Goals say what you want to achieve. Good goals are specific, measurable and have a time limit. For the example above: the patient will report a pain score of 3 or less within one hour of the intervention.",
        ],
      },
      {
        heading: "Step 4: Interventions with rationale",
        paragraphs: ["Write the actions you will take, and for each one give a short reason (the rationale). Examiners look for the rationale. For the same example:"],
        list: [
          "Assess pain using a pain scale: to measure the problem and track change.",
          "Give the prescribed analgesic on time: to relieve pain as ordered by the doctor.",
          "Help the patient into a comfortable position and support the incision: to reduce strain on the wound.",
          "Teach slow, deep breathing and relaxation: to lower anxiety, which can make pain feel worse.",
        ],
      },
      {
        heading: "Step 5: Evaluation",
        paragraphs: [
          "Check whether the goal was met, partly met or not met, and say what you will do next. For example, if the pain score is still above 3, report it to the doctor or review the plan.",
        ],
        after: [
          "This is a learning example. Always follow the care plan format and the drug orders used by your college and hospital.",
        ],
      },
    ],
    cta: {
      text: "Looking for care plans and case studies for your course? Browse what is available on Toppershelf.",
      label: "Browse nursing resources",
      href: "/browse",
    },
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

// Words in the whole post, used for the "x min read" label.
export function readMinutes(post: Post): number {
  const text = [
    post.intro,
    ...post.sections.flatMap((s) => [
      s.heading,
      ...(s.paragraphs ?? []),
      ...(s.list ?? []),
      ...(s.after ?? []),
    ]),
  ].join(" ");
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
