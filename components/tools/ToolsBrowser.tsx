"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ShelfItem from "@/components/tools/ShelfItem";
import ToolIcon from "@/components/tools/ToolIcon";
import { Button, SearchBox } from "@/components/tools/ui";
import { tools, type Tool } from "@/lib/tools/registry";

const matches = (tool: Tool, needle: string) =>
  !needle || `${tool.name} ${tool.description}`.toLowerCase().includes(needle);

export const shelfTools = () => tools.filter((tool) => tool.category === "The Shelf");

/** The rows of shelves. The column gap comes from --shelf-gap, which the planks in ShelfItem also read. */
export function ShelfGrid({ list }: { list: Tool[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-(--shelf-gap) gap-y-10 [--shelf-gap:1rem] sm:gap-y-12 sm:[--shelf-gap:1.5rem] lg:grid-cols-3">
      {list.map((tool, index) => (
        <ShelfItem key={tool.id} tool={tool} priority={index < 3} />
      ))}
    </div>
  );
}

/** The header row: the page intro on the left, the search box and count on the right. */
export function ShelfHeader({ intro, search, count }: { intro: ReactNode; search: ReactNode; count: ReactNode }) {
  return (
    <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-end">
      {intro}
      <div>
        {search}
        <p className="m-0 mt-3 text-sm text-muted">{count}</p>
      </div>
    </div>
  );
}

/**
 * The Shelf page body: header with search, then the shelves. The address keeps the search (?q=), so a search from
 * the home page lands here. A search also lists matching Fun Zone tools underneath, so nothing is hidden.
 */
export default function ToolsBrowser({ intro }: { intro: ReactNode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const needle = search.trim().toLowerCase();
  const total = shelfTools().length;

  const update = (nextSearch: string) => {
    router.replace(`/the-shelf${nextSearch ? `?q=${encodeURIComponent(nextSearch)}` : ""}`, { scroll: false });
  };
  const clear = () => {
    setSearch("");
    update("");
  };

  const shelf = useMemo(() => shelfTools().filter((tool) => matches(tool, needle)), [needle]);
  const fun = useMemo(
    () => (needle ? tools.filter((tool) => tool.category === "Fun Zone" && matches(tool, needle)) : []),
    [needle],
  );

  return (
    <>
      <ShelfHeader
        intro={intro}
        search={
          <SearchBox
            value={search}
            onChange={(value) => {
              setSearch(value);
              update(value.trim());
            }}
            onSubmit={() => update(search.trim())}
            compact
          />
        }
        count={
          needle ? (
            <span aria-live="polite">
              {shelf.length} of {total} tools match.{" "}
              <button type="button" onClick={clear} className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-blue-hover underline">
                Show all
              </button>
            </span>
          ) : (
            `${total} tools, all free`
          )
        }
      />

      {shelf.length > 0 && <ShelfGrid list={shelf} />}

      {needle && !shelf.length && !fun.length && (
        <div className="rounded-3xl border border-dashed border-line px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-soft text-blue-hover">
            <ToolIcon name="search" />
          </span>
          <h2 className="mb-2 mt-5 text-xl text-navy">Nothing on the shelf for “{search.trim()}”</h2>
          <p className="text-sm text-muted">Try a shorter word, or tell us what you need and we will build it.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button variant="secondary" onClick={clear}>
              Show all tools
            </Button>
            <Link href="/contact" className="inline-flex min-h-12 items-center px-3 text-sm font-bold text-blue-hover underline">
              Request a tool
            </Link>
          </div>
        </div>
      )}

      {fun.length > 0 && (
        <div className={shelf.length ? "mt-16" : ""}>
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-navy">
            <ToolIcon name="sparkles" size={18} /> Also in the Fun Zone
          </h2>
          <ShelfGrid list={fun} />
        </div>
      )}
    </>
  );
}
