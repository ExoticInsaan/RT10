import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "My Library" };

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-center">
      <h1 className="text-2xl font-bold">My Library</h1>
      <p className="mt-2 text-slate-600">Everything you buy will appear here.</p>
      <Link
        href="/browse"
        className="mt-6 inline-block rounded-full bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700"
      >
        Browse material
      </Link>
    </div>
  );
}
