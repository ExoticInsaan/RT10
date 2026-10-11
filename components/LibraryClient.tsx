"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import AuthPanel from "@/components/AuthPanel";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import cn from "@/lib/design/twStyles";
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

  if (!ready) return <p className="text-muted">Loading…</p>;

  if (!user) {
    return (
      <div className="max-w-sm rounded-lg border border-line bg-white p-6">
        <AuthPanel next="/library" />
      </div>
    );
  }

  if (items === null) return <p className="text-muted">Loading your library…</p>;

  if (items.length === 0) {
    return (
      <section className={cn("empty")}>
        <div className={cn("empty-art")}>
          <span className={cn("paper")}>
            <i />
            <i />
            <i />
          </span>
          <span className={cn("glass")}>
            <b />
          </span>
        </div>
        <h2>You have not bought anything yet</h2>
        <p>Resources you buy will appear here, ready whenever you need to revise.</p>
        <Button href="/browse">Browse material</Button>
      </section>
    );
  }

  return (
    <ul className="m-0 grid list-none gap-3 p-0">
      {items.map((i) => (
        <li
          key={i.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-line bg-white p-4 transition hover:border-[#b9cbd7]"
        >
          <span className="font-semibold text-navy">{i.title}</span>
          <Link href={`/p/${i.slug}`} className={cn("text-link")}>
            Open <Icon name="arrow" size={14} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
