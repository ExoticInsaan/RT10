import type { Metadata } from "next";
import { Suspense } from "react";
import SharedResult from "@/components/fun/SharedResult";

// A shared result can name a person, so it works for whoever has the link and stays out of Google.
export const metadata: Metadata = {
  title: "How Cooked Are You result",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="fun-field min-h-[70vh] px-4 py-8 sm:py-12">
      <Suspense fallback={null}>
        <SharedResult kind="cooked" />
      </Suspense>
    </div>
  );
}
