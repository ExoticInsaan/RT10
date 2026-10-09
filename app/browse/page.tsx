import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/sample-data";

export const metadata: Metadata = { title: "Browse" };

export default function BrowsePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Browse material</h1>
      <p className="mt-1 text-sm text-slate-600">
        Filters by course, year, subject and type will be added once the database is connected.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.slug} p={p} />
        ))}
      </div>
    </div>
  );
}
