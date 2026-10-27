"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import ToolIcon, { type ToolIconName } from "@/components/tools/ToolIcon";
import { toneClasses } from "@/components/tools/toneStyles";
import type { Tool } from "@/lib/tools/registry";
import { useStoredList } from "@/lib/tools/useStoredList";

export const FAVOURITES_KEY = "toppershelf-favourites";
export const RECENT_KEY = "toppershelf-recent";

const buttonStyles = {
  primary:
    "bg-blue-hover text-white shadow-sm hover:bg-navy min-h-12 px-5 rounded-xl",
  secondary:
    "border border-line bg-white text-navy hover:border-blue hover:bg-blue-soft min-h-12 px-5 rounded-xl",
  ghost:
    "text-muted hover:bg-blue-soft hover:text-navy min-h-11 px-3 rounded-xl",
  icon: "size-11 text-navy hover:bg-blue-soft rounded-full",
};

export type ButtonVariant = keyof typeof buttonStyles;

const base =
  "inline-flex cursor-pointer items-center justify-center gap-2 border-0 font-sans text-sm font-semibold transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60";

export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  onClick,
  ariaLabel,
  disabled,
}: {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  type?: "button" | "submit";
  onClick?: () => void;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={`${base} ${buttonStyles[variant]} ${className}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/** A link that looks like one of the buttons. */
export function ButtonLink({
  href,
  children,
  className = "",
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
}) {
  return (
    <Link href={href} className={`${base} ${buttonStyles[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function IconTile({
  tool,
  large = false,
}: {
  tool: Pick<Tool, "icon" | "tone" | "image" | "imageBg" | "imageFit">;
  large?: boolean;
}) {
  if (tool.image) {
    return (
      <span
        className={`relative block shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5 ${large ? "size-14" : "size-11"}`}
        style={{ backgroundColor: tool.imageBg }}
      >
        <Image
          src={tool.image}
          alt=""
          fill
          sizes={large ? "56px" : "44px"}
          className={tool.imageFit === "cover" ? "object-cover" : "object-contain p-1"}
        />
      </span>
    );
  }
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl ${toneClasses[tool.tone] ?? toneClasses.blue} ${
        large ? "size-14" : "size-11"
      }`}
    >
      <ToolIcon name={tool.icon} size={large ? 26 : 20} />
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  description,
  href,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-5">
      <div>
        {eyebrow && <span className="text-xs font-bold uppercase tracking-widest text-blue-hover">{eyebrow}</span>}
        <h2 className="mb-1 mt-2 text-3xl font-extrabold tracking-tight text-navy">{title}</h2>
        {description && <p className="m-0 text-sm text-muted">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="hidden items-center gap-1 text-sm font-bold text-blue-hover sm:inline-flex">
          View all <ToolIcon name="arrow" size={15} />
        </Link>
      )}
    </div>
  );
}

/** Heart button that saves a tool to this browser's favourites. */
export function FavoriteButton({ id, className = "absolute right-3 top-3" }: { id: string; className?: string }) {
  const [favourites, setFavourites] = useStoredList(FAVOURITES_KEY);
  const active = favourites.includes(id);
  return (
    <Button
      variant="icon"
      className={`${className} size-9 min-h-9 ${active ? "bg-red-50 text-red-500" : "text-muted"}`}
      ariaLabel={active ? "Remove from favourites" : "Add to favourites"}
      onClick={() =>
        setFavourites((current) => (current.includes(id) ? current.filter((x) => x !== id) : [id, ...current]))
      }
    >
      <ToolIcon name="heart" size={17} filled={active} />
    </Button>
  );
}

export function ToolCard({ tool, compact = false }: { tool: Tool; compact?: boolean }) {
  return (
    <article
      className={`group relative rounded-2xl border border-line bg-white transition hover:-translate-y-1 hover:border-blue/60 hover:shadow-card ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <FavoriteButton id={tool.id} />
      <Link href={`/tool/${tool.id}`} className="block pr-8">
        <IconTile tool={tool} />
        <h3 className="mb-1 mt-4 text-base font-bold tracking-tight text-navy">
          {tool.name}
        </h3>
        <p className="m-0 text-sm leading-6 text-muted">{tool.description}</p>
        {!compact && (
          <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-hover">
            Open tool <ToolIcon name="arrow" size={14} />
          </span>
        )}
      </Link>
    </article>
  );
}

export function SearchBox({
  value,
  onChange,
  onSubmit,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  compact?: boolean;
}) {
  return (
    <form
      role="search"
      className={`flex items-center gap-3 border border-line bg-white shadow-search transition focus-within:border-blue ${
        compact ? "h-12 rounded-xl px-4" : "h-16 rounded-2xl px-5"
      }`}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <span className="text-muted">
        <ToolIcon name="search" size={compact ? 18 : 21} />
      </span>
      <input
        aria-label="Search all tools"
        className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search tools: PDF, CGPA, QR code..."
      />
      <Button
        type="submit"
        className={compact ? "size-9 min-h-9! rounded-lg px-0!" : "max-sm:size-10 max-sm:min-h-10 max-sm:px-0"}
        ariaLabel="Search"
      >
        <ToolIcon name="arrow" size={18} />
        {!compact && <span className="max-sm:hidden">Search</span>}
      </Button>
    </form>
  );
}

export type { ToolIconName };
