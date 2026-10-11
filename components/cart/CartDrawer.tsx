"use client";

import { useEffect } from "react";
import cn from "@/lib/design/twStyles";
import { subjectAccent } from "@/lib/design/catalog";
import { products } from "@/lib/sample-data";
import BuyButton from "@/components/BuyButton";
import Button from "@/components/ui/Button";
import Cover from "@/components/ui/Cover";
import Icon from "@/components/ui/Icon";
import { useCart } from "@/components/cart/CartProvider";

export default function CartDrawer() {
  const { cart, cartOpen, closeCart, toggleCart } = useCart();

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, closeCart]);

  if (!cartOpen) return null;

  const items = products.filter((p) => cart.includes(p.slug));
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
                  subject={p.subject}
                  accent={subjectAccent[p.subject] ?? "surgical"}
                  coverLine={p.blurb}
                  small
                />
                <div>
                  <strong>{p.title}</strong>
                  <span>₹ {p.price}</span>
                  <BuyButton slug={p.slug} price={p.price} />
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
          <small>Each resource is bought separately. Use Buy now beside the item you want.</small>
        </div>
      </aside>
    </div>
  );
}
