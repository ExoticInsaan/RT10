"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ToolIcon from "@/components/tools/ToolIcon";
import { Button, SearchBox, ToolCard } from "@/components/tools/ui";
import { tools, type Tool } from "@/lib/tools/registry";

const matches = (tool: Tool, needle: string) =>
  !needle || `${tool.name} ${tool.description}`.toLowerCase().includes(needle);

// Working tools first, tools that are coming soon after them.
const readyFirst = (list: Tool[]) => [...list].sort((a, b) => Number(!!b.ready) - Number(!!a.ready));

/**
 * The Shelf page: a search box and the grid of useful tools. The address keeps the search (?q=), so a search from the
 * home page lands here. A search also lists any matching Fun Zone tools underneath, so nothing is hidden.
 */
export default function ToolsBrowser() {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const needle = search.trim().toLowerCase();

  const update = (nextSearch: string) => {
    router.replace(`/the-shelf${nextSearch ? `?q=${encodeURIComponent(nextSearch)}` : ""}`, { scroll: false });
  };

  const shelf = useMemo(
    () => readyFirst(tools.filter((tool) => tool.category === "The Shelf" && matches(tool, needle))),
    [needle],
  );
  const fun = useMemo(
    () => (needle ? tools.filter((tool) => tool.category === "Fun Zone" && matches(tool, needle)) : []),
    [needle],
  );

  return (
    <>
      <SearchBox
        value={search}
        onChange={(value) => {
          setSearch(value);
          update(value.trim());
        }}
        onSubmit={() => update(search.trim())}
        compact
      />
      <section aria-live="polite" className="mt-8">
        <p className="mb-4 text-sm font-semibold text-navy">
          {needle ? `${shelf.length} ${shelf.length === 1 ? "tool" : "tools"} found` : `${shelf.length} tools`}
        </p>
        {shelf.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shelf.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          !fun.length && (
            <div className="rounded-3xl border border-dashed border-line py-20 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-soft text-blue-hover">
                <ToolIcon name="search" />
              </span>
              <h2 className="mb-2 mt-5 text-xl text-navy">No tool found</h2>
              <p className="text-sm text-muted">Try a simpler word, or ask us to build it.</p>
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch("");
                    update("");
                  }}
                >
                  Clear search
                </Button>
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center px-3 text-sm font-bold text-blue-hover underline"
                >
                  Request a tool
                </Link>
              </div>
            </div>
          )
        )}

        {fun.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-navy">
              <ToolIcon name="sparkles" size={16} /> Also in the Fun Zone
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fun.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
