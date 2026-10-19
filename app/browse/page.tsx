import type { Metadata } from "next";
import { Suspense } from "react";
import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import TrackEvent from "@/components/analytics/TrackEvent";
import Icon from "@/components/ui/Icon";
import SectionLabel from "@/components/ui/SectionLabel";
import BrowseControls from "@/components/browse/BrowseControls";
import EmptyState from "@/components/browse/EmptyState";
import FilterControls from "@/components/browse/FilterControls";
import ProductRow from "@/components/browse/ProductRow";
import SearchBar from "@/components/browse/SearchBar";
import { activeChips, filterProducts, getFacets, parseParams, toQuery } from "@/lib/browse";
import { courseLabel, typeLabelOf } from "@/lib/catalog-config";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Browse BSc Nursing, GNM & Post Basic Study Material",
  description:
    "Find nursing notes, important questions, care plans, case studies, flashcards and assignments. Filter by course, semester or year, and type, or search by document name.",
};

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
  const filters = parseParams(await searchParams);
  const facets = getFacets(products);
  const results = filterProducts(products, filters);
  const chips = activeChips(filters);

  const courseTitle = filters.courses.length === 1 ? courseLabel(filters.courses[0]) : "All Courses";
  const typeTitle = filters.types.length === 1 ? typeLabelOf(filters.types[0]) : "All Resources";
  // "Clear all" drops every filter but keeps the search text.
  const clearHref = filters.q ? `/browse?${new URLSearchParams({ q: filters.q })}` : "/browse";
  // Remounts the filter panels (and their draft state) whenever the URL filters change.
  const filterKey = toQuery(filters);

  return (
    <main className={cn("results-page container")}>
      {/* A clear way back to the home page (hidden on phones, which have the header menu). */}
      <div className="mb-4 max-[560px]:hidden">
        <Button variant="secondary" href="/" ariaLabel="Back to home">
          <Icon name="back" size={16} /> Back to home
        </Button>
      </div>
      {filters.q && <TrackEvent name="search" params={{ search_term: filters.q }} />}
      <SearchBar filters={filters} />
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
        <BrowseControls key={filterKey} filters={filters} facets={facets} />
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
          <FilterControls key={filterKey} initial={filters} facets={facets} />
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
