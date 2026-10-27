"use client";

import Link from "next/link";
import ToolIcon, { type ToolIconName } from "@/components/tools/ToolIcon";
import { FAVOURITES_KEY, RECENT_KEY, SectionHead, ToolCard } from "@/components/tools/ui";
import { toolById, type Tool } from "@/lib/tools/registry";
import { useStoredList } from "@/lib/tools/useStoredList";

const toTools = (ids: string[]) => ids.map(toolById).filter((tool): tool is Tool => Boolean(tool));

function EmptyShelf({ icon, title, text }: { icon: ToolIconName; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line py-12 text-center dark:border-slate-700">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-blue-soft text-blue-hover">
        <ToolIcon name={icon} />
      </span>
      <h3 className="mb-1 mt-4 text-lg text-navy dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-muted">{text}</p>
      <Link
        href="/tools"
        className="mt-3 inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-white px-5 text-sm font-semibold text-navy hover:border-blue hover:bg-blue-soft dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        Explore tools
      </Link>
    </div>
  );
}

export default function MyToolsClient() {
  const [favouriteIds] = useStoredList(FAVOURITES_KEY);
  const [recentIds] = useStoredList(RECENT_KEY);
  const favourites = toTools(favouriteIds);
  const recent = toTools(recentIds);
  return (
    <>
      <section className="pt-12">
        <SectionHead title={`Favourites (${favourites.length})`} description="Your quickest shortcuts." />
        {favourites.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {favourites.map((tool) => (
              <ToolCard key={tool.id} tool={tool} compact />
            ))}
          </div>
        ) : (
          <EmptyShelf icon="heart" title="No favourites yet" text="Tap the heart on any tool to keep it here." />
        )}
      </section>
      <section className="pt-12">
        <SectionHead title="Recently used" description="Pick up where you left off." />
        {recent.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((tool) => (
              <ToolCard key={tool.id} tool={tool} compact />
            ))}
          </div>
        ) : (
          <EmptyShelf icon="clock" title="Nothing here yet" text="Tools you open will appear here for easy access." />
        )}
      </section>
    </>
  );
}
