import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products, typeLabel } from "@/lib/sample-data";

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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
        {typeLabel[p.type]}
      </span>
      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{p.title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {p.subject} · {p.course} · {p.year}
      </p>
      <p className="mt-4 text-slate-700">{p.blurb}</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-extrabold text-teal-700">₹{p.price}</span>
          <button
            disabled
            className="rounded-full bg-teal-600 px-6 py-3 font-semibold text-white opacity-60"
            title="Payments are connected in Phase 3"
          >
            Buy now
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Payments switch on after the Razorpay setup. Free sample and preview will appear here.
        </p>
      </div>
    </div>
  );
}
