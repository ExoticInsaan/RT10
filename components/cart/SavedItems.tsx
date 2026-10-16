"use client";

import cn from "@/lib/design/twStyles";
import ProductRow from "@/components/browse/ProductRow";
import SectionLabel from "@/components/ui/SectionLabel";
import { useCart } from "@/components/cart/CartProvider";

/** Resources the student saved with the heart button. Works without logging in. */
export default function SavedItems() {
  const { wishedItems: items } = useCart();
  if (!items.length) return null;
  return (
    <section className="mt-14" aria-labelledby="saved-title">
      <SectionLabel variant="content">Saved for later</SectionLabel>
      <h2 id="saved-title" className="font-display m-0 mb-6 text-[clamp(22px,2.4vw,30px)] font-normal text-navy">
        Your saved resources
      </h2>
      <div className={cn("product-list")}>
        {items.map((p) => (
          <ProductRow key={p.slug} p={p} />
        ))}
      </div>
    </section>
  );
}
