import Link from "next/link";
import cn from "@/lib/design/twStyles";
import { subjectAccent } from "@/lib/design/catalog";
import { Product, typeLabel } from "@/lib/sample-data";
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
          subject={p.subject}
          accent={subjectAccent[p.subject] ?? "surgical"}
          coverLine={p.blurb}
          small
        />
      </Link>
      <div className={cn("row-main")}>
        <span className={cn("eyebrow")}>{typeLabel[p.type]}</span>
        <Link href={href}>
          <h3>{p.title}</h3>
        </Link>
        <p>
          {p.subject} <b>•</b> {p.course} <b>•</b> {p.year}
        </p>
        <strong className={cn("row-price")}>₹ {p.price}</strong>
      </div>
      <WishButton slug={p.slug} variant="row" />
      <CartButton slug={p.slug} variant="row" />
    </article>
  );
}
