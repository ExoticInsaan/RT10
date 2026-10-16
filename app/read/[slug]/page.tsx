import { Suspense } from "react";
import type { Metadata } from "next";
import ReaderGate from "@/components/reader/ReaderGate";

export const metadata: Metadata = {
  title: "Reading",
  robots: { index: false, follow: false },
};

export default function ReadPage(props: PageProps<"/read/[slug]">) {
  return (
    <main className="mx-auto w-full max-w-[1100px] px-3 py-6 max-[560px]:py-4">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Reader params={props.params} />
      </Suspense>
    </main>
  );
}

async function Reader({ params }: { params: PageProps<"/read/[slug]">["params"] }) {
  const { slug } = await params;
  return <ReaderGate slug={slug} />;
}
