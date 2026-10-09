import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/sample-data";

const subjects = [
  "Anatomy & Physiology",
  "Fundamentals of Nursing",
  "Pharmacology",
  "Microbiology",
  "Medical-Surgical Nursing",
  "Community Health",
];

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-b from-teal-50 to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:py-20">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Study smarter for nursing exams
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Clear notes, practice quizzes and mock tests for GNM, BSc Nursing and Post Basic.
            Notes and quizzes at <b>₹19</b>, full tests at <b>₹28</b>.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/browse"
              className="w-full rounded-full bg-teal-600 px-6 py-3 font-semibold text-white shadow hover:bg-teal-700 sm:w-auto"
            >
              Browse material
            </Link>
            <Link
              href="/browse?free=1"
              className="w-full rounded-full border border-teal-600 px-6 py-3 font-semibold text-teal-700 hover:bg-teal-50 sm:w-auto"
            >
              Try a free sample
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-xl font-bold">Subjects</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {subjects.map((s) => (
            <li key={s}>
              <Link
                href={`/browse?subject=${encodeURIComponent(s)}`}
                className="inline-block rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-teal-400 hover:text-teal-700"
              >
                {s}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">Popular right now</h2>
          <Link href="/browse" className="text-sm font-medium text-teal-700">See all →</Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 6).map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-5xl px-4">
        <div className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-3">
          {[
            ["Free sample first", "Try the first pages or five questions before you pay."],
            ["Explained answers", "Every question comes with a short explanation."],
            ["Made for phones", "Fast pages that work on mobile data."],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="font-semibold text-slate-900">{t}</h3>
              <p className="mt-1 text-sm text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
