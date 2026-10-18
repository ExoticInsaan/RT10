"use client";

import { useEffect, useState } from "react";
import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import FilterControls from "@/components/browse/FilterControls";
import type { Facets, Filters, Sort } from "@/lib/browse";

/** The "Filters" button and the filter sheet it opens. (There is no sort control.) */
export default function BrowseControls({
  filters,
  sort,
  facets,
}: {
  filters: Filters;
  sort: Sort;
  facets: Facets;
}) {
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    if (!sheet) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  return (
    <>
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
