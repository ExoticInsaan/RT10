"use client";

import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useCart } from "@/components/cart/CartProvider";
import { trackAddToCart, trackRemoveFromCart } from "@/lib/analytics";
import type { Product } from "@/lib/product-types";

/** Add/remove a product from the cart. `row` = product list row, `icon` = card icon, `detail` = product page. */
export default function CartButton({
  slug,
  variant,
  product,
}: {
  slug: string;
  variant: "row" | "icon" | "detail";
  product?: Pick<Product, "slug" | "title" | "type" | "price">;
}) {
  const { cart, toggleCart } = useCart();
  const inCart = cart.includes(slug);
  const label = inCart ? "Remove from cart" : "Add to cart";
  const toggle = () => {
    toggleCart(slug);
    if (product) (inCart ? trackRemoveFromCart : trackAddToCart)(product);
  };

  if (variant === "icon") {
    return (
      <Button
        variant="icon"
        ariaLabel={label}
        className={cn(inCart ? "active" : "")}
        onClick={toggle}
      >
        <Icon name="cart" size={19} />
      </Button>
    );
  }
  if (variant === "detail") {
    return (
      <Button variant="secondary" onClick={toggle}>
        {label} <Icon name="cart" />
      </Button>
    );
  }
  return (
    <Button
      className={cn(`row-cart ${inCart ? "added" : ""}`)}
      ariaLabel={label}
      onClick={toggle}
    >
      {inCart ? "Added" : "Add to cart"}
      <Icon name={inCart ? "check" : "cart"} size={15} />
    </Button>
  );
}
