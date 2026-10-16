import Link from "next/link";
import cn from "@/lib/design/twStyles";
import { accentFor, coverHeading } from "@/lib/design/catalog";
import { courseLabel, termText, typeLabelOf } from "@/lib/catalog-config";
import type { Product } from "@/lib/product-types";
import Cover from "@/components/ui/Cover";
import CartButton from "@/components/cart/CartButton";
import WishButton from "@/components/cart/WishButton";

export default function PopularCard({ p }: { p: Product }) {
  const href = `/p/${p.slug}`;
  return (
    <article className={cn("home-card")}>
      <Link href={href} className={cn("card-cover-link")}>
        <Cover
          title={p.title}
          heading={coverHeading(p.title)}
          accent={accentFor(p.title)}
          coverLine={typeLabelOf(p.type)}
        />
      </Link>
      <div className={cn("card-body")}>
        <span className={cn("eyebrow")}>{typeLabelOf(p.type)}</span>
        <Link href={href}>
          <h3>{p.title}</h3>
        </Link>
        <span className={cn("tag")}>
          {courseLabel(p.course)}
          {p.term ? ` · ${termText(p.course, p.term)}` : ""}
        </span>
        <div className={cn("price-row")}>
          <strong>₹ {p.price}</strong>
          <WishButton slug={p.slug} variant="icon" />
          <CartButton slug={p.slug} variant="icon" />
        </div>
      </div>
    </article>
  );
}
