"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/shell/Logo";
import ToolIcon from "@/components/tools/ToolIcon";
import { Button } from "@/components/tools/ui";
import { useAuth } from "@/components/AuthProvider";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/the-shelf", label: "The Shelf" },
  { href: "/fun", label: "Fun Zone" },
  { href: "/my-shelf", label: "My Shelf" },
  { href: "/founders", label: "Founders" },
  { href: "/about", label: "About" },
];

function isActive(path: string | null, href: string) {
  if (!path) return false;
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
}

// The links themselves. `path` is null while the current address is not known yet (static prerender).
function NavLinks({ path, onNavigate }: { path: string | null; onNavigate: () => void }) {
  return navLinks.map((link) => {
    const active = isActive(path, link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`transition hover:text-blue-hover ${
          active ? "text-blue-hover underline decoration-2 underline-offset-8" : ""
        }`}
      >
        {link.label}
      </Link>
    );
  });
}

// Reading the address needs <Suspense> with Cache Components; the plain links show until it resolves.
function ActiveNavLinks({ onNavigate }: { onNavigate: () => void }) {
  return <NavLinks path={usePathname()} onNavigate={onNavigate} />;
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, ready, openSignIn, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ivory/90 backdrop-blur-xl">
      <div className="container-app flex h-18 items-center justify-between gap-8">
        <Logo small />
        <nav
          aria-label="Primary navigation"
          className={`items-center gap-8 text-sm font-semibold text-navy md:flex ${
            open
              ? "absolute inset-x-0 top-18 flex flex-col items-start border-b border-line bg-ivory p-6 shadow-lg"
              : "hidden"
          }`}
        >
          <Suspense fallback={<NavLinks path={null} onNavigate={() => setOpen(false)} />}>
            <ActiveNavLinks onNavigate={() => setOpen(false)} />
          </Suspense>
        </nav>
        <div className="flex items-center gap-1">
          {ready && user ? (
            <Button variant="secondary" className="hidden min-h-10 rounded-lg px-4 sm:inline-flex" onClick={signOut}>
              Log out
            </Button>
          ) : (
            <Button variant="secondary" className="hidden min-h-10 rounded-lg px-4 sm:inline-flex" onClick={openSignIn}>
              Sign in
            </Button>
          )}
          <Button
            variant="icon"
            className="md:hidden"
            ariaLabel={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
          >
            <ToolIcon name={open ? "close" : "menu"} />
          </Button>
        </div>
      </div>
    </header>
  );
}
