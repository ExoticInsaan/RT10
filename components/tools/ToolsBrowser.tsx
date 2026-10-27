"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ToolIcon from "@/components/tools/ToolIcon";
import { Button, SearchBox, ToolCard } from "@/components/tools/ui";
import { categories, tools, type Category } from "@/lib/tools/registry";

const allCategories = ["All", ...categories.map((item) => item.name)] as const;
type Filter = (typeof allCategories)[number];

const isFilter = (value: string | null): value is Filter => !!value && (allCategories as readonly string[]).includes(value);

/** The All Tools page: search box, category filters and the tool grid. The address keeps the search and category. */
export default function ToolsBrowser() {
  const router = useRouter();
  const params = useSearchParams();
  const urlSearch = params.get("q") ?? "";
  const urlCategory = params.get("category");
  const category: Filter = isFilter(urlCategory) ? urlCategory : "All";
  const [search, setSearch] = useState(urlSearch);

  const update = (nextSearch: string, nextCategory: Filter) => {
    const next = new URLSearchParams();
    if (nextSearch) next.set("q", nextSearch);
    if (nextCategory !== "All") next.set("category", nextCategory);
    router.replace(`/the-shelf${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  const results = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tools.filter(
      (tool) =>
        (category === "All" || tool.category === (category as Category)) &&
        (!needle || `${tool.name} ${tool.description} ${tool.category}`.toLowerCase().includes(needle)),
    );
  }, [search, category]);

  return (
    <>
      <SearchBox
        value={search}
        onChange={(value) => {
          setSearch(value);
          update(value.trim(), category);
        }}
        onSubmit={() => update(search.trim(), category)}
        compact
      />
      <div className="hide-scrollbar my-6 flex gap-2 overflow-x-auto pb-1">
        {allCategories.map((item) => (
          <Button
            key={item}
            variant={category === item ? "primary" : "secondary"}
            className="min-h-10 min-w-max rounded-full px-4"
            onClick={() => update(search.trim(), item)}
          >
            {item}
          </Button>
        ))}
      </div>
      <div className="grid gap-7 lg:grid-cols-[13rem_1fr]">
        <aside className="hidden h-max rounded-2xl border border-line bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:block">
          <strong className="mb-3 block px-3 text-xs uppercase tracking-widest text-muted">Browse by category</strong>
          {allCategories.map((item) => (
            <button
              key={item}
              type="button"
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl border-0 px-3 py-3 text-left text-sm font-semibold transition ${
                category === item
                  ? "bg-blue-soft text-blue-hover dark:bg-blue-950"
                  : "bg-transparent text-muted hover:bg-surface dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
              onClick={() => update(search.trim(), item)}
            >
              {item}
              <span className="text-xs">
                {item === "All" ? tools.length : tools.filter((tool) => tool.category === item).length}
              </span>
            </button>
          ))}
        </aside>
        <section aria-live="polite">
          <div className="mb-4 flex items-center justify-between">
            <p className="m-0 text-sm font-semibold text-navy dark:text-white">
              {results.length} {results.length === 1 ? "tool" : "tools"}
            </p>
          </div>
          {results.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-line py-24 text-center dark:border-slate-700">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-soft text-blue-hover">
                <ToolIcon name="search" />
              </span>
              <h2 className="mb-2 mt-5 text-xl text-navy dark:text-white">No tool found</h2>
              <p className="text-sm text-muted">Try a simpler search or choose another category.</p>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => {
                  setSearch("");
                  update("", "All");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
