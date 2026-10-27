import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import ToolIcon from "@/components/tools/ToolIcon";
import HomeSearch from "@/components/tools/HomeSearch";
import { IconTile, SectionHead, ToolCard } from "@/components/tools/ui";
import { categories, tools } from "@/lib/tools/registry";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// The home page is one address: "/" (never /index).
export const metadata: Metadata = {
  title: { absolute: "TopperShelf: Free Online Tools for Students & Everyday Life" },
  description:
    "Free, fast online tools in two places: The Shelf for useful jobs like exam photo resizing, letters, PDFs and CGPA, and the Fun Zone for shareable fun. One quick sign-in, nothing to install.",
  alternates: { canonical: "/" },
};

// Tells Google the brand name, the logo and that the site has a search box (/the-shelf?q=...).
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
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/the-shelf?q={search_term_string}` },
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

// Clickable spots over the shelf picture (percent of the image). Update hrefs as new tools go live.
const shelfLinks = [
  { label: "PDF toolkit", href: "/tool/pdf-toolkit", x: 22.2, y: 41.4, w: 12.2, h: 18.4 },
  { label: "Days countdown", href: "/tool/days-countdown", x: 37.2, y: 41.4, w: 12.2, h: 18.4 },
  { label: "All tools on The Shelf", href: "/the-shelf", x: 52, y: 41.4, w: 12.2, h: 18.4 },
  { label: "More tools", href: "/the-shelf", x: 66.5, y: 41.4, w: 12.2, h: 18.4 },
  { label: "How cooked are you?", href: "/tool/how-cooked", x: 24.1, y: 71.8, w: 11.8, h: 17.8 },
  { label: "Instant vibe check", href: "/tool/vibe-check", x: 38, y: 71.8, w: 11.8, h: 17.8 },
  { label: "Roast my timetable", href: "/tool/roast-my-timetable", x: 51.8, y: 71.8, w: 11.8, h: 17.8 },
  { label: "More in the Fun Zone", href: "/fun", x: 65.5, y: 71.8, w: 11.8, h: 17.8 },
];

export default function Home() {
  const popular = tools.filter((tool) => tool.popular && tool.category === "The Shelf").slice(0, 8);
  const funTools = tools.filter((tool) => tool.category === "Fun Zone").slice(0, 3);
  return (
    <>
      <JsonLd data={structuredData} />
      <section className="container-app grid gap-8 pb-10 pt-12 lg:grid-cols-[1fr_30rem] xl:grid-cols-[1fr_36rem] lg:items-center lg:pb-14 lg:pt-18">
        <div>
          <span className="eyebrow">
            <ToolIcon name="sparkles" size={14} /> Free online tools for everyone
          </span>
          <h1 className="mb-5 mt-5 max-w-3xl text-5xl font-extrabold leading-none tracking-hero text-navy sm:text-6xl lg:text-7xl">
            Useful tools.
            <br />A few silly ones.
            <br />
            <span className="font-display font-normal italic text-blue-hover">All free.</span>
          </h1>
          <p className="mb-7 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Two shelves, one simple site. The Shelf has the useful tools for real jobs. The Fun Zone has the silly ones worth
            sharing. Nothing to install, no confusing steps.
          </p>
          <HomeSearch />
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
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
        <div className="shelf-stage hidden lg:block">
          <div className="shelf">
            <Image
              src="/toppershelf-board.webp"
              alt="TopperShelf wooden bookshelf with a graduation owl, The Shelf tools, and Fun Zone"
              width={1536}
              height={1024}
              priority
              sizes="(min-width: 1280px) 40rem, 34rem"
              className="shelf-image"
              draggable={false}
            />
            {shelfLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className="toggle-key"
                style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.w}%`, height: `${item.h}%` }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="container-app pb-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((category) => {
            const count = tools.filter((tool) => tool.category === category.name).length;
            const fun = category.name === "Fun Zone";
            return (
              <Link
                key={category.name}
                href={category.href}
                className={`group flex items-start gap-4 rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-card ${
                  fun ? "border-purple-200 bg-purple-50" : "border-line bg-white hover:border-blue/60"
                }`}
              >
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-xl ${
                    fun ? "bg-purple-100 text-purple-600" : "bg-blue-soft text-blue-hover"
                  }`}
                >
                  <ToolIcon name={category.icon} size={22} />
                </span>
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <strong className="text-lg font-extrabold text-navy">{category.name}</strong>
                    <span className="text-xs font-semibold text-muted">{count} tools</span>
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted">{category.blurb}</span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-navy">
                    Open {category.name} <ToolIcon name="arrow" size={14} />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-app section-space">
        <SectionHead
          eyebrow="From The Shelf"
          title="Popular tools"
          description="The useful favourites people come back to."
          href="/the-shelf"
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

      <section className="border-y border-line bg-white py-7">
        <div className="container-app grid gap-5 text-center sm:grid-cols-3">
          {trust.map(([icon, title, text]) => (
            <div
              key={title}
              className="flex items-center justify-center gap-3 sm:border-r sm:border-line sm:last:border-0"
            >
              <span className="text-blue-hover">
                <ToolIcon name={icon} />
              </span>
              <span className="text-left">
                <strong className="block text-sm text-navy">{title}</strong>
                <small className="text-xs text-muted">{text}</small>
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
