// Written content for tool pages. It feeds the "How to use" steps, the FAQ, the trust note and the
// structured data Google reads. A tool with no entry here simply shows no extra sections, so nothing is invented.
//
// To add content for a new tool, add an entry to `toolContent` keyed by the tool id from registry.ts. Only write what is
// true: for example, only add `privacyNote` saying files stay on the device if the tool really works that way.

export type ToolContent = {
  /** 3 to 5 short steps. */
  howTo: string[];
  /** 3 to 5 real questions with plain answers. */
  faq: { q: string; a: string }[];
  /** One short, TRUE line shown in a "Good to know" box. */
  privacyNote?: string;
};

const funNote = "We don’t save what you type. It only appears in the link to your result.";

export const toolContent: Record<string, ToolContent> = {
  "how-cooked": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Type your name.",
      "Press “Reveal my result” and read the verdict.",
      "Download the story-sized card or copy the link to share it.",
    ],
    faq: [
      { q: "Is the result real?", a: "No. It is a joke made for fun. It is not a real measure of you or your workload." },
      { q: "Why do I always get the same result?", a: "The result is worked out from the name you type, so the same name always gives the same answer. Try another name or spelling for a different one." },
      { q: "Can I share my result?", a: "Yes. Every result has a card sized for stories (1080 × 1920) that you can download, and a link you can copy." },
      { q: "Do you save my name?", a: "No. Your name only appears in the result link that you choose to share." },
    ],
    privacyNote: funNote,
  },
  "excuse-generator": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Describe the situation, for example “missing the 8am class”.",
      "Press “Make my excuse”.",
      "Not happy with it? Press “Roll again” for a new one, then download or share the card.",
    ],
    faq: [
      { q: "Will these excuses actually work?", a: "They are made up for fun, and each one comes with a silly believability score. Please be honest with the people who matter." },
      { q: "Can I get a different excuse for the same situation?", a: "Yes. Use “Roll again” on the result page and you will get a new one." },
      { q: "Can I share the excuse?", a: "Yes. Download the card or copy the link from the result page." },
      { q: "Do you save what I type?", a: "No. What you type only appears in the result link that you choose to share." },
    ],
    privacyNote: funNote,
  },
  "roast-my-timetable": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Describe your day in a line or two, for example “6 classes, no breaks, sleep at 2am”.",
      "Press “Roast it” and read the verdict.",
      "Roll again for a new roast, or download the card to share.",
    ],
    faq: [
      { q: "Is the roast serious?", a: "No. It is a friendly joke and the score is made up." },
      { q: "Does it read my real timetable file?", a: "No. You describe your day in words and it picks a roast to match. Nothing is uploaded." },
      { q: "Can I share it?", a: "Yes. Download the story-sized card or copy the link." },
      { q: "Do you save what I type?", a: "No. What you type only appears in the result link that you choose to share." },
    ],
    privacyNote: funNote,
  },
  "vibe-check": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Type your name.",
      "Press “Check the vibe” to see today’s reading.",
      "Download the card or copy the link to share it.",
    ],
    faq: [
      { q: "Why does my vibe change every day?", a: "The reading is worked out from your name and today’s date, so it changes daily. Check back tomorrow." },
      { q: "Is the vibe reading real?", a: "No. It is just for fun." },
      { q: "Can I share my vibe?", a: "Yes. Download the story-sized card or copy the link." },
      { q: "Do you save my name?", a: "No. Your name only appears in the result link that you choose to share." },
    ],
    privacyNote: funNote,
  },
};
