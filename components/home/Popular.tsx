import Link from "next/link";
import cn from "@/lib/design/twStyles";
import { getProducts } from "@/lib/products";
import Icon from "@/components/ui/Icon";
import PopularCard from "@/components/home/PopularCard";

// The newest published resources. (There are no sales numbers yet, so this is not called "popular".)
export default async function Popular() {
  const products = await getProducts();
  if (products.length === 0) return null;
  return (
    <section className={cn("container popular")}>
      <div className={cn("section-title")}>
        <h2>Latest Resources</h2>
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
