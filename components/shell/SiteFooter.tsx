import Link from "next/link";

const INSTAGRAM_URL = "https://www.instagram.com/toppershelf_official";

// Only pages that are not already in the header nav.
const links: [string, string][] = [
  ["Contact", "/contact"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
];

const linkClass = "transition hover:text-white focus-visible:text-white";

export default function SiteFooter() {
  return (
    // pb-20 on mobile keeps the bar clear of the fixed bottom navigation.
    <footer className="border-t border-slate-800 bg-navy pb-20 text-xs text-slate-400 md:pb-0">
      <div className="container-app flex flex-col items-center justify-between gap-2 py-4 sm:flex-row">
        <p>© 2026 TopperShelf</p>
        <nav aria-label="Footer" className="flex items-center gap-5">
          {links.map(([label, href]) => (
            <Link key={label} href={href} className={linkClass}>
              {label}
            </Link>
          ))}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TopperShelf on Instagram"
            className={linkClass}
          >
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
            </svg>
          </a>
        </nav>
      </div>
    </footer>
  );
}
