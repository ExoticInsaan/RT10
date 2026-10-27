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
  const shelfPicks = tools.filter((tool) => tool.category === "The Shelf" && tool.popular).slice(0, 3);
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
        <ShelfGrid list={shelfPicks} />
      </section>

      <section className="fun-field py-16 sm:py-20" aria-labelledby="home-fun">
        <div className="container-app">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="home-fun" className="m-0 font-display text-5xl font-normal tracking-tight text-white sm:text-6xl">
                Fun Zone
              </h2>
              <p className="mb-0 mt-2 max-w-lg text-white/90">Silly tests and small games with a result card made for your story.</p>
            </div>
            <Link
              href="/fun"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-navy transition hover:bg-navy hover:text-white"
            >
              Open the Fun Zone <ToolIcon name="arrow" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-5">
            {funPicks.map((tool, index) => (
              <FunSticker key={tool.id} tool={tool} tilt={tilts[index % tilts.length]} />
            ))}
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
