import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import cn from "@/lib/design/twStyles";
import { slug as toSlug, subjectAccent } from "@/lib/design/catalog";
import { products, typeLabel } from "@/lib/sample-data";
import BuyButton from "@/components/BuyButton";
import CartButton from "@/components/cart/CartButton";
import WishButton from "@/components/cart/WishButton";
import Cover from "@/components/ui/Cover";
import Icon from "@/components/ui/Icon";
import SectionLabel from "@/components/ui/SectionLabel";

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = products.find((x) => x.slug === slug);
  return { title: p?.title ?? "Product" };
}

export default async function ProductPage(props: PageProps<"/p/[slug]">) {
  const { slug } = await props.params;
  const p = products.find((x) => x.slug === slug);
  if (!p) notFound();

  return (
    <main className={cn("container product-page")}>
      <div className={cn("breadcrumbs")}>
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={`/browse?subject=${toSlug(p.subject)}`}>{p.subject}</Link>
        <span>/</span>
        <span>{p.title}</span>
      </div>
      <div className={cn("product-detail")}>
        <div className={cn("detail-cover")}>
          <Cover
            title={p.title}
            subject={p.subject}
            accent={subjectAccent[p.subject] ?? "surgical"}
            coverLine={p.blurb}
          />
        </div>
        <div className={cn("detail-copy")}>
          <SectionLabel variant="content">Resource details</SectionLabel>
          <span className={cn("eyebrow")}>{typeLabel[p.type]}</span>
          <h1>{p.title}</h1>
          <span className={cn("tag")}>
            {p.subject} · {p.course} · {p.year}
          </span>
          <p>{p.blurb}</p>
          <ul>
            <li>
              <Icon name="check" /> Instant access after payment
            </li>
            <li>
              <Icon name="check" /> Read on mobile, tablet or desktop
            </li>
            <li>
              <Icon name="check" /> Secure payment by Razorpay (UPI, cards, net banking)
            </li>
          </ul>
          <strong className={cn("detail-price")}>₹ {p.price}</strong>
          <div className={cn("detail-actions")}>
            <BuyButton slug={p.slug} price={p.price} />
            <CartButton slug={p.slug} variant="detail" />
            <WishButton slug={p.slug} variant="detail" />
          </div>
          <p>You will be asked to sign in before paying.</p>
        </div>
      </div>
    </main>
  );
}
