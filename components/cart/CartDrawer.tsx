"use client";

import { useEffect } from "react";
import cn from "@/lib/design/twStyles";
import { accentFor, coverHeading } from "@/lib/design/catalog";
import { typeLabelOf } from "@/lib/catalog-config";
import CheckoutButton from "@/components/cart/CheckoutButton";
import Button from "@/components/ui/Button";
import Cover from "@/components/ui/Cover";
import Icon from "@/components/ui/Icon";
import { useCart } from "@/components/cart/CartProvider";

export default function CartDrawer() {
  const { cartItems: items, cartOpen, closeCart, toggleCart } = useCart();

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, closeCart]);

  if (!cartOpen) return null;

  const total = items.reduce((sum, p) => sum + p.price, 0);

  return (
    <div
      className={cn("drawer-backdrop")}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeCart();
      }}
    >
      <aside className={cn("cart-drawer")} aria-label="Shopping cart">
        <div className={cn("drawer-head")}>
          <h2>
            Your cart <span>{items.length}</span>
          </h2>
          <Button variant="icon" ariaLabel="Close cart" onClick={closeCart}>
            <Icon name="close" />
          </Button>
        </div>
        <div className={cn("drawer-items")}>
          {items.length ? (
            items.map((p) => (
              <div className={cn("drawer-item")} key={p.slug}>
                <Cover
                  title={p.title}
                  heading={coverHeading(p.title)}
                  accent={accentFor(p.title)}
                  coverLine={typeLabelOf(p.type)}
                  image={p.coverUrl}
                  small
                />
                <div>
                  <strong>{p.title}</strong>
                  <span>₹ {p.price}</span>
                </div>
                <Button variant="icon" ariaLabel={`Remove ${p.title}`} onClick={() => toggleCart(p.slug)}>
                  <Icon name="trash" size={17} />
                </Button>
              </div>
            ))
          ) : (
            <div className={cn("cart-empty")}>
              <Icon name="cart" size={34} />
              <h3>Your cart is empty</h3>
              <p>Find an exam-ready resource to get started.</p>
            </div>
          )}
        </div>
        <div className={cn("drawer-foot")}>
          <div>
            <span>Total</span>
            <strong>₹ {total}</strong>
          </div>
          {items.length > 0 && <CheckoutButton items={items} />}
          <small>One payment for everything in your cart. Your resources appear in My Library after payment.</small>
        </div>
      </aside>
    </div>
  );
}
