import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/*
 * The working UI of each Shelf tool, keyed by tool id from lib/tools/registry.ts.
 * They run only in the browser (they read saved data and files there). Each one loads only when its tool page is opened (and the visitor is signed in), so heavy libraries such as
 * the PDF engine never slow down the rest of the site. To add a tool: build its component in this folder and
 * add one line here.
 */
const loading = () => <p className="m-0 py-16 text-center text-sm text-muted">Loading the tool…</p>;

export const shelfTools: Record<string, ComponentType> = {
  "cgpa-calculator": dynamic(() => import("./CgpaCalculator"), { loading, ssr: false }),
  "attendance-calculator": dynamic(() => import("./AttendanceCalculator"), { loading, ssr: false }),
  "days-countdown": dynamic(() => import("./DaysCountdown"), { loading, ssr: false }),
  "image-compressor": dynamic(() => import("./ImageCompressor"), { loading, ssr: false }),
  "pdf-toolkit": dynamic(() => import("./PdfToolkit"), { loading, ssr: false }),
  "focus-timer": dynamic(() => import("./FocusTimer"), { loading, ssr: false }),
  "flashcard-maker": dynamic(() => import("./FlashcardMaker"), { loading, ssr: false }),
  reminder: dynamic(() => import("./Reminder"), { loading, ssr: false }),
};
