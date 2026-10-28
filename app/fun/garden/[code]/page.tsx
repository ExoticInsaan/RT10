import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import FriendRoom from "@/components/fun/FriendRoom";

// A private invite link: it works for whoever has it, and it stays out of Google.
export const metadata: Metadata = {
  title: "Grow a Sapling: you were invited",
  robots: { index: false, follow: false },
};

export default function FriendPage({ params }: PageProps<"/fun/garden/[code]">) {
  return (
    <Suspense fallback={<div className="fun-field min-h-[70vh]" />}>
      <FriendInner params={params} />
    </Suspense>
  );
}

async function FriendInner({ params }: Pick<PageProps<"/fun/garden/[code]">, "params">) {
  const { code } = await params;
  if (!/^[A-Za-z0-9]{6,12}$/.test(code)) notFound();
  return (
    <div className="fun-field min-h-[70vh] px-3 py-6 sm:px-6 sm:py-10 lg:py-14">
      <h1 className="sr-only">Grow a Sapling</h1>
      <FriendRoom game="grow-a-sapling" code={code} />
    </div>
  );
}
