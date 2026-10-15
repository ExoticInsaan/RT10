import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import type { Metadata } from "next";
import cn from "@/lib/design/twStyles";
import { accentFor } from "@/lib/design/catalog";
import { courseLabel, termText, typeLabelOf } from "@/lib/catalog-config";
import { getProductBySlug } from "@/lib/products";
import BuyButton from "@/components/BuyButton";
import CartButton from "@/components/cart/CartButton";
import WishButton from "@/components/cart/WishButton";
import Cover from "@/components/ui/Cover";
import Icon from "@/components/ui/Icon";
import SectionLabel from "@/components/ui/SectionLabel";

// Products come from the database, so there is no fixed list of pages to build ahead of time.
// Each page is rendered the first time it is opened.
export async function generateMetadata(props: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getProductBySlug(slug);
  return { title: p?.title ?? "Resource not found" };
}

export default function ProductPage(props: PageProps<"/p/[slug]">) {
  return (
    <>
      <Suspense
        fallback={
          <main className={cn("container product-page")}>
            <p className="py-10 text-muted">Loading…</p>
          </main>
        }
      >
        <ProductDetail params={props.params} />
      </Suspense>
      {/* Tells Next that reading the URL for the page title at request time is intentional. */}
      <Suspense>
        <DynamicMarker />
      </Suspense>
    </>
  );
}

async function DynamicMarker() {
  await connection();
  return null;
}

async function ProductDetail({ params }: { params: PageProps<"/p/[slug]">["params"] }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const where = [courseLabel(p.course), p.term ? termText(p.course, p.term) : ""].filter(Boolean).join(" · ");

  return (
    <main className={cn("container product-page")}>
      <div className={cn("breadcrumbs")}>
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={`/browse?q=${encodeURIComponent(p.subject)}`}>{p.subject}</Link>
        <span>/</span>
        <span>{p.title}</span>
      </div>
      <div className={cn("product-detail")}>
        <div className={cn("detail-cover")}>
          <Cover
            title={p.title}
            subject={p.subject}
            accent={accentFor(p.subject)}
            coverLine={typeLabelOf(p.type)}
          />
        </div>
        <div className={cn("detail-copy")}>
          <SectionLabel variant="content">Resource details</SectionLabel>
          <span className={cn("eyebrow")}>{typeLabelOf(p.type)}</span>
          <h1>{p.title}</h1>
          <span className={cn("tag")}>
            {p.subject} · {where}
            {p.pages ? ` · ${p.pages} pages` : ""}
          </span>
          {p.description ? <p>{p.description}</p> : null}
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
