import Link from "next/link";
import Logo from "@/components/shell/Logo";

const links: [string, string][] = [
  ["About", "/about"],
  ["Founders", "/founders"],
  ["Contact", "/contact"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-navy pb-24 text-slate-300 md:pb-0">
      <div className="container-app flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
        <Logo />
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold" aria-label="TopperShelf">
          {links.map(([label, href]) => (
            <Link key={label} href={href} className="transition hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/10 py-3 text-center text-xs text-slate-500">
        © 2026 TopperShelf. Built to make small tasks feel smaller.
      </div>
    </footer>
  );
}
