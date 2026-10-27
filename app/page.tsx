import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import ToolIcon from "@/components/tools/ToolIcon";
import HomeSearch from "@/components/tools/HomeSearch";
import { IconTile, SectionHead, ToolCard } from "@/components/tools/ui";
import { categories, categoryHref, tools } from "@/lib/tools/registry";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// The home page is one address: "/" (never /index).
export const metadata: Metadata = {
  title: { absolute: "TopperShelf: Free Online Tools for Students, Exams & Forms" },
  description:
    "Free, fast online tools for students: exam photo and signature resizer, CGPA converter, attendance calculator, leave letters and more. One quick sign-in, nothing to install.",
  alternates: { canonical: "/" },
};

// Tells Google the brand name, the logo and that the site has a search box (/tools?q=...).
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: ["TopperShelf", "Topper Shelf"],
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      email: "support@toppershelf.online",
      sameAs: ["https://www.instagram.com/toppershelf_official"],
      description: "Free online tools for files, numbers, words and everyday life.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/tools?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

const trust: [Parameters<typeof ToolIcon>[0]["name"], string, string][] = [
  ["zap", "Free to use", "No surprise paywalls"],
  ["shield", "Private", "Files stay yours"],
  ["lock", "One quick signup", "Use every tool"],
];

export default function Home() {
  const popular = tools.filter((tool) => tool.popular && tool.category !== "Fun").slice(0, 8);
  const funTools = tools.filter((tool) => tool.category === "Fun").slice(0, 3);
  return (
    <>
      <JsonLd data={structuredData} />
      <section className="container-app grid gap-8 pb-10 pt-12 lg:grid-cols-[1fr_23rem] lg:items-center lg:pb-14 lg:pt-18">
        <div>
          <span className="eyebrow">
            <ToolIcon name="sparkles" size={14} /> Free online tools for everyone
          </span>
          <h1 className="mb-5 mt-5 max-w-3xl text-5xl font-extrabold leading-none tracking-hero text-navy dark:text-white sm:text-6xl lg:text-7xl">
            Useful tools.
            <br />A few silly ones.
            <br />
            <span className="font-display font-normal italic text-blue-hover">All free.</span>
          </h1>
          <p className="mb-7 max-w-2xl text-base leading-7 text-muted dark:text-slate-400 sm:text-lg">
            Fast, simple tools for files, numbers, words and everyday life. Nothing to install. No confusing steps.
          </p>
          <HomeSearch />
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <ToolIcon name="zap" size={14} /> Quick to use
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ToolIcon name="shield" size={14} /> Private by design
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ToolIcon name="lock" size={14} /> One simple sign-in
            </span>
          </div>
        </div>
        <div className="relative hidden min-h-80 lg:block" aria-hidden="true">
          <div className="absolute left-7 top-4 w-64 -rotate-5 rounded-3xl border border-line bg-white p-5 shadow-card dark:border-slate-700 dark:bg-slate-900">
            <IconTile tool={tools[0]} large />
            <span className="mt-12 block h-3 w-28 rounded-full bg-slate-100 dark:bg-slate-700" />
            <span className="mt-3 block h-3 w-44 rounded-full bg-slate-100 dark:bg-slate-700" />
          </div>
          <div className="absolute bottom-2 right-1 w-64 rotate-4 rounded-3xl bg-navy p-5 text-white shadow-float">
            <span className="grid size-14 place-items-center rounded-2xl bg-violet text-white">
              <ToolIcon name="sparkles" size={27} />
            </span>
            <strong className="mt-12 block text-xl">70% cooked.</strong>
            <span className="mt-2 block text-sm text-slate-300">Still enough hope for a comeback.</span>
          </div>
          <span className="absolute right-2 top-8 grid size-12 place-items-center rounded-full bg-teal text-white shadow-lg">
            <ToolIcon name="checkCircle" />
          </span>
        </div>
      </section>

      <section className="border-y border-line bg-surface/70 py-5 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="container-app hide-scrollbar flex gap-3 overflow-x-auto">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={categoryHref(category.name)}
              className="flex min-w-max items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy transition hover:border-blue hover:bg-blue-soft dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <ToolIcon name={category.icon} size={16} />
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-app section-space">
        <SectionHead
          eyebrow="Made for real life"
          title="Popular tools"
          description="The everyday favourites people come back to."
          href="/tools"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((tool) => (
            <ToolCard key={tool.id} tool={tool} compact />
          ))}
        </div>
      </section>

      <section className="container-app pb-16">
        <div className="overflow-hidden rounded-3xl bg-fun-gradient p-6 sm:p-9">
          <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-widest text-purple-700">
                Fun Zone
              </span>
              <h2 className="mb-2 mt-4 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
                Serious tools can take five.
              </h2>
              <p className="m-0 text-sm text-slate-700">Playful results made for group chats and story shares.</p>
            </div>
            <Link href="/fun" className="inline-flex items-center gap-2 text-sm font-bold text-navy">
              Enter Fun Zone <ToolIcon name="arrow" size={16} />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {funTools.map((tool, index) => (
              <Link
                key={tool.id}
                href={`/tool/${tool.id}`}
                className={`rounded-2xl border border-white/70 p-5 shadow-sm transition hover:-translate-y-1 ${
                  ["bg-orange-100", "bg-sky-100", "bg-purple-100"][index]
                }`}
              >
                <IconTile tool={tool} large />
                <h3 className="mb-1 mt-6 text-lg font-extrabold text-navy">{tool.name}</h3>
                <p className="m-0 text-sm leading-6 text-slate-600">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white py-7 dark:border-slate-800 dark:bg-slate-900">
        <div className="container-app grid gap-5 text-center sm:grid-cols-3">
          {trust.map(([icon, title, text]) => (
            <div
              key={title}
              className="flex items-center justify-center gap-3 sm:border-r sm:border-line sm:last:border-0 dark:sm:border-slate-700"
            >
              <span className="text-blue-hover">
                <ToolIcon name={icon} />
              </span>
              <span className="text-left">
                <strong className="block text-sm text-navy dark:text-white">{title}</strong>
                <small className="text-xs text-muted dark:text-slate-400">{text}</small>
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
