import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import FunSticker from "@/components/tools/FunSticker";
import HomeSearch from "@/components/tools/HomeSearch";
import ToolIcon from "@/components/tools/ToolIcon";
import { ShelfGrid } from "@/components/tools/ToolsBrowser";
import { tools } from "@/lib/tools/registry";
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
  ["zap", "Free, every tool", "No paywalls, no watermarks, nothing to install."],
  ["shield", "Your files stay with you", "File tools work right in your browser wherever they can."],
  ["lock", "One quick sign-in", "Sign in once with Google and every tool is yours."],
];

// Straight links for the most-searched jobs, shown under the search box.
const quickLinks: [string, string][] = [
  ["CGPA to %", "/tool/cgpa-calculator"],
  ["Compress an image", "/tool/image-compressor"],
  ["Attendance", "/tool/attendance-calculator"],
  ["QR code", "/tool/qr-code-generator"],
];

// Clickable spots over the shelf picture (percent of the image), matched to what each drawn icon shows.
const shelfLinks = [
  { label: "PDF Toolkit", href: "/tool/pdf-toolkit", x: 22.2, y: 41.4, w: 12.2, h: 18.4 },
  { label: "Reminder", href: "/tool/reminder", x: 37.2, y: 41.4, w: 12.2, h: 18.4 },
  { label: "Focus Timer", href: "/tool/focus-timer", x: 52, y: 41.4, w: 12.2, h: 18.4 },
  { label: "More on The Shelf", href: "/the-shelf", x: 66.5, y: 41.4, w: 12.2, h: 18.4 },
  { label: "Decision Wheel", href: "/tool/decision-wheel", x: 24.1, y: 71.8, w: 11.8, h: 17.8 },
  { label: "Friendship Score", href: "/tool/friendship-score", x: 38, y: 71.8, w: 11.8, h: 17.8 },
  { label: "How Well Do You Know Me?", href: "/tool/how-well-do-you-know-me", x: 51.8, y: 71.8, w: 11.8, h: 17.8 },
  { label: "More in the Fun Zone", href: "/fun", x: 65.5, y: 71.8, w: 11.8, h: 17.8 },
];

export default function Home() {
  const shelfPicks = ["pdf-toolkit", "focus-timer", "image-compressor"]
    .map((id) => tools.find((tool) => tool.id === id))
    .filter((tool): tool is (typeof tools)[number] => Boolean(tool));
  const shelfCount = tools.filter((tool) => tool.category === "The Shelf").length;
  const fun = tools.filter((tool) => tool.category === "Fun Zone");
  const funPicks = [...fun].sort((a, b) => Number(!!b.popular) - Number(!!a.popular)).slice(0, 5);
  const tilts = [-2, 1.5, -1, 2, -1.5];
  return (
    <>
      <JsonLd data={structuredData} />

      <section className="container-app grid gap-10 pb-16 pt-12 lg:grid-cols-[1fr_32rem] lg:items-center lg:pb-20 lg:pt-20 xl:grid-cols-[1fr_36rem]">
        <div>
          <h1 className="m-0 max-w-2xl font-display text-5xl font-normal leading-[1.02] tracking-tight text-navy sm:text-6xl lg:text-7xl">
            Useful tools.
            <br />A few silly ones.
            <br />All free.
          </h1>
          <p className="mb-8 mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
            Shrink a photo for a form, work out your CGPA, or find out how cooked you are. Open a tool, get it done, get on
            with your day.
          </p>
          <HomeSearch />
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="mr-1 text-muted">Popular:</span>
            {quickLinks.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full border border-line bg-white px-3 py-1.5 font-semibold text-navy transition hover:border-blue hover:bg-blue-soft"
              >
                {label}
              </Link>
            ))}
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
              sizes="(min-width: 1280px) 36rem, 32rem"
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

      <section className="container-app pb-20" aria-labelledby="home-shelf">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="home-shelf" className="m-0 font-display text-4xl font-normal tracking-tight text-navy sm:text-5xl">
              The Shelf
            </h2>
            <p className="mb-0 mt-2 max-w-lg text-muted">Tools for the jobs that keep coming back. Here are the favourites.</p>
          </div>
          <Link href="/the-shelf" className="inline-flex items-center gap-2 text-sm font-bold text-blue-hover">
            See all {shelfCount} tools <ToolIcon name="arrow" size={16} />
          </Link>
        </div>
        <ShelfGrid list={shelfPicks}>
          {/* Fills the empty fourth slot when the row has two columns; three columns are already full. */}
          <Link href="/the-shelf" className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-hover lg:hidden">
            <div className="shelf-object relative mx-2 flex aspect-[4/3] flex-col items-center justify-end overflow-hidden rounded-t-2xl rounded-b-md border-2 border-dashed border-blue/50 bg-blue-soft">
              {/* The TopperShelf owl peeks up from the bottom of the frame and points people to the full shelf. */}
              <span className="relative mb-2 rounded-2xl bg-white px-3 py-1.5 text-xs font-extrabold text-blue-hover shadow-sm transition-colors group-hover:bg-blue-hover group-hover:text-white sm:text-sm">
                View all {shelfCount}
                <span
                  className="absolute -bottom-1 left-1/2 size-2.5 -translate-x-1/2 rotate-45 bg-inherit"
                  aria-hidden="true"
                />
              </span>
              <Image src="/mascot/owl-peek.webp" alt="" width={360} height={282} className="h-auto w-[52%]" />
            </div>
            <div className="shelf-plank" aria-hidden="true" />
            <div className="px-1 pt-3 sm:px-2 sm:pt-4">
              <h3 className="m-0 text-sm font-bold leading-5 tracking-tight text-navy sm:text-base">More on The Shelf</h3>
              <p className="m-0 mt-1 text-[0.8rem] leading-5 text-muted sm:text-sm sm:leading-6">QR codes, flashcards, reminders and more.</p>
            </div>
          </Link>
        </ShelfGrid>
      </section>

      <section className="container-app pb-6" aria-labelledby="home-fun">
        <div className="rounded-[2rem] bg-fun-gradient px-5 py-10 sm:px-10 sm:py-12">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="home-fun" className="m-0 font-display text-5xl font-normal tracking-tight text-navy sm:text-6xl">
                Fun Zone
              </h2>
              <p className="mb-0 mt-2 max-w-lg text-slate-700">Silly tests and small games with a result card made for your story.</p>
            </div>
            <Link
              href="/fun"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 text-sm font-bold text-white transition hover:bg-purple-600"
            >
              Open the Fun Zone <ToolIcon name="arrow" size={16} />
            </Link>
          </div>
          <div className="fun-light grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-5">
            {funPicks.map((tool, index) => (
              <FunSticker key={tool.id} tool={tool} tilt={tilts[index % tilts.length]} />
            ))}
            {/* Sixth sticker evens out the grid at two and three columns; five columns are already full. */}
            <Link
              href="/fun"
              className="fun-sticker group flex flex-col items-center justify-center gap-3 rounded-[1.75rem] border-2 border-dashed border-purple-300 bg-white/70 p-6 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-600 lg:hidden"
              style={{ "--tilt": "1.5deg" } as CSSProperties}
            >
              <span className="grid size-12 place-items-center rounded-full bg-purple-600 text-white transition-colors group-hover:bg-navy">
                <ToolIcon name="arrow" size={20} />
              </span>
              <span className="text-base font-extrabold text-navy">See all {fun.length}</span>
              <span className="text-sm text-muted">More games and silly tests</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="container-app py-16">
        <ul className="m-0 grid list-none gap-8 p-0 sm:grid-cols-3">
          {trust.map(([icon, title, text]) => (
            <li key={title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-soft text-blue-hover">
                <ToolIcon name={icon} size={20} />
              </span>
              <span>
                <strong className="block text-base text-navy">{title}</strong>
                <span className="mt-1 block text-sm leading-6 text-muted">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
