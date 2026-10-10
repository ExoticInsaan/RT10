import type { Metadata } from "next";
import LibraryClient from "@/components/LibraryClient";

export const metadata: Metadata = { title: "My Library" };

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-center text-2xl font-bold">My Library</h1>
      <LibraryClient />
    </div>
  );
}
