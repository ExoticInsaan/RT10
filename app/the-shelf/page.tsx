import type { Metadata } from "next";
import { Suspense } from "react";
import ToolsBrowser from "@/components/tools/ToolsBrowser";

export const metadata: Metadata = {
  title: "The Shelf",
  description: "Every TopperShelf tool in one place: document tools for exam forms, student tools and fun.",
  alternates: { canonical: "/the-shelf" },
};

export default function ToolsPage() {
  return (
    <div className="container-app pb-20 pt-10">
      <div className="mb-8">
        <span className="eyebrow">Everything in one shelf</span>
        <h1 className="mb-2 mt-4 text-4xl font-extrabold tracking-tight text-navy dark:text-white sm:text-5xl">The Shelf</h1>
        <p className="m-0 text-muted dark:text-slate-400">Find the right tool, sorted by what you need to get done.</p>
      </div>
      <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
        <ToolsBrowser />
      </Suspense>
    </div>
  );
}
