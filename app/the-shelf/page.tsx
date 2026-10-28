import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ToolsBrowser, { ShelfGrid, ShelfHeader } from "@/components/tools/ToolsBrowser";
import { tools } from "@/lib/tools/registry";

export const metadata: Metadata = {
  title: "The Shelf",
  description:
    "Free tools for real jobs: PDF toolkit, image compressor, focus timer, flashcards, CGPA calculator, attendance, reminders and countdowns.",
  alternates: { canonical: "/the-shelf" },
};

const intro = (
  <div>
    <h1 className="m-0 font-display text-5xl font-normal leading-none tracking-tight text-navy sm:text-6xl">The Shelf</h1>
    <p className="mb-0 mt-4 max-w-xl text-base leading-7 text-muted sm:text-lg">
      Tools for the jobs that keep coming back: shrinking a file, timing a study session, checking your attendance.
      Pick one and get it done in your browser. Looking for something sillier?{" "}
      <Link href="/fun" className="font-semibold text-blue-hover underline-offset-4 hover:underline">
        Try the Fun Zone
      </Link>
      .
    </p>
  </div>
);

export default function TheShelfPage() {
  const shelf = tools.filter((tool) => tool.category === "The Shelf");
  // Shown straight away (and to search engines) until the search box is ready: the same layout, nothing filtered.
  const fallback = (
    <>
      <ShelfHeader
        intro={intro}
        search={<div className="h-12 rounded-xl border border-line bg-white" aria-hidden="true" />}
        count={`${shelf.length} tools, all free`}
      />
      <ShelfGrid list={shelf} />
    </>
  );
  return (
    <div className="container-app pb-24 pt-12 sm:pt-16">
      <Suspense fallback={fallback}>
        <ToolsBrowser intro={intro} />
      </Suspense>
    </div>
  );
}
