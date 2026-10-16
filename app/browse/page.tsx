import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import SectionLabel from "@/components/ui/SectionLabel";
import BrowseControls from "@/components/browse/BrowseControls";
import EmptyState from "@/components/browse/EmptyState";
import FilterControls from "@/components/browse/FilterControls";
import ProductRow from "@/components/browse/ProductRow";
import SearchBar from "@/components/browse/SearchBar";
import { activeChips, filterProducts, getFacets, parseParams, priceMaxOf, toQuery } from "@/lib/browse";
import { courseLabel, typeLabelOf } from "@/lib/catalog-config";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Browse" };

// Reading the URL filters must happen inside <Suspense> (Cache Components), so the page shell
// renders instantly and the results stream in.
export default function BrowsePage(props: PageProps<"/browse">) {
  return (
    <Suspense
      fallback={
        <main className={cn("results-page container")}>
          <p className="py-10 text-muted">Loading resources…</p>
        </main>
      }
    >
      <BrowseResults searchParams={props.searchParams} />
    </Suspense>
  );
}

async function BrowseResults({ searchParams }: { searchParams: PageProps<"/browse">["searchParams"] }) {
  const products = await getProducts();
  const priceMax = priceMaxOf(products);
  const { filters, sort } = parseParams(await searchParams, priceMax);
  const facets = getFacets(products);
  const results = filterProducts(products, filters, sort);
  const chips = activeChips(filters, priceMax);

  const courseTitle = filters.courses.length === 1 ? courseLabel(filters.courses[0]) : "All Courses";
  const typeTitle = filters.types.length === 1 ? typeLabelOf(filters.types[0]) : "All Resources";
  // "Clear all" drops every filter but keeps the search text.
  const clearHref = filters.q ? `/browse?${new URLSearchParams({ q: filters.q })}` : "/browse";
  // Remounts the filter panels (and their draft state) whenever the URL filters change.
  const filterKey = toQuery(filters, sort, priceMax);

  return (
    <main className={cn("results-page container")}>
      <div className={cn("breadcrumbs")}>
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Search Results</span>
      </div>
      <SearchBar filters={filters} sort={sort} priceMax={priceMax} />
      <div className={cn("results-heading")}>
        <div>
          <SectionLabel variant="content">Explore the library</SectionLabel>
          <h1>
            {courseTitle} · {typeTitle}
          </h1>
          <p>
            Showing {results.length} {results.length === 1 ? "result" : "results"}
            {filters.q ? <> for “{filters.q}”</> : null}
          </p>
        </div>
        <BrowseControls key={filterKey} filters={filters} sort={sort} facets={facets} />
      </div>
      {chips.length > 0 && (
        <div className={cn("active-filters")}>
          {chips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
          <Button variant="ghost" href={clearHref}>
            Clear all
          </Button>
        </div>
      )}
      <div className={cn("results-layout")}>
        <aside className={cn("sidebar")}>
          <div className={cn("filter-title")}>
            <h2>Filters</h2>
            <Button variant="ghost" href={clearHref}>
              Clear all
            </Button>
          </div>
          <FilterControls key={filterKey} initial={filters} facets={facets} sort={sort} />
        </aside>
        <div className={cn("product-list")}>
          {results.length ? (
            results.map((p) => <ProductRow key={p.slug} p={p} />)
          ) : (
            <EmptyState clearHref={clearHref} noProducts={products.length === 0} />
          )}
        </div>
      </div>
    </main>
  );
}
