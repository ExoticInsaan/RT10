import Link from "next/link";
import Logo from "@/components/shell/Logo";

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
    // pb-20 on mobile keeps the footer clear of the fixed bottom navigation.
    <footer className="border-t border-slate-800 bg-navy pb-20 text-slate-400 md:pb-0">
      <div className="container-app flex flex-col items-center justify-between gap-5 py-7 text-center sm:flex-row sm:text-left">
        <div className="flex flex-col items-center gap-1.5 sm:items-start">
          <Logo small onDark />
          <p className="text-sm text-slate-400">Useful tools. A few silly ones. All free.</p>
        </div>
        <nav aria-label="Footer" className="flex items-center gap-5 text-sm">
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
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
            </svg>
          </a>
        </nav>
      </div>
      <div className="border-t border-white/10 py-3 text-center text-xs text-slate-500">© 2026 TopperShelf</div>
    </footer>
  );
}
