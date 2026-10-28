import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import FriendRoom from "@/components/fun/FriendRoom";

// A private invite link: it works for whoever has it, and it stays out of Google.
export const metadata: Metadata = {
  title: "How Well Do You Know Me?: you were invited",
  robots: { index: false, follow: false },
};

export default function FriendPage({ params }: PageProps<"/fun/know-me/[code]">) {
  return (
    <Suspense fallback={<div className="fun-field min-h-[70vh]" />}>
      <FriendInner params={params} />
    </Suspense>
  );
}

async function FriendInner({ params }: Pick<PageProps<"/fun/know-me/[code]">, "params">) {
  const { code } = await params;
  if (!/^[A-Za-z0-9]{6,12}$/.test(code)) notFound();
  return (
    <div className="fun-field min-h-[70vh] px-3 py-6 sm:px-6 sm:py-10 lg:py-14">
      <h1 className="sr-only">How Well Do You Know Me?</h1>
      <FriendRoom game="how-well-do-you-know-me" code={code} />
    </div>
  );
}
