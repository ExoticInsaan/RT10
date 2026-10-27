import Link from "next/link";
import Logo from "@/components/shell/Logo";

function FooterLinks({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <nav className="flex flex-col gap-3 text-sm" aria-label={title}>
      <strong className="mb-1 text-xs uppercase tracking-widest text-blue">{title}</strong>
      {links.map(([label, href]) => (
        <Link key={label} href={href} className="transition hover:text-white">
          {label}
        </Link>
      ))}
    </nav>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-navy pb-24 pt-12 text-slate-300 md:pb-0">
      <div className="container-app grid gap-10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
            Useful tools for students, forms and everyday life. Fast, private and free.
          </p>
        </div>
        <FooterLinks
          title="Tools"
          links={[
            ["All Tools", "/tools"],
            ["Document Tools", "/tools/documents"],
            ["Student Tools", "/tools/students"],
          ]}
        />
        <FooterLinks
          title="Explore"
          links={[
            ["Fun Zone", "/fun"],
            ["My Tools", "/my-tools"],
          ]}
        />
        <FooterLinks
          title="TopperShelf"
          links={[
            ["About", "/about"],
            ["Founders", "/founders"],
            ["Contact", "/contact"],
            ["Privacy", "/privacy"],
            ["Terms", "/terms"],
          ]}
        />
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
        © 2026 TopperShelf. Built to make small tasks feel smaller.
      </div>
    </footer>
  );
}
