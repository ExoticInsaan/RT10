import Link from "next/link";
import Logo from "@/components/shell/Logo";
import { SUPPORT_EMAIL } from "@/components/shell/Legal";

const INSTAGRAM_URL = "https://www.instagram.com/toppershelf_official";

const columns: { title: string; links: [string, string][] }[] = [
  {
    title: "Explore",
    links: [
      ["The Shelf", "/the-shelf"],
      ["Fun Zone", "/fun"],
      ["My Shelf", "/my-shelf"],
    ],
  },
  {
    title: "Categories",
    links: [
      ["Documents", "/the-shelf/documents"],
      ["Students", "/the-shelf/students"],
      ["Fun", "/fun"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Founders", "/founders"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy"],
      ["Terms of Use", "/terms"],
    ],
  },
];

const linkClass = "text-sm text-slate-300 transition hover:text-white focus-visible:text-white";
const socialClass =
  "grid size-10 place-items-center rounded-full border border-white/15 text-slate-300 transition hover:border-white/40 hover:bg-white/10 hover:text-white";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-navy pb-24 text-slate-300 md:pb-0">
      <div className="container-app flex flex-col items-center text-center">
        {/* Brand block */}
        <div className="flex flex-col items-center gap-4 pb-10 pt-14">
          <Logo onDark />
          <p className="max-w-md text-sm leading-6 text-slate-400">
            Useful tools. A few silly ones. All free, one quick signup.
          </p>
          <div className="flex items-center gap-3">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="TopperShelf on Instagram" className={socialClass}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
              </svg>
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}`} aria-label={`Email ${SUPPORT_EMAIL}`} className={socialClass}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </a>
          </div>
        </div>

        {/* Link columns, centred */}
        <nav
          aria-label="Footer"
          className="grid w-full max-w-3xl grid-cols-2 gap-x-6 gap-y-10 border-t border-white/10 py-10 sm:grid-cols-4"
        >
          {columns.map((column) => (
            <div key={column.title} className="flex flex-col items-center gap-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white">{column.title}</h2>
              <ul className="flex flex-col items-center gap-2.5">
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className={linkClass}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Request-a-tool prompt */}
        <div className="mb-10 flex w-full max-w-3xl flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-6 sm:flex-row sm:justify-between sm:text-left">
          <div className="text-center sm:text-left">
            <p className="text-base font-bold text-white">Missing a tool?</p>
            <p className="text-sm text-slate-400">Tell us the small job you keep doing the hard way. The most-asked tools get built first.</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-blue px-5 text-sm font-bold text-navy transition hover:bg-white"
          >
            Request a tool
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-4">
        <div className="container-app flex flex-col items-center justify-center gap-1 text-center text-xs text-slate-500 sm:flex-row sm:gap-3">
          <span>© 2026 TopperShelf. All rights reserved.</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span>Made in India 🇮🇳 · Your files stay on your device wherever possible.</span>
        </div>
      </div>
    </footer>
  );
}
