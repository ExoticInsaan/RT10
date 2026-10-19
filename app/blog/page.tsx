import type { Metadata } from "next";
import Link from "next/link";
import { AUTHOR, formatDate, posts, readMinutes } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Nursing Study Guides and Exam Tips",
  description:
    "Study guides for B.Sc. Nursing, GNM and Post Basic students: exam preparation plans, how to write long answers, care plans and how to use important questions.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Toppershelf study guides",
          url: `${SITE_URL}/blog`,
          hasPart: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE_URL}/blog/${p.slug}` })),
        }}
      />
      <h1 className="font-display m-0 text-[clamp(27px,3.2vw,40px)] font-normal leading-[1.12] text-navy">
        Study guides for nursing students
      </h1>
      <p className="mt-3 leading-relaxed text-slate-700">
        Practical exam tips for B.Sc. Nursing, GNM and Post Basic students, written by the {AUTHOR}.
      </p>
      <ul className="mt-8 list-none space-y-4 p-0">
        {posts.map((post) => (
          <li key={post.slug} className="rounded-lg border border-line p-5">
            <h2 className="font-display m-0 text-xl font-normal text-navy">
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 leading-relaxed text-slate-700">{post.description}</p>
            <p className="mt-2 text-sm text-muted">
              {formatDate(post.date)} · {readMinutes(post)} min read
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
