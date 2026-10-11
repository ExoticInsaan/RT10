import type { ReactNode } from "react";
import Link from "next/link";
import cn from "@/lib/design/twStyles";

type Variant = "primary" | "secondary" | "ghost" | "icon";

type Common = { children: ReactNode; className?: string; variant?: Variant; ariaLabel?: string };

type AsButton = Common & {
  href?: undefined;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

type AsLink = Common & { href: string };

/** Design-system button. Pass `href` to render a Next.js link styled as a button. */
export default function Button(props: AsButton | AsLink) {
  const { children, className = "", variant = "primary", ariaLabel } = props;
  const classes = cn(`button button-${variant} ${className}`);
  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <button
      aria-label={ariaLabel}
      className={classes}
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {children}
    </button>
  );
}
