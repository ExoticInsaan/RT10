import Link from "next/link";
import cn from "@/lib/design/twStyles";
import { products } from "@/lib/sample-data";
import Icon from "@/components/ui/Icon";
import PopularCard from "@/components/home/PopularCard";

export default function Popular() {
  return (
    <section className={cn("container popular")}>
      <div className={cn("section-title")}>
        <h2>Popular Nursing Notes</h2>
        <Link href="/browse">
          View all <Icon name="arrow" size={14} />
        </Link>
      </div>
      <div className={cn("home-grid")}>
        {products.slice(0, 4).map((p) => (
          <PopularCard key={p.slug} p={p} />
        ))}
      </div>
    </section>
  );
}
