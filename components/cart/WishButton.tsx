"use client";

import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useCart } from "@/components/cart/CartProvider";

/** Save/unsave a product. `row` = heart on a list row, `icon` = card icon, `detail` = product page. */
export default function WishButton({ slug, variant }: { slug: string; variant: "row" | "icon" | "detail" }) {
  const { wished, toggleWish } = useCart();
  const saved = wished.includes(slug);
  const label = saved ? "Remove from wishlist" : "Add to wishlist";

  if (variant === "detail") {
    return (
      <Button variant="secondary" onClick={() => toggleWish(slug)}>
        <Icon name="heart" /> {saved ? "Saved" : "Save to shelf"}
      </Button>
    );
  }
  return (
    <Button
      variant="icon"
      ariaLabel={label}
      className={cn(`${variant === "row" ? "wish" : ""} ${saved ? "active" : ""}`)}
      onClick={() => toggleWish(slug)}
    >
      <Icon name="heart" size={18} />
    </Button>
  );
}
