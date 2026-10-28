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

// ---- The Shelf ----
const deviceNote = "Your files never leave your device. Everything happens in your browser, so nothing is uploaded.";
const typedNote = "Nothing you type is sent anywhere. It is worked out in your browser.";
const savedNote = "Saved in your TopperShelf account, so it follows you to any device. Only you can see it, and you can delete your account any time.";

const shelfContent: Record<string, ToolContent> = {
  "pdf-toolkit": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Choose what to do: Merge, Compress, Images → PDF, Edit PDF, Split or PDF → JPG.",
      "Drop in your files and arrange them if needed.",
      "Press the button and download the result.",
    ],
    faq: [
      { q: "Are my PDFs uploaded to a server?", a: "No. Every PDF is read and saved by your own browser, so your documents never leave your device." },
      { q: "How much does Compress shrink a PDF?", a: "It works best on scanned documents and photo-heavy PDFs, which often shrink by 80% or more. Each page becomes an image, so text in the result can't be selected. If the result isn't smaller, the tool tells you to keep your original." },
      { q: "How do I add a page to a PDF?", a: "Choose Edit PDF and open your PDF. Under Add pages, pick a blank page, photos or scans, or pages from another PDF, choose where they go, then save the edited PDF. You can also remove, turn and reorder pages there." },
      { q: "How do I pick pages when splitting?", a: "Type pages and ranges such as 1-3, 5 or 4- (page 4 to the end). Pages come out in the order you type them. You can also save every page as its own PDF." },
      { q: "Does it work with password-protected PDFs?", a: "No. Remove the password first (open it and save a copy without one), then try again." },
    ],
    privacyNote: deviceNote,
  },
  "image-compressor": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Drop in a JPG, PNG or WebP photo or signature.",
      "Pick the size limit, such as 20 KB or 50 KB, and set exact pixels if the form asks for them.",
      "Press Compress image and download the JPG.",
    ],
    faq: [
      { q: "Will the image really be under the size I choose?", a: "Yes. The tool tries quality levels until the file fits under your limit. If it can't fit at the pixel size you set, it says so and shows the smallest it could get." },
      { q: "How do I resize a photo to 200 × 230 pixels for a form?", a: "Choose Set exact pixels and enter the width and height. The picture is stretched to that exact size, so crop it to roughly that shape first for the best look." },
      { q: "Why is the result a JPG?", a: "Exam and job portals almost always ask for JPG, and JPG gets photos smallest. Transparent backgrounds become white." },
      { q: "Can I compress iPhone HEIC photos?", a: "Browsers can't open HEIC files. Share the photo as a JPG from the Photos app first (or set the camera to Most Compatible), then compress it here." },
    ],
    privacyNote: deviceNote,
  },
  "focus-timer": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Press Start for a 25-minute focus session.",
      "When the chime plays, take the short break. Every fourth break is a long one.",
      "Change the times if 25 minutes doesn't suit you.",
    ],
    faq: [
      { q: "Does the timer keep going if I switch tabs?", a: "Yes. It counts against the clock, so it stays accurate in the background and the tab title shows the time left. Keep the tab open." },
      { q: "Can I change the session lengths?", a: "Yes. Use Change times to set focus, short break, long break and how many sessions come before a long break. Your times are remembered." },
      { q: "Will it notify me when time is up?", a: "It plays a chime. Turn on Notify me when time's up to also get a notification from your browser." },
      { q: "Does skipping count as a session?", a: "No. Only focus sessions you finish count towards today's total." },
    ],
    privacyNote: savedNote,
  },
  "flashcard-maker": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Create a deck and add cards one by one, or paste a whole list at once.",
      "Press Study, tap a card to see the answer, then mark Got it or Again.",
      "Cards marked Again come back until you know them all.",
    ],
    faq: [
      { q: "How do I add many cards quickly?", a: "Use Paste many at once and write one card per line as question - answer, question: answer, or paste two columns from a spreadsheet." },
      { q: "Where are my decks saved?", a: "In your TopperShelf account, so your decks are there on any phone or computer you sign in on. Only you can see them." },
      { q: "How does study mode decide the order?", a: "Cards are shuffled each time. A card you mark Again comes back a few cards later, until every card is marked Got it." },
    ],
    privacyNote: savedNote,
  },
  "cgpa-calculator": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Choose CGPA → %, % → CGPA, SGPAs → CGPA, or Marks → %.",
      "Enter your numbers and, for CGPA, pick the rule your board or university uses.",
      "Read your result. It updates as you type.",
    ],
    faq: [
      { q: "How do I convert CGPA to percentage?", a: "It depends on who awarded it. CBSE and UGC use CGPA × 9.5. AICTE uses (CGPA − 0.75) × 10. Anna University and AKTU use CGPA × 10, and Mumbai University uses 7.1 × CGPA + 11. Pick yours from the list." },
      { q: "My university uses a different formula. What should I do?", a: "Choose Custom multiplier and enter the number printed on your marksheet. The rule on your marksheet or in your university's regulations is always the official figure." },
      { q: "How is CGPA calculated from SGPAs?", a: "Add each semester's SGPA. With credits for every semester, CGPA is the credit-weighted average, which is how most universities calculate it. Without credits, each semester counts equally." },
      { q: "How do I get my percentage from marks?", a: "Choose Marks → %, then add each subject with the marks you got and what it was out of. You see the percentage for every subject and your total percentage, which is total marks got divided by total marks available." },
    ],
    privacyNote: typedNote,
  },
  "attendance-calculator": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Enter the classes you attended and the classes held so far.",
      "Keep the target at 75% or change it to your college's rule.",
      "Add classes left this semester to see where you can finish.",
    ],
    faq: [
      { q: "How many classes can I miss and stay above 75%?", a: "Enter your numbers and the tool shows exactly how many classes in a row you can miss, and what your attendance drops to if you miss one more." },
      { q: "I'm below 75%. How many classes do I need?", a: "The tool shows how many classes in a row you must attend to get back to your target. If even attending every remaining class won't get you there, it tells you that too." },
      { q: "Does it work for a single subject?", a: "Yes. Enter that subject's attended and held classes. Use it once per subject if your college counts them separately." },
    ],
    privacyNote: typedNote,
  },
  reminder: {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Write what to remind you about and pick the date and time.",
      "Add it to Google Calendar or your phone calendar to get an alert even when this site is closed.",
      "While this page is open, TopperShelf also alerts you when it's time.",
    ],
    faq: [
      { q: "Will I get a reminder if TopperShelf is closed?", a: "Only through your calendar. Use Google Calendar or Phone calendar (.ics) on a reminder, and your phone's calendar alerts you at that time. Inside TopperShelf, alerts only appear while this page is open." },
      { q: "What is the .ics file?", a: "A standard calendar file. Opening it on a phone or computer adds the reminder, with an alert, to your calendar app." },
      { q: "Where are my reminders saved?", a: "In your TopperShelf account, so they follow you to any device you sign in on. Alerts still come from your calendar, so add important ones to Google Calendar or your phone calendar." },
    ],
    privacyNote: savedNote,
  },
  "days-countdown": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Name the day you're counting down to, like an exam or a trip.",
      "Pick the date and press Add countdown.",
      "Add as many as you like. The nearest one shows big at the top.",
    ],
    faq: [
      { q: "How are the days counted?", a: "In whole calendar days from today, using your own time zone, so a countdown ticks over at midnight where you are." },
      { q: "Are my countdowns saved?", a: "Yes, in your TopperShelf account, so they are there on any device you sign in on." },
      { q: "What happens after the date passes?", a: "It moves to the bottom of the list and shows how many days ago it was, until you remove it." },
    ],
    privacyNote: savedNote,
  },
};

Object.assign(toolContent, shelfContent);

Object.assign(toolContent, {
  "decision-wheel": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Type your options one by one. You need at least 2.",
      "Press Spin and wait for the wheel to stop.",
      "Not happy? Press Spin again, or change the options and spin a new wheel.",
    ],
    faq: [
      { q: "Is the wheel really random?", a: "Yes. Every option has the same chance, and each spin is independent of the last one." },
      { q: "How many options can I add?", a: "Add as many as fit comfortably on the wheel. Two is the minimum, and short names read best." },
      { q: "Can I use it for study decisions?", a: "Of course: which subject to revise first, who presents first, or where to eat after the exam." },
    ],
    privacyNote: "Your options are used only on this page to draw the wheel. We don’t save them.",
  },
  "would-you-rather": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Read the two choices and tap the one you would pick.",
      "See how your pick compares, then go to the next question.",
      "At the end you get a short verdict on how you chose.",
    ],
    faq: [
      { q: "Are the percentages real votes?", a: "No. They are sample figures written for fun, not live results from other players." },
      { q: "How many questions are there?", a: "A set of student-life dilemmas each round, from chai versus Maggi to exam superpowers. Play again for another go." },
      { q: "Do you save my answers?", a: "No. Your picks only stay on the screen while you play." },
    ],
    privacyNote: "We don’t save your answers. They only stay on screen while you play.",
  },
  "friendship-score": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Type your name and press the button to make your link.",
      "Send the link to a friend on WhatsApp or anywhere else.",
      "Your friend answers 8 quick questions (no account needed). Open “See who answered” to find their score.",
    ],
    faq: [
      { q: "Does my friend need an account?", a: "No. They open the link, type a name and answer. Only you need to sign in." },
      { q: "Who can see the answers?", a: "Only you. Your friend sees their own score and nothing else." },
      { q: "Can many friends use one link?", a: "Yes. Every friend who answers appears in your list, highest score first." },
      { q: "Is the score real?", a: "It is for fun. It is not a real measure of your friendship." },
    ],
    privacyNote: "Your link and your friends’ answers are saved in your TopperShelf account. Only you can see them, and you can delete the link any time.",
  },
  "what-am-i-to-you": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Type your name and make your link.",
      "Send it to friends. Each one picks a label and can add a short note.",
      "Open your inbox to see what everyone really thinks.",
    ],
    faq: [
      { q: "Does my friend need an account?", a: "No. They only type a name and pick an answer." },
      { q: "Who can read the notes?", a: "Only you. Notes are limited to 140 characters." },
      { q: "Can a friend change their answer?", a: "Yes. Answering again with the same name replaces the earlier answer." },
    ],
    privacyNote: "Answers on your link are saved in your TopperShelf account. Only you can read them, and you can delete the link any time.",
  },
  "how-well-do-you-know-me": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Answer 10 questions about yourself. This is the answer key.",
      "Send your link to friends. They guess your answers.",
      "See who scored highest on your leaderboard.",
    ],
    faq: [
      { q: "Can friends see my answers before guessing?", a: "No. The key stays on our server. A friend only learns the right answer to a question after they have picked." },
      { q: "Does my friend need an account?", a: "No. They open the link, type a name and play." },
      { q: "Can a friend retry?", a: "Yes. Playing again with the same name replaces their earlier score." },
    ],
    privacyNote: "Your answers and your friends’ scores are saved in your TopperShelf account. Only you can see the leaderboard.",
  },
  "grow-a-sapling": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Press the Water button to care for your tree today.",
      "Come back every day. Each day you water keeps your streak alive.",
      "Keep going for 365 days to grow a full tree, then plant the next one.",
    ],
    faq: [
      { q: "What happens if I miss a day?", a: "Your streak resets and the tree wilts until you water it again. Your best streak is kept." },
      { q: "Is my garden saved?", a: "Yes. It is saved in your TopperShelf account, so your trees and streak follow you to a new phone or browser." },
      { q: "Why do I need to sign in?", a: "So your streak is saved to your account and is not lost if you clear your browser or change phone." },
    ],
    privacyNote: "Your garden is saved in your TopperShelf account. Only you can see it.",
  },
});
