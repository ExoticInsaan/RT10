import type { Metadata } from "next";
import MyToolsClient from "@/components/tools/MyToolsClient";

// Personal to each visitor, so search engines have nothing to index here.
export const metadata: Metadata = { title: "My Shelf", robots: { index: false, follow: true } };

export default function MyToolsPage() {
  return (
    <div className="container-app min-h-[75vh] pb-20 pt-10">
      <span className="eyebrow">Your personal shelf</span>
      <h1 className="mb-2 mt-4 text-4xl font-extrabold tracking-tight text-navy dark:text-white sm:text-5xl">My Shelf</h1>
      <p className="m-0 text-muted dark:text-slate-400">Your favourites and recently used tools, all in one place.</p>
      <MyToolsClient />
    </div>
  );
}
