"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ToolIcon, { type ToolIconName } from "@/components/tools/ToolIcon";

const items: [string, string, ToolIconName][] = [
  ["Home", "/", "home"],
  ["Shelf", "/the-shelf", "grid"],
  ["Fun", "/fun", "sparkles"],
  ["My Shelf", "/my-shelf", "heart"],
];

export default function MobileNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-ivory/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 md:hidden"
    >
      {items.map(([label, href, icon]) => {
        const active = href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
        return (
          <Link
            key={label}
            href={href}
            className={`flex min-h-13 flex-col items-center justify-center gap-1 rounded-xl text-[0.65rem] font-semibold ${
              active ? "bg-blue-soft text-blue-hover dark:bg-blue-950" : "text-muted dark:text-slate-400"
            }`}
          >
            <ToolIcon name={icon} size={19} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
