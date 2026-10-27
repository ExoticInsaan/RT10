import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ShareActions from "@/components/tools/ShareActions";
import ShareCard from "@/components/tools/ShareCard";
import ToolIcon from "@/components/tools/ToolIcon";
import { parseShare, funConfig, shareQuery } from "@/lib/tools/fun";
import { toolById } from "@/lib/tools/registry";

// A result link can name any person, so these pages are never indexed.
const robots = { index: false, follow: false };

export async function generateMetadata({ params, searchParams }: PageProps<"/share/[id]">): Promise<Metadata> {
  const { id } = await params;
  const query = await searchParams;
  const tool = toolById(id);
  const shared = parseShare(id, first(query.n), first(query.s));
  if (!tool || !shared) return { title: "Result", robots };
  const image = `/share/${id}/image?${shareQuery(shared.input, shared.salt)}`;
  const title = `${shared.result.big} ${shared.result.title} | ${tool.name}`;
  return {
    title,
    description: shared.result.message,
    robots,
    openGraph: { title, description: shared.result.message, images: [{ url: image, width: 1080, height: 1920 }] },
    twitter: { card: "summary_large_image", title, description: shared.result.message, images: [image] },
  };
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default function SharePage(props: PageProps<"/share/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" aria-hidden="true" />}>
      <ShareContent {...props} />
    </Suspense>
  );
}

async function ShareContent({ params, searchParams }: PageProps<"/share/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const tool = toolById(id);
  const shared = parseShare(id, first(query.n), first(query.s));
  if (!tool || !shared) notFound();
  const qs = shareQuery(shared.input, shared.salt);
  const reroll = funConfig[id].reroll ? `/share/${id}?${shareQuery(shared.input, shared.salt + 1)}` : null;
  return (
    <div className="container-app grid items-center gap-10 py-12 lg:min-h-[calc(100vh-4.5rem)] lg:grid-cols-2">
      <div>
        <span className="eyebrow">Your result is ready</span>
        <h1 className="mb-4 mt-5 text-4xl font-extrabold tracking-tight text-navy dark:text-white sm:text-5xl">
          Too good to keep to yourself.
        </h1>
        <p className="max-w-lg text-base leading-7 text-muted dark:text-slate-400">
          Download your story-ready card, share it with friends, or copy a link to the result.
        </p>
        <ShareActions imageUrl={`/share/${id}/image?${qs}`} title={`${shared.result.big} ${shared.result.title}`} />
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-blue-hover">
          {reroll && (
            <Link href={reroll} className="inline-flex items-center gap-2">
              Roll again <ToolIcon name="sparkles" size={16} />
            </Link>
          )}
          <Link href={`/tool/${id}`} className="inline-flex items-center gap-2">
            Try it for someone else <ToolIcon name="arrow" size={16} />
          </Link>
          <Link href="/fun" className="inline-flex items-center gap-2">
            Try another fun tool <ToolIcon name="arrow" size={16} />
          </Link>
        </div>
      </div>
      <div className="rounded-3xl bg-surface p-6 dark:bg-slate-900 sm:p-10">
        <ShareCard result={shared.result} icon={tool.icon} />
      </div>
    </div>
  );
}
