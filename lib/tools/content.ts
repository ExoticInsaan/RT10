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
const savedNote = "Saved only in this browser on this device. Clearing your browser data removes it.";

const shelfContent: Record<string, ToolContent> = {
  "pdf-toolkit": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Choose what to do: Merge, Split, Compress, Images → PDF or PDF → JPG.",
      "Drop in your files and arrange them if needed.",
      "Press the button and download the result.",
    ],
    faq: [
      { q: "Are my PDFs uploaded to a server?", a: "No. Every PDF is read and saved by your own browser, so your documents never leave your device." },
      { q: "How much does Compress shrink a PDF?", a: "It works best on scanned documents and photo-heavy PDFs, which often shrink by 80% or more. Each page becomes an image, so text in the result can't be selected. If the result isn't smaller, the tool tells you to keep your original." },
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
      { q: "Where are my decks saved?", a: "In this browser on this device, so they are there next time you open the tool here. They don't sync to other devices yet." },
      { q: "How does study mode decide the order?", a: "Cards are shuffled each time. A card you mark Again comes back a few cards later, until every card is marked Got it." },
    ],
    privacyNote: savedNote,
  },
  "cgpa-calculator": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Choose CGPA → %, % → CGPA, or SGPAs → CGPA.",
      "Enter your number and pick the rule your board or university uses.",
      "Read your result. It updates as you type.",
    ],
    faq: [
      { q: "How do I convert CGPA to percentage?", a: "It depends on who awarded it. CBSE and UGC use CGPA × 9.5. AICTE uses (CGPA − 0.75) × 10. Anna University and AKTU use CGPA × 10, and Mumbai University uses 7.1 × CGPA + 11. Pick yours from the list." },
      { q: "My university uses a different formula. What should I do?", a: "Choose Custom multiplier and enter the number printed on your marksheet. The rule on your marksheet or in your university's regulations is always the official figure." },
      { q: "How is CGPA calculated from SGPAs?", a: "Add each semester's SGPA. With credits for every semester, CGPA is the credit-weighted average, which is how most universities calculate it. Without credits, each semester counts equally." },
    ],
    privacyNote: typedNote,
  },
  "qr-code-generator": {
    howTo: [
      "Sign in with Google (one tap, free).",
      "Choose Link, Text, Wi-Fi or UPI payment and fill in the details.",
      "Pick colours if you like. The code updates as you type.",
      "Download it as a PNG, or SVG for printing at any size.",
    ],
    faq: [
      { q: "Do these QR codes expire?", a: "No. The information is inside the code itself, so it works for as long as the link, network or UPI ID does." },
      { q: "How does the Wi-Fi QR code work?", a: "Phones that scan it are offered to join the network without typing the password. It works with the built-in camera on most Android phones and iPhones." },
      { q: "Can I make a QR code to receive UPI payments?", a: "Yes. Enter your UPI ID, and optionally a name, amount and note. GPay, PhonePe, Paytm and other UPI apps can scan it. Double-check the UPI ID before sharing." },
      { q: "Which colours scan best?", a: "A dark code on a light background. Very light codes or low contrast can stop some phones from scanning." },
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
      { q: "Where are my reminders saved?", a: "In this browser on this device. They don't sync to other devices yet, so add important ones to your calendar." },
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
      { q: "Are my countdowns saved?", a: "Yes, in this browser on this device, so they're still there next time you open the tool here." },
      { q: "What happens after the date passes?", a: "It moves to the bottom of the list and shows how many days ago it was, until you remove it." },
    ],
    privacyNote: savedNote,
  },
};

Object.assign(toolContent, shelfContent);
