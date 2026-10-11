import Link from "next/link";
import cn from "@/lib/design/twStyles";
import { subjectAccent } from "@/lib/design/catalog";
import { Product, typeLabel } from "@/lib/sample-data";
import Cover from "@/components/ui/Cover";
import Icon from "@/components/ui/Icon";

export default function PopularCard({ p }: { p: Product }) {
  const href = `/p/${p.slug}`;
  return (
    <article className={cn("home-card")}>
      <Link href={href} className={cn("card-cover-link")}>
        <Cover
          title={p.title}
          subject={p.subject}
          accent={subjectAccent[p.subject] ?? "surgical"}
          coverLine={p.blurb}
        />
      </Link>
      <div className={cn("card-body")}>
        <span className={cn("eyebrow")}>{typeLabel[p.type]}</span>
        <Link href={href}>
          <h3>{p.title}</h3>
        </Link>
        <span className={cn("tag")}>
          {p.course} · {p.year}
        </span>
        <div className={cn("price-row")}>
          <strong>₹ {p.price}</strong>
          <Link href={href} className={cn("text-link")}>
            View <Icon name="arrow" size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
