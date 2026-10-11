import type { ReactNode } from "react";
import cn from "@/lib/design/twStyles";

const iconPaths: Record<string, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2l2 11h10l2-8H6" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="17" cy="20" r="1" />
    </>
  ),
  heart: (
    <path d="M20.8 5.8a5.4 5.4 0 0 0-7.6 0L12 7l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 22l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z" />
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  filter: <path d="M4 5h16l-6 7v6l-4 2v-8Z" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  book: (
    <>
      <path d="m4 6 8-3 8 3v12l-8 3-8-3Z" />
      <path d="M12 3v18M4 6l8 3 8-3" />
    </>
  ),
  shield: <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6Z" />,
  bolt: <path d="m13 2-8 12h7l-1 8 8-12h-7Z" />,
  sparkle: (
    <path d="M12 2.8c.6 4.7 2.5 6.6 7.2 7.2-4.7.6-6.6 2.5-7.2 7.2-.6-4.7-2.5-6.6-7.2-7.2 4.7-.6 6.6-2.5 7.2-7.2ZM19 16.5c.2 1.7.8 2.3 2.5 2.5-1.7.2-2.3.8-2.5 2.5-.2-1.7-.8-2.3-2.5-2.5 1.7-.2 2.3-.8 2.5-2.5Z" />
  ),
  check: <path d="m5 12 4 4L19 6" />,
  trash: <path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7" />,
};

export default function Icon({ name, size = 20 }: { name: keyof typeof iconPaths | string; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("icon")}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[name]}
    </svg>
  );
}
