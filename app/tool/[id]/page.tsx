import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import ToolIcon from "@/components/tools/ToolIcon";
import ToolGate from "@/components/tools/ToolGate";
import { IconTile } from "@/components/tools/ui";
import { toolContent } from "@/lib/tools/content";
import { categoryHref, toolById, tools } from "@/lib/tools/registry";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return tools.map((tool) => ({ id: tool.id }));
}

export async function generateMetadata({ params }: PageProps<"/tool/[id]">): Promise<Metadata> {
  const { id } = await params;
  const tool = toolById(id);
  if (!tool) return {};
  return {
    title: tool.name,
    description: `${tool.description} Free online ${tool.name.toLowerCase()} on TopperShelf.`,
    alternates: { canonical: `/tool/${tool.id}` },
    // Tools that are not built yet stay out of Google until they work.
    robots: tool.ready ? undefined : { index: false, follow: true },
  };
}

export default async function ToolPage({ params }: PageProps<"/tool/[id]">) {
  const { id } = await params;
  const tool = toolById(id);
  if (!tool) notFound();
  const content = toolContent[tool.id];
  const related = tools
    .filter((t) => t.category === tool.category && t.id !== tool.id)
    .sort((a, b) => Number(!!b.ready) - Number(!!a.ready))
    .slice(0, 3);
  const url = `${SITE_URL}/tool/${tool.id}`;

  // Structured data is only added for tools that really work, so Google never reads about a tool that is not there yet.
  const structuredData = tool.ready
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebApplication",
            "@id": `${url}#app`,
            name: tool.name,
            url,
            description: tool.description,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            browserRequirements: "Requires JavaScript",
            inLanguage: "en-IN",
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools` },
              { "@type": "ListItem", position: 3, name: tool.category, item: `${SITE_URL}${categoryHref(tool.category)}` },
              { "@type": "ListItem", position: 4, name: tool.name, item: url },
            ],
          },
          ...(content?.faq.length
            ? [
                {
                  "@type": "FAQPage",
                  mainEntity: content.faq.map((item) => ({
                    "@type": "Question",
                    name: item.q,
                    acceptedAnswer: { "@type": "Answer", text: item.a },
                  })),
                },
              ]
            : []),
        ],
      }
    : null;

  return (
    <div className="container-app pb-20 pt-10">
      {structuredData && <JsonLd data={structuredData} />}
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted dark:text-slate-400">
        <Link href="/">Home</Link> › <Link href="/tools">Tools</Link> ›{" "}
        <Link href={categoryHref(tool.category)}>{tool.category}</Link> › {tool.name}
      </nav>
      <div className="mb-8 flex items-start gap-4">
        <IconTile tool={tool} large />
        <div>
          <h1 className="m-0 text-3xl font-extrabold tracking-tight text-navy dark:text-white sm:text-4xl">{tool.name}</h1>
          <p className="mb-0 mt-2 text-muted dark:text-slate-400">{tool.description}</p>
        </div>
      </div>
      <ToolGate toolId={tool.id} toolName={tool.name} />

      {content && (
        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
          <div className="grid gap-10">
            <section>
              <h2 className="mb-4 text-xl font-extrabold text-navy dark:text-white">How to use {tool.name}</h2>
              <ol className="m-0 grid list-none gap-3 p-0">
                {content.howTo.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-blue-soft text-xs font-bold text-blue-hover dark:bg-blue-950">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </section>
            <section>
              <h2 className="mb-4 text-xl font-extrabold text-navy dark:text-white">Frequently asked questions</h2>
              <div className="grid gap-3">
                {content.faq.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-2xl border border-line bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-navy dark:text-white">
                      {item.q}
                      <span className="transition group-open:rotate-90">
                        <ToolIcon name="chevron" size={16} />
                      </span>
                    </summary>
                    <p className="mb-0 mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>
          {content.privacyNote && (
            <aside className="rounded-2xl border border-line bg-surface p-5 dark:border-slate-800 dark:bg-slate-900">
              <span className="grid size-10 place-items-center rounded-xl bg-blue-soft text-blue-hover dark:bg-blue-950">
                <ToolIcon name="shield" size={19} />
              </span>
              <strong className="mb-1 mt-4 block text-sm text-navy dark:text-white">Good to know</strong>
              <p className="m-0 text-sm leading-6 text-slate-700 dark:text-slate-300">{content.privacyNote}</p>
            </aside>
          )}
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-xl font-extrabold text-navy dark:text-white">More tools you may need</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((t) => (
              <Link
                key={t.id}
                href={`/tool/${t.id}`}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 transition hover:border-blue/60 dark:border-slate-800 dark:bg-slate-900"
              >
                <IconTile tool={t} />
                <span className="text-sm font-bold text-navy dark:text-white">{t.name}</span>
                <ToolIcon name="chevron" size={16} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
