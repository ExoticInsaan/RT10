"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Logo from "@/components/shell/Logo";
import ToolIcon from "@/components/tools/ToolIcon";
import { Button } from "@/components/tools/ui";
import { useAuth } from "@/components/AuthProvider";

const navLinks = [
  { href: "/tools", label: "All Tools" },
  { href: "/fun", label: "Fun Zone" },
  { href: "/my-tools", label: "My Tools" },
  { href: "/founders", label: "Founders" },
  { href: "/about", label: "About" },
];

// Dark mode is a "dark" class on <html>, set before first paint by the script in app/layout.tsx.
function subscribeTheme(callback: () => void) {
  window.addEventListener("toppershelf:theme", callback);
  return () => window.removeEventListener("toppershelf:theme", callback);
}
const isDark = () => document.documentElement.classList.contains("dark");

function useTheme() {
  const dark = useSyncExternalStore(subscribeTheme, isDark, () => false);
  const toggle = () => {
    const next = !isDark();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("toppershelf-theme", next ? "dark" : "light");
    } catch {
      /* storage blocked: the choice lasts until the page reloads */
    }
    window.dispatchEvent(new Event("toppershelf:theme"));
  };
  return { dark, toggle };
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const { user, ready, openSignIn, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ivory/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="container-app flex h-18 items-center justify-between gap-8">
        <Logo small />
        <nav
          aria-label="Primary navigation"
          className={`items-center gap-8 text-sm font-semibold text-navy dark:text-slate-200 md:flex ${
            open
              ? "absolute inset-x-0 top-18 flex flex-col items-start border-b border-line bg-ivory p-6 shadow-lg dark:border-slate-800 dark:bg-slate-950"
              : "hidden"
          }`}
        >
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Button variant="icon" ariaLabel={dark ? "Use light mode" : "Use dark mode"} onClick={toggle}>
            <ToolIcon name={dark ? "sun" : "moon"} size={18} />
          </Button>
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
