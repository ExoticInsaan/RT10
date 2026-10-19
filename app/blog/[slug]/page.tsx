import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import JsonLd from "@/components/seo/JsonLd";
import { AUTHOR, formatDate, getPost, posts, readMinutes } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Every post is known ahead of time, so each page is built once.
export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) return { title: "Article not found", robots: { index: false, follow: false } };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      authors: [AUTHOR],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;
  const others = posts.filter((p) => p.slug !== post.slug);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        inLanguage: "en-IN",
        mainEntityOfPage: url,
        author: { "@type": "Organization", name: AUTHOR, url: SITE_URL },
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` } },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Study guides", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd data={structuredData} />
      <p className="m-0 text-sm text-muted">
        <Link href="/blog" className="hover:underline">
          Study guides
        </Link>
      </p>
      <h1 className="font-display mt-2 text-[clamp(27px,3.2vw,40px)] font-normal leading-[1.12] text-navy">{post.title}</h1>
      <p className="mt-3 text-sm text-muted">
        By {AUTHOR} · {formatDate(post.date)} · {readMinutes(post)} min read
      </p>
      <p className="mt-6 text-lg leading-relaxed text-slate-700">{post.intro}</p>

      {post.sections.map((s) => {
        const List = s.ordered ? "ol" : "ul";
        return (
          <section key={s.heading}>
            <h2 className="font-display mt-9 text-2xl font-normal text-navy">{s.heading}</h2>
            {s.paragraphs?.map((t) => (
              <p key={t} className="mt-3 leading-relaxed text-slate-700">
                {t}
              </p>
            ))}
            {s.list ? (
              <List className={`mt-3 space-y-2 pl-6 text-slate-700 ${s.ordered ? "list-decimal" : "list-disc"}`}>
                {s.list.map((t) => (
                  <li key={t} className="leading-relaxed">
                    {t}
                  </li>
                ))}
              </List>
            ) : null}
            {s.after?.map((t) => (
              <p key={t} className="mt-3 leading-relaxed text-slate-700">
                {t}
              </p>
            ))}
          </section>
        );
      })}

      <div className="mt-10 rounded-lg border border-line p-6">
        <p className="m-0 leading-relaxed text-slate-700">{post.cta.text}</p>
        <div className="mt-4">
          <Button href={post.cta.href}>
            {post.cta.label} <Icon name="arrow" />
          </Button>
        </div>
      </div>

      <h2 className="font-display mt-12 text-2xl font-normal text-navy">More study guides</h2>
      <ul className="mt-3 space-y-2 pl-6 text-slate-700">
        {others.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="underline">
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
