import type { ToolIconName } from "@/components/tools/ToolIcon";

// Tool registry: the single list every page reads (home, all tools, tool page, fun zone, search, sitemap).
// To add a tool, add one entry here and one tool component later; nothing else needs to change.

/** The site has exactly two sections: The Shelf (useful tools) and the Fun Zone (playful tools). */
export type Category = "The Shelf" | "Fun Zone"

export type Tool = {
  id: string
  name: string
  description: string
  category: Category
  icon: ToolIconName
  tone: string
  popular?: boolean
  /** Illustration in /public/shelf or /public/fun-zone (not /public/tools: /tools/* redirects to The Shelf), shown on The Shelf and as the tool's tile. */
  image?: string
  /** Background behind the illustration, matched to the image's own edges so it sits seamlessly. */
  imageBg?: string
  /** "cover" for pictures that fill their frame, "contain" for objects on a plain background. */
  imageFit?: "cover" | "contain"
  /** true once the tool really works. Until then a tool is kept out of the sitemap and not indexed by Google (nothing changes visually). */
  ready?: boolean
}

export const tools: Tool[] = [
  {
    id: "pdf-toolkit",
    name: "PDF Toolkit",
    description: "Merge, split, compress and convert PDFs right in your browser.",
    category: "The Shelf",
    icon: "fileText",
    tone: "violet",
    image: "/shelf/pdf-toolkit.webp",
    imageBg: "#ffffff",
    imageFit: "contain",
    popular: true,
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    description: "Shrink photos to the exact KB size a form asks for, without visible loss.",
    category: "The Shelf",
    icon: "image",
    tone: "blue",
    image: "/shelf/image-compressor.webp",
    imageBg: "#3349ff",
    imageFit: "cover",
    popular: true,
  },
  {
    id: "focus-timer",
    name: "Focus Timer",
    description: "Study in focused sessions with short breaks built in.",
    category: "The Shelf",
    icon: "clock",
    tone: "coral",
    image: "/shelf/focus-timer.webp",
    imageBg: "#c6ae94",
    imageFit: "cover",
  },
  {
    id: "flashcard-maker",
    name: "Flashcard Maker",
    description: "Turn your notes into cards and test yourself until they stick.",
    category: "The Shelf",
    icon: "graduation",
    tone: "blue",
    image: "/shelf/flashcard-maker.webp",
    imageBg: "#ffffff",
    imageFit: "contain",
  },
  {
    id: "cgpa-calculator",
    name: "CGPA & Percentage Calculator",
    description: "Convert CGPA or SGPA to percentage, and back.",
    category: "The Shelf",
    icon: "calculator",
    tone: "coral",
    image: "/shelf/cgpa-calculator.webp",
    imageBg: "#fbe6dd",
    imageFit: "cover",
    popular: true,
  },
  {
    id: "qr-code-generator",
    name: "QR Code Generator",
    description: "Make a QR code for a link or some text and download it as an image.",
    category: "The Shelf",
    icon: "grid",
    tone: "blue",
    image: "/shelf/qr-code-generator.webp",
    imageBg: "#f8f8f8",
    imageFit: "contain",
  },
  {
    id: "attendance-calculator",
    name: "Attendance Calculator",
    description: "See how many classes you can skip, or must attend, to stay above 75%.",
    category: "The Shelf",
    icon: "checkCircle",
    tone: "blue",
    image: "/shelf/attendance-calculator.webp",
    imageBg: "#ffffff",
    imageFit: "contain",
    popular: true,
  },
  {
    id: "reminder",
    name: "Reminder",
    description: "Set reminders for assignments, fees and deadlines so nothing slips.",
    category: "The Shelf",
    icon: "calendar",
    tone: "blue",
    image: "/shelf/reminder.webp",
    imageBg: "#ffffff",
    imageFit: "contain",
  },
  {
    id: "days-countdown",
    name: "Days Countdown",
    description: "Count the days left to an exam, a trip or a birthday.",
    category: "The Shelf",
    icon: "clock",
    tone: "amber",
    image: "/shelf/days-countdown.webp",
    imageBg: "#ffbc3a",
    imageFit: "cover",
  },
  {
    id: "decision-wheel",
    name: "Decision Wheel",
    description: "Can't choose? Add your options and let the wheel pick for you.",
    category: "Fun Zone",
    icon: "sparkles",
    tone: "blue",
    image: "/fun-zone/decision-wheel.webp",
    imageBg: "#cfe0fe",
    imageFit: "cover",
  },
  {
    id: "would-you-rather",
    name: "Would You Rather",
    description: "Two impossible choices, one answer. Then see what everyone else picked.",
    category: "Fun Zone",
    icon: "message",
    tone: "violet",
    image: "/fun-zone/would-you-rather.webp",
    imageBg: "#e8d8fd",
    imageFit: "cover",
  },
  {
    id: "grow-a-sapling",
    name: "Grow a Sapling",
    description: "Water a tiny plant every day and watch it grow as long as your streak lasts.",
    category: "Fun Zone",
    icon: "heart",
    tone: "green",
    image: "/fun-zone/grow-a-sapling.webp",
    imageBg: "#d0f5d8",
    imageFit: "cover",
  },
  {
    id: "friendship-score",
    name: "Friendship Score",
    description: "Rate your friendship in a few questions and get a card to send them.",
    category: "Fun Zone",
    icon: "heart",
    tone: "sky",
    image: "/fun-zone/friendship-score.webp",
    imageBg: "#b6ddfd",
    imageFit: "cover",
  },
  {
    id: "what-am-i-to-you",
    name: "What Am I to You?",
    description: "Share a link and find out how your friends really see you.",
    category: "Fun Zone",
    icon: "user",
    tone: "purple",
    image: "/fun-zone/what-am-i-to-you.webp",
    imageBg: "#dccefd",
    imageFit: "cover",
  },
  {
    id: "how-well-do-you-know-me",
    name: "How Well Do You Know Me?",
    description: "Make a quiz about yourself and see which friend scores highest.",
    category: "Fun Zone",
    icon: "sparkles",
    tone: "blue",
    image: "/fun-zone/how-well-do-you-know-me.webp",
    imageBg: "#b6dafd",
    imageFit: "cover",
  },
  {
    id: "how-cooked",
    name: "How Cooked Are You?",
    description: "Get your highly scientific chaos score.",
    category: "Fun Zone",
    ready: true,
    icon: "flame",
    tone: "coral",
    image: "/fun-zone/how-cooked.webp",
    imageBg: "#fed1bb",
    imageFit: "cover",
    popular: true,
  },
  {
    id: "excuse-generator",
    name: "Excuse Generator",
    description: "Fresh excuses for suspiciously specific situations.",
    category: "Fun Zone",
    ready: true,
    icon: "message",
    tone: "sky",
    image: "/fun-zone/excuse-generator.webp",
    imageBg: "#cfcbfc",
    imageFit: "cover",
    popular: true,
  },
  {
    id: "roast-my-timetable",
    name: "Roast My Timetable",
    description: "Because your schedule deserves honest feedback.",
    category: "Fun Zone",
    ready: true,
    icon: "sparkles",
    tone: "purple",
    image: "/fun-zone/roast-my-timetable.webp",
    imageBg: "#feeaac",
    imageFit: "cover",
    popular: true,
  },
  {
    id: "vibe-check",
    name: "Instant Vibe Check",
    description: "A totally unbiased reading of today's energy.",
    category: "Fun Zone",
    ready: true,
    icon: "zap",
    tone: "lime",
    image: "/fun-zone/vibe-check.webp",
    imageBg: "#bac0fd",
    imageFit: "cover",
  },
]

export const categories: { name: Category; icon: ToolIconName; href: string; blurb: string }[] = [
  {
    name: "The Shelf",
    icon: "grid",
    href: "/the-shelf",
    blurb: "Useful tools for real jobs: PDFs, photos, grades, attendance, study sessions and deadlines.",
  },
  {
    name: "Fun Zone",
    icon: "sparkles",
    href: "/fun",
    blurb: "Playful tools that make a result card worth sharing. Nothing here is meant to be taken seriously.",
  },
]

export const toolById = (id: string) => tools.find((t) => t.id === id);

export const isReady = (tool: Tool) => tool.ready === true
export const readyTools = () => tools.filter(isReady)

/** Public address of a section: "The Shelf" is /the-shelf and "Fun Zone" is /fun. */
export const categoryHref = (name: Category) => (name === "Fun Zone" ? "/fun" : "/the-shelf")
