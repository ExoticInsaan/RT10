import type { ToolIconName } from "@/components/tools/ToolIcon";

// Tool registry: the single list every page reads (home, all tools, tool page, fun zone, search, sitemap).
// To add a tool, add one entry here and one tool component later; nothing else needs to change.

export type Category = "PDF" | "Image" | "Calculators" | "Text" | "India Tools" | "Students" | "Fun"

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
    id: "compress-pdf",
    name: "Compress PDF",
    description: "Reduce PDF size without losing quality.",
    category: "PDF",
    icon: "file",
    tone: "red",
    popular: true,
  },
  {
    id: "merge-pdf",
    name: "Merge PDF",
    description: "Combine multiple PDFs into one file.",
    category: "PDF",
    icon: "layers",
    tone: "red",
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word",
    description: "Turn PDF files into editable documents.",
    category: "PDF",
    icon: "fileText",
    tone: "blue",
  },
  {
    id: "resize-image",
    name: "Resize Image",
    description: "Change image dimensions in seconds.",
    category: "Image",
    icon: "image",
    tone: "blue",
    popular: true,
  },
  {
    id: "compress-image",
    name: "Compress Image",
    description: "Shrink images while keeping them sharp.",
    category: "Image",
    icon: "minimize",
    tone: "teal",
    popular: true,
  },
  {
    id: "passport-photo",
    name: "Passport Photo Maker",
    description: "Create compliant photos from any selfie.",
    category: "Image",
    icon: "user",
    tone: "violet",
  },
  {
    id: "emi-calculator",
    name: "EMI Calculator",
    description: "Plan monthly loan payments instantly.",
    category: "Calculators",
    icon: "calculator",
    tone: "green",
    popular: true,
  },
  {
    id: "age-calculator",
    name: "Age Calculator",
    description: "Find your exact age down to the day.",
    category: "Calculators",
    icon: "calendar",
    tone: "blue",
    popular: true,
  },
  {
    id: "gst-calculator",
    name: "GST Calculator",
    description: "Add or remove GST from any amount.",
    category: "India Tools",
    icon: "receipt",
    tone: "amber",
    popular: true,
  },
  {
    id: "qr-generator",
    name: "QR Code Generator",
    description: "Make a downloadable QR code for anything.",
    category: "India Tools",
    icon: "qr",
    tone: "navy",
    popular: true,
  },
  {
    id: "word-counter",
    name: "Word Counter",
    description: "Count words, characters and reading time.",
    category: "Text",
    icon: "type",
    tone: "violet",
    popular: true,
  },
  {
    id: "case-converter",
    name: "Case Converter",
    description: "Switch text between upper, lower and title case.",
    category: "Text",
    icon: "case",
    tone: "blue",
  },
  {
    id: "cgpa-calculator",
    name: "CGPA to Percentage",
    description: "Convert your CGPA to percentage.",
    category: "Students",
    icon: "graduation",
    tone: "violet",
  },
  {
    id: "attendance-calculator",
    name: "Attendance Calculator",
    description: "Check how many classes you can safely miss.",
    category: "Students",
    icon: "checkCircle",
    tone: "teal",
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
  { name: "PDF", icon: "file" },
  { name: "Image", icon: "image" },
  { name: "Calculators", icon: "calculator" },
  { name: "Text", icon: "type" },
  { name: "India Tools", icon: "india" },
  { name: "Students", icon: "graduation" },
  { name: "Fun", icon: "sparkles" },
]

export const categorySlug = (name: Category) => name.toLowerCase().replace(/\s+/g, "-");
export const toolById = (id: string) => tools.find((t) => t.id === id);

export const isReady = (tool: Tool) => tool.ready === true
export const readyTools = () => tools.filter(isReady)

/** Public address of a category page, for example "India Tools" becomes /tools/india-tools. */
export const categoryHref = (name: string) => `/tools/${name.toLowerCase().replace(/\s+/g, "-")}`
export const categoryFromSlug = (slug: string) => categories.find((c) => categorySlug(c.name) === slug)
