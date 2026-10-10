"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import AuthPanel from "@/components/AuthPanel";
import { createClient } from "@/lib/supabase/client";

type Item = { id: string; title: string; slug: string };

export default function LibraryClient() {
  const { user, ready } = useAuth();
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    if (!user) return;
    createClient()
      .from("purchases")
      .select("id, products(title, slug)")
      .eq("status", "paid")
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as {
          id: string;
          products: { title: string; slug: string } | null;
        }[];
        setItems(
          rows
            .filter((r) => r.products)
            .map((r) => ({ id: r.id, title: r.products!.title, slug: r.products!.slug })),
        );
      });
  }, [user]);

  if (!ready) return <p className="text-center text-slate-500">Loading…</p>;

  if (!user) {
    return (
      <div className="mx-auto max-w-sm rounded-3xl bg-white p-6 shadow-sm">
        <AuthPanel next="/library" />
      </div>
    );
  }

  if (items === null) return <p className="text-center text-slate-500">Loading your library…</p>;

  if (items.length === 0) {
    return (
      <div className="text-center">
        <p className="text-slate-600">You have not bought anything yet.</p>
        <Link
          href="/browse"
          className="mt-4 inline-block rounded-full bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700"
        >
          Browse material
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <Link href={`/p/${i.slug}`} className="font-semibold text-teal-700">
            {i.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
