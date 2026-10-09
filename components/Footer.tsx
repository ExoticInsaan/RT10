import Link from "next/link";

const links = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund", label: "Refund policy" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>© TopperShelf. Study material for nursing students.</p>
        <ul className="flex flex-wrap gap-4">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-teal-700">{l.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
