import Link from "next/link";
import cn from "@/lib/design/twStyles";
import { accentFor, coverHeading } from "@/lib/design/catalog";
import { courseLabel, termText, typeLabelOf } from "@/lib/catalog-config";
import type { Product } from "@/lib/product-types";
import CartButton from "@/components/cart/CartButton";
import WishButton from "@/components/cart/WishButton";
import Cover from "@/components/ui/Cover";

export default function ProductRow({ p }: { p: Product }) {
  const href = `/p/${p.slug}`;
  return (
    <article className={cn("product-row")}>
      <Link href={href} className={cn("row-cover")}>
        <Cover
          title={p.title}
          heading={coverHeading(p.title)}
          accent={accentFor(p.title)}
          coverLine={typeLabelOf(p.type)}
          small
        />
      </Link>
      <div className={cn("row-main")}>
        <span className={cn("eyebrow")}>{typeLabelOf(p.type)}</span>
        <Link href={href}>
          <h3>{p.title}</h3>
        </Link>
        <p>
          {courseLabel(p.course)}
          {p.term ? (
            <>
              {" "}
              <b>•</b> {termText(p.course, p.term)}
            </>
          ) : null}
        </p>
        <strong className={cn("row-price")}>₹ {p.price}</strong>
      </div>
      <WishButton slug={p.slug} variant="row" />
      <CartButton slug={p.slug} variant="row" />
    </article>
  );
}
