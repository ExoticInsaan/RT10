"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import FilterControls from "@/components/browse/FilterControls";
import { sortLabels, toQuery, type Facets, type Filters, type Sort } from "@/lib/browse";

/** Sort dropdown, the mobile "Filters" button and the mobile filter sheet. */
export default function BrowseControls({
  filters,
  sort,
  facets,
}: {
  filters: Filters;
  sort: Sort;
  facets: Facets;
}) {
  const router = useRouter();
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    if (!sheet) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  const changeSort = (next: Sort) => {
    const query = toQuery(filters, next);
    router.replace(query ? `/browse?${query}` : "/browse");
  };

  return (
    <>
      <label className={cn("sort")}>
        Sort by:
        <select value={sort} onChange={(event) => changeSort(event.target.value as Sort)}>
          {(Object.keys(sortLabels) as Sort[]).map((key) => (
            <option key={key} value={key}>
              {sortLabels[key]}
            </option>
          ))}
        </select>
      </label>
      <Button variant="secondary" className={cn("filter-trigger")} onClick={() => setSheet(true)}>
        <Icon name="filter" size={15} /> Filters
      </Button>
      {sheet && (
        <div
          className={cn("sheet-backdrop")}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSheet(false);
          }}
        >
          <section
            className={cn("filter-sheet")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
          >
            <div className={cn("sheet-head")}>
              <div>
                <span className={cn("sheet-handle")} />
                <h2 id="mobile-filter-title">Filters</h2>
              </div>
              <Button variant="icon" ariaLabel="Close filters" onClick={() => setSheet(false)}>
                <Icon name="close" />
              </Button>
            </div>
            <FilterControls
              initial={filters}
              facets={facets}
              sort={sort}
              onApplied={() => setSheet(false)}
            />
          </section>
        </div>
      )}
    </>
  );
}
