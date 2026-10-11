"use client";

import { useState } from "react";
import Link from "next/link";
import cn from "@/lib/design/twStyles";
import Brand from "@/components/ui/Brand";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import HeaderAuth from "@/components/HeaderAuth";
import { useCart } from "@/components/cart/CartProvider";

const navLinks = [
  { href: "/browse", label: "Browse" },
  { href: "/library", label: "My Library" },
  { href: "/founders", label: "Founders" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart, openCart } = useCart();
  return (
    <header className={cn("site-header")}>
      <div className={cn("header-inner")}>
        {/* Wrapper owns the show/hide so it can't clash with the button's own display style. */}
        <div className="hidden max-[900px]:flex max-[900px]:-ml-2.5">
          <Button
            variant="icon"
            ariaLabel={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? "close" : "menu"} size={19} />
          </Button>
        </div>
        <Brand />
        <nav className={cn(menuOpen ? "nav-open" : "")} aria-label="Primary navigation">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className={cn("header-actions")}>
          <Link href="/browse" className={cn("icon-link")} aria-label="Search">
            <Icon name="search" />
          </Link>
          <Button variant="icon" ariaLabel={`Cart with ${cart.length} items`} onClick={openCart}>
            <Icon name="cart" />
            {cart.length > 0 && <span className={cn("count")}>{cart.length}</span>}
          </Button>
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
