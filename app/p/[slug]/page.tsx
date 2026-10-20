import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import type { Metadata } from "next";
import cn from "@/lib/design/twStyles";
import { accentFor, coverHeading } from "@/lib/design/catalog";
import { courseLabel, languageLabel, termText, typeLabelOf } from "@/lib/catalog-config";
import { getProductBySlug } from "@/lib/products";
import BuyButton from "@/components/BuyButton";
import CartButton from "@/components/cart/CartButton";
import TrackEvent from "@/components/analytics/TrackEvent";
import { itemOf } from "@/lib/analytics";
import Cover from "@/components/ui/Cover";
import PreviewGallery from "@/components/product/PreviewGallery";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import Icon from "@/components/ui/Icon";
import SectionLabel from "@/components/ui/SectionLabel";
import { isFree, priceText } from "@/lib/price";

// Products come from the database, so there is no fixed list of pages to build ahead of time.
// Each page is rendered the first time it is opened.
export async function generateMetadata(props: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Resource not found", robots: { index: false, follow: false } };

  const course = courseLabel(p.course);
  const kind = typeLabelOf(p.type);
  const title = course ? `${p.title} (${course})` : p.title;
  const fallback = `${p.title}: ${kind || "study material"} for ${course || "nursing"} students${
    p.term ? ` (${termText(p.course, p.term)})` : ""
  }. Preview and buy the PDF on Toppershelf.`;
  const description = (p.description?.trim() || fallback).replace(/\s+/g, " ").slice(0, 300);
  const url = `/p/${p.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      ...(p.coverUrl ? { images: [{ url: p.coverUrl }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
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
  const productUrl = `${SITE_URL}/p/${p.slug}`;
  // Structured data so Google can show the price and breadcrumb under the search result.
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        name: p.title,
        description: p.description?.trim() || `${p.title}: ${typeLabelOf(p.type)} for ${courseLabel(p.course)} students.`,
        sku: p.slug,
        category: [courseLabel(p.course), typeLabelOf(p.type)].filter(Boolean).join(" / "),
        brand: { "@type": "Brand", name: SITE_NAME },
        url: productUrl,
        ...(p.coverUrl ? { image: [p.coverUrl] } : {}),
        offers: {
          "@type": "Offer",
          url: productUrl,
          price: p.price,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Resources", item: `${SITE_URL}/browse` },
          { "@type": "ListItem", position: 3, name: p.title, item: productUrl },
        ],
      },
    ],
  };

  return (
    <main className={cn("container product-page")}>
      <JsonLd data={structuredData} />
      <TrackEvent name="view_item" params={{ currency: "INR", value: p.price, items: [itemOf(p)] }} />
      <div className={cn("breadcrumbs")}>
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/browse">Resources</Link>
        <span>/</span>
        <span>{p.title}</span>
      </div>
      <div className={cn("product-detail")}>
        <div className={cn("detail-cover")}>
          <PreviewGallery
            slug={p.slug}
            title={p.title}
            cover={
              <Cover
                title={p.title}
                heading={coverHeading(p.title)}
                accent={accentFor(p.title)}
                coverLine={typeLabelOf(p.type)}
                image={p.coverUrl}
                large
              />
            }
          />
        </div>
        <div className={cn("detail-copy")}>
          <SectionLabel variant="content">Resource details</SectionLabel>
          <span className={cn("eyebrow")}>{typeLabelOf(p.type)}</span>
          <h1>{p.title}</h1>
          <span className={cn("tag")}>
            {where}
            {p.pages ? ` · ${p.pages} pages` : ""}
          </span>
          {p.description ? <p>{p.description}</p> : null}
          {p.language ? (
            <div
              className="my-4 inline-flex items-center gap-2 rounded-xl border-2 border-blue bg-blue/10 px-4 py-2.5 text-base font-bold text-navy shadow-sm"
              aria-label={`Language: ${languageLabel(p.language)}`}
            >
              <Icon name="check" /> Language: <span className="text-blue">{languageLabel(p.language)}</span>
            </div>
          ) : null}
          <ul>
            <li>
              <Icon name="check" /> {isFree(p.price) ? "Free: instant access in your library" : "Instant access after payment"}
            </li>
            <li>
              <Icon name="check" /> Read on mobile, tablet or desktop
            </li>
            {isFree(p.price) ? null : (
              <li>
                <Icon name="check" /> Secure payment by Razorpay (UPI, cards, net banking)
              </li>
            )}
          </ul>
          <strong className={cn("detail-price")}>{priceText(p.price)}</strong>
          <div className={cn("detail-actions")}>
            <BuyButton slug={p.slug} price={p.price} title={p.title} />
            <CartButton slug={p.slug} variant="detail" product={p} />
          </div>
          <p>{isFree(p.price) ? "You will be asked to sign in to add it to your library." : "You will be asked to sign in before paying."}</p>
        </div>
      </div>
    </main>
  );
}
