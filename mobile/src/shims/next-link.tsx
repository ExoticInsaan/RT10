import type { AnchorHTMLAttributes, MouseEvent } from "react";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string | { pathname?: string }; prefetch?: boolean; scroll?: boolean; replace?: boolean };

/** Stand-in for next/link: internal paths become #/ routes, external links stay normal. */
export default function Link({ href, prefetch, scroll, replace, onClick, children, ...rest }: Props) {
  void prefetch, scroll;
  const raw = typeof href === "string" ? href : (href.pathname ?? "/");
  const external = /^(https?:|mailto:|tel:)/.test(raw);
  const target = external ? raw : "#" + (raw.startsWith("/") ? raw : "/" + raw);
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (!external && replace && !e.defaultPrevented) {
      e.preventDefault();
      window.location.replace(target);
    }
  };
  return (
    <a href={target} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
