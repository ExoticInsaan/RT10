import type { Metadata } from "next";
import MyToolsClient from "@/components/tools/MyToolsClient";

// Personal to each visitor, so search engines have nothing to index here.
export const metadata: Metadata = { title: "My Shelf", robots: { index: false, follow: true } };

export default function MyShelfPage() {
  return (
    <div className="container-app min-h-[75vh] pb-24 pt-12 sm:pt-16">
      <MyToolsClient />
    </div>
  );
}
