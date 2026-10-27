import type { ToolIconName } from "@/components/tools/ToolIcon";

// Tool registry: the single list every page reads (home, all tools, tool page, fun zone, search, sitemap).
// To add a tool, add one entry here and one tool component later; nothing else needs to change.

export type Category = "Documents" | "Students" | "Fun"

export type Tool = {
  id: string
  name: string
  description: string
  category: Category
  icon: ToolIconName
  tone: string
  popular?: boolean
  /** true once the tool really works. Tools that are not ready show a "Soon" badge, are kept out of the sitemap and are not indexed by Google. */
  ready?: boolean
}

export const tools: Tool[] = [
  {
    id: "photo-signature-resizer",
    name: "Photo & Signature Resizer",
    description: "Resize photos and signatures to the exact pixels and KB exam forms ask for.",
    category: "Documents",
    icon: "user",
    tone: "violet",
    popular: true,
  },
  {
    id: "leave-letter-maker",
    name: "Leave & Application Letter Maker",
    description: "Ready formats for leave, fee concession, bonafide and NOC letters.",
    category: "Documents",
    icon: "fileText",
    tone: "blue",
    popular: true,
  },
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    description: "Turn photos and scans into a single PDF.",
    category: "Documents",
    icon: "file",
    tone: "red",
  },
  {
    id: "cgpa-converter",
    name: "CGPA & Percentage Converter",
    description: "Convert CGPA or SGPA to percentage, and back.",
    category: "Students",
    icon: "graduation",
    tone: "violet",
    popular: true,
  },
  {
    id: "attendance-calculator",
    name: "Attendance Calculator",
    description: "See how many classes you can skip, or must attend, to reach 75%.",
    category: "Students",
    icon: "checkCircle",
    tone: "teal",
    popular: true,
  },
  {
    id: "marks-needed-calculator",
    name: "Marks Needed Calculator",
    description: "Enter your internal marks and a target to see what you need in the final exam.",
    category: "Students",
    icon: "calculator",
    tone: "green",
  },
  {
    id: "exam-countdown",
    name: "Exam Countdown",
    description: "Days left to your exam and a daily target to stay on track.",
    category: "Students",
    icon: "clock",
    tone: "amber",
  },
  {
    id: "how-cooked",
    name: "How cooked are you?",
    description: "Get your highly scientific chaos score.",
    category: "Fun",
    ready: true,
    icon: "flame",
    tone: "coral",
    popular: true,
  },
  {
    id: "excuse-generator",
    name: "Excuse Generator",
    description: "Fresh excuses for suspiciously specific situations.",
    category: "Fun",
    ready: true,
    icon: "message",
    tone: "sky",
    popular: true,
  },
  {
    id: "roast-my-timetable",
    name: "Roast My Timetable",
    description: "Because your schedule deserves honest feedback.",
    category: "Fun",
    ready: true,
    icon: "sparkles",
    tone: "purple",
    popular: true,
  },
  {
    id: "vibe-check",
    name: "Instant Vibe Check",
    description: "A totally unbiased reading of today's energy.",
    category: "Fun",
    ready: true,
    icon: "zap",
    tone: "lime",
  },
]

export const categories: { name: Category; icon: ToolIconName }[] = [
  { name: "Documents", icon: "file" },
  { name: "Students", icon: "graduation" },
  { name: "Fun", icon: "sparkles" },
]

export const categorySlug = (name: Category) => name.toLowerCase().replace(/\s+/g, "-");
export const toolById = (id: string) => tools.find((t) => t.id === id);

export const isReady = (tool: Tool) => tool.ready === true
export const readyTools = () => tools.filter(isReady)

/** Public address of a category page, for example "Documents" becomes /tools/documents. */
export const categoryHref = (name: string) => `/tools/${name.toLowerCase().replace(/\s+/g, "-")}`
export const categoryFromSlug = (slug: string) => categories.find((c) => categorySlug(c.name) === slug)
