import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import type { CSSProperties } from "react";
import Image from "next/image";
import FunSticker from "@/components/tools/FunSticker";
import ShelfViewAll from "@/components/tools/ShelfViewAll";
import ToolIcon from "@/components/tools/ToolIcon";
import ToolGate from "@/components/tools/ToolGate";
import { ShelfGrid } from "@/components/tools/ToolsBrowser";
import { SaveButton } from "@/components/tools/ui";
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
  const fun = tool.category === "Fun Zone";
  const siblings = tools.filter((t) => t.category === tool.category && t.id !== tool.id);
  // Popular first, then registry order. Three fill one shelf; four fill a sticker row at two or four columns.
  const related = [...siblings].sort((a, b) => Number(!!b.popular) - Number(!!a.popular)).slice(0, fun ? 4 : 3);
  const url = `${SITE_URL}/tool/${tool.id}`;
  const sectionHref = categoryHref(tool.category);

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
              { "@type": "ListItem", position: 2, name: tool.category, item: `${SITE_URL}${sectionHref}` },
              { "@type": "ListItem", position: 3, name: tool.name, item: url },
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

  // The tool's picture, presented the way its section presents it: on a plank for The Shelf, a tilted sticker for fun.
  const picture = tool.image ? (
    fun ? (
      <div
        className="w-24 rounded-[1.25rem] bg-white p-1.5 shadow-[0_24px_48px_-16px_rgb(60_8_40/0.55)] sm:w-52 sm:rounded-[1.75rem] sm:p-2.5"
        style={{ rotate: "-4deg" } as CSSProperties}
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl sm:rounded-[1.3rem]" style={{ backgroundColor: tool.imageBg }}>
          <Image src={tool.image} alt="" fill priority sizes="13rem" className="scale-[1.04] object-cover" />
        </div>
      </div>
    ) : (
      <div className="w-36 sm:w-64 [--shelf-gap:1rem] sm:[--shelf-gap:1.5rem]">
        <div
          className={`relative mx-2 aspect-[4/3] overflow-hidden rounded-t-2xl rounded-b-md ${
            tool.imageBg === "#ffffff" || tool.imageBg === "#f8f8f8" ? "ring-1 ring-inset ring-line/70" : ""
          }`}
          style={{ backgroundColor: tool.imageBg }}
        >
          <Image
            src={tool.image}
            alt=""
            fill
            priority
            sizes="16rem"
            className={tool.imageFit === "cover" ? "object-cover" : "object-contain p-2 sm:p-4"}
          />
        </div>
        <div className="shelf-plank" aria-hidden="true" />
      </div>
    )
  ) : null;

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}

      <section className={fun ? "fun-field pb-28 pt-8 sm:pb-32" : "border-b border-line/70 bg-surface/50 pb-28 pt-8 sm:pb-32"}>
        <div className="container-app">
          <nav aria-label="Breadcrumb" className={`mb-6 text-sm sm:mb-8 ${fun ? "text-white/85" : "text-muted"}`}>
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <Link href={sectionHref} className="hover:underline">
              {tool.category}
            </Link>
          </nav>
          <div className="flex flex-col-reverse gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <div className="max-w-2xl">
              <h1
                className={`m-0 font-display text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl ${
                  fun ? "text-white" : "text-navy"
                }`}
              >
                {tool.name}
              </h1>
              <p className={`mb-6 mt-4 text-base leading-7 sm:text-lg ${fun ? "text-white/90" : "text-muted"}`}>
                {tool.description}
              </p>
              <SaveButton id={tool.id} onDark={fun} />
            </div>
            {picture && <div className="shrink-0 self-start sm:self-auto">{picture}</div>}
          </div>
        </div>
      </section>

      {/* The working area overlaps the header, so the tool is the first thing below the fold line on any screen. */}
      <div className="container-app relative -mt-20">
        <div className="rounded-[2rem] border border-line bg-white p-6 shadow-float sm:p-10">
          <ToolGate toolId={tool.id} toolName={tool.name} />
        </div>
      </div>

      <div className="container-app pb-24">
        {content && (
          <div className="mt-20 grid gap-14 lg:grid-cols-[1fr_22rem] lg:gap-16">
            <div className="grid gap-14">
              <section aria-labelledby="how-to">
                <h2 id="how-to" className="mb-6 mt-0 text-2xl font-extrabold tracking-tight text-navy">
                  How to use it
                </h2>
                <ol className="m-0 grid list-none gap-5 p-0">
                  {content.howTo.map((step, index) => (
                    <li key={step} className="flex gap-4">
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white ${
                          fun ? "bg-purple-600" : "bg-navy"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="pt-1.5 text-base leading-7 text-slate-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
              <section aria-labelledby="faq">
                <h2 id="faq" className="mb-6 mt-0 text-2xl font-extrabold tracking-tight text-navy">
                  Questions people ask
                </h2>
                <div className="divide-y divide-line border-y border-line">
                  {content.faq.map((item) => (
                    <details key={item.q} className="group py-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-navy">
                        {item.q}
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface text-navy transition group-open:rotate-45">
                          <span aria-hidden="true" className="text-lg leading-none">
                            +
                          </span>
                        </span>
                      </summary>
                      <p className="mb-0 mt-3 max-w-2xl text-sm leading-6 text-slate-700">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            </div>
            {content.privacyNote && (
              <aside className="h-max rounded-3xl bg-blue-soft p-6 lg:sticky lg:top-28">
                <span className="grid size-11 place-items-center rounded-xl bg-white text-blue-hover">
                  <ToolIcon name="shield" size={20} />
                </span>
                <h2 className="mb-2 mt-4 text-base font-bold text-navy">Good to know</h2>
                <p className="m-0 text-sm leading-6 text-slate-700">{content.privacyNote}</p>
              </aside>
            )}
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-20" aria-labelledby="related">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 id="related" className="m-0 text-2xl font-extrabold tracking-tight text-navy">
                {fun ? "More from the Fun Zone" : "More from The Shelf"}
              </h2>
              <Link href={sectionHref} className="inline-flex items-center gap-2 text-sm font-bold text-blue-hover">
                See all <ToolIcon name="arrow" size={16} />
              </Link>
            </div>
            {fun ? (
              <div className="fun-light rounded-[2rem] bg-fun-gradient px-4 py-8 sm:px-8">
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 lg:grid-cols-4">
                  {related.map((t, index) => (
                    <FunSticker key={t.id} tool={t} tilt={[-2, 1.5, -1, 2][index % 4]} />
                  ))}
                </div>
              </div>
            ) : (
              <ShelfGrid list={related}>
                <ShelfViewAll />
              </ShelfGrid>
            )}
          </section>
        )}
      </div>
    </>
  );
}
