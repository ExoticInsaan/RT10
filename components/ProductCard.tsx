import Link from "next/link";
import { Product, typeLabel } from "@/lib/sample-data";

const badge: Record<Product["type"], string> = {
  notes: "bg-sky-100 text-sky-800",
  quiz: "bg-amber-100 text-amber-800",
  test: "bg-violet-100 text-violet-800",
};

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link
      href={`/p/${p.slug}`}
      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-400 hover:shadow-md"
    >
      <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge[p.type]}`}>
        {typeLabel[p.type]}
      </span>
      <h3 className="mt-3 text-base font-semibold leading-snug text-slate-900">{p.title}</h3>
      <p className="mt-1 text-sm text-slate-600">{p.blurb}</p>
      <p className="mt-2 text-xs text-slate-500">
        {p.subject} · {p.course} · {p.year}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-bold text-teal-700">₹{p.price}</span>
        <span className="text-sm font-medium text-teal-700">View →</span>
      </div>
    </Link>
  );
}
