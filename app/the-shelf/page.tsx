import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ToolsBrowser from "@/components/tools/ToolsBrowser";
import { ToolCard } from "@/components/tools/ui";
import { tools } from "@/lib/tools/registry";

export const metadata: Metadata = {
  title: "The Shelf",
  description:
    "Useful free tools in one place: exam form photo and signature resizer, leave letters, image to PDF, CGPA converter, attendance calculator and more.",
  alternates: { canonical: "/the-shelf" },
};

export default function TheShelfPage() {
  // Shown straight away (and to search engines) until the search box is ready; same grid, no search applied.
  const shelf = tools
    .filter((tool) => tool.category === "The Shelf")
    .sort((a, b) => Number(!!b.ready) - Number(!!a.ready));
  const fallback = (
    <>
      {/* Same height as the search box, so nothing jumps when it appears. */}
      <div className="h-12 rounded-xl border border-line bg-white" aria-hidden="true" />
      <div className="mt-8">
        <p className="mb-4 text-sm font-semibold text-navy">{shelf.length} tools</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shelf.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </>
  );
  return (
    <div className="container-app pb-20 pt-10">
      <div className="mb-8">
        <span className="eyebrow">Useful tools</span>
        <h1 className="mb-2 mt-4 text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">The Shelf</h1>
        <p className="m-0 max-w-2xl text-muted">
          Every useful tool in one place, for the small jobs that take too long: forms, letters, PDFs, grades and more.
          Want something lighter?{" "}
          <Link href="/fun" className="font-bold text-blue-hover">
            Visit the Fun Zone
          </Link>
          .
        </p>
      </div>
      <Suspense fallback={fallback}>
        <ToolsBrowser />
      </Suspense>
    </div>
  );
}
