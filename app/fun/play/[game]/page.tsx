import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import FunGame from "@/components/fun/FunGame";
import { funGameIds } from "@/components/fun/ids";
import { toolById } from "@/lib/tools/registry";

export function generateStaticParams() {
  return funGameIds.map((game) => ({ game }));
}

export async function generateMetadata({ params }: PageProps<"/fun/play/[game]">): Promise<Metadata> {
  const { game } = await params;
  const tool = toolById(game);
  return {
    title: tool ? `${tool.name} (play)` : "Fun Zone game",
    alternates: { canonical: `/fun/play/${game}` },
    // A full-screen preview of the game; the indexed page is /tool/[id].
    robots: { index: false, follow: true },
  };
}

export default function PlayPage({ params }: PageProps<"/fun/play/[game]">) {
  return (
    <Suspense fallback={<div className="fun-field min-h-[70vh]" />}>
      <PlayInner params={params} />
    </Suspense>
  );
}

async function PlayInner({ params }: Pick<PageProps<"/fun/play/[game]">, "params">) {
  const { game } = await params;
  if (!funGameIds.includes(game)) notFound();
  const tool = toolById(game);
  return (
    <div className="fun-field min-h-[70vh] px-3 py-6 sm:px-6 sm:py-10 lg:py-14">
      <h1 className="sr-only">{tool?.name ?? "Fun Zone game"}</h1>
      <FunGame id={game} />
    </div>
  );
}
