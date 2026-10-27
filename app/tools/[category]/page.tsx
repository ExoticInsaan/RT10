import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolCard } from "@/components/tools/ui";
import { categoryContent } from "@/lib/tools/content";
import { categories, categoryFromSlug, categorySlug, tools } from "@/lib/tools/registry";

export function generateStaticParams() {
  return categories.map((category) => ({ category: categorySlug(category.name) }));
}

export async function generateMetadata({ params }: PageProps<"/tools/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) return {};
  const content = categoryContent[category.name];
  const hasReadyTools = tools.some((tool) => tool.category === category.name && tool.ready);
  return {
    title: content.title,
    description: content.intro,
    // The Fun Zone has its own richer page at /fun, so Google is told that one is the main version.
    alternates: { canonical: slug === "fun" ? "/fun" : `/tools/${slug}` },
    // A category page is only worth indexing once at least one of its tools really works.
    robots: hasReadyTools ? undefined : { index: false, follow: true },
  };
}

export default async function CategoryPage({ params }: PageProps<"/tools/[category]">) {
  const { category: slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();
  const content = categoryContent[category.name];
  const list = tools.filter((tool) => tool.category === category.name);
  // Working tools first, tools that are coming soon after them.
  const sorted = [...list].sort((a, b) => Number(!!b.ready) - Number(!!a.ready));
  return (
    <div className="container-app pb-20 pt-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted dark:text-slate-400">
        <Link href="/">Home</Link> › <Link href="/tools">Tools</Link> › {content.title}
      </nav>
      <span className="eyebrow">Category</span>
      <h1 className="mb-3 mt-4 text-4xl font-extrabold tracking-tight text-navy dark:text-white sm:text-5xl">{content.title}</h1>
      <p className="mb-8 max-w-2xl text-base leading-7 text-muted dark:text-slate-400">{content.intro}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
      <p className="mt-10 text-sm text-muted dark:text-slate-400">
        Looking for something else? <Link href="/tools" className="font-bold text-blue-hover">Browse all tools</Link>.
      </p>
    </div>
  );
}
