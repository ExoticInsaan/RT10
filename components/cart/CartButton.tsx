"use client";

import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useCart } from "@/components/cart/CartProvider";

/** Add/remove a product from the cart. `row` = product list row, `icon` = card icon, `detail` = product page. */
export default function CartButton({ slug, variant }: { slug: string; variant: "row" | "icon" | "detail" }) {
  const { cart, toggleCart } = useCart();
  const inCart = cart.includes(slug);
  const label = inCart ? "Remove from cart" : "Add to cart";

  if (variant === "icon") {
    return (
      <Button
        variant="icon"
        ariaLabel={label}
        className={cn(inCart ? "active" : "")}
        onClick={() => toggleCart(slug)}
      >
        <Icon name="cart" size={19} />
      </Button>
    );
  }
  if (variant === "detail") {
    return (
      <Button variant="secondary" onClick={() => toggleCart(slug)}>
        {label} <Icon name="cart" />
      </Button>
    );
  }
  return (
    <Button className={cn(`row-cart ${inCart ? "added" : ""}`)} onClick={() => toggleCart(slug)}>
      {inCart ? "Added" : "Add to cart"} <Icon name={inCart ? "check" : "arrow"} size={15} />
    </Button>
  );
}
