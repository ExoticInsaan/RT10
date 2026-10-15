import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import type { Filters, Sort } from "@/lib/browse";

/**
 * Search box for the results page. A plain GET form, so it works without JavaScript.
 * Students type a subject (or any words from the title) and matching PDFs appear.
 * The current filters are carried along as hidden fields.
 */
export default function SearchBar({
  filters,
  sort,
  priceMax,
}: {
  filters: Filters;
  sort: Sort;
  priceMax: number;
}) {
  return (
    <form className={cn("hero-search")} action="/browse" method="get" role="search" style={{ marginBottom: 20 }}>
      <Icon name="search" size={18} />
      <input
        name="q"
        type="search"
        defaultValue={filters.q}
        aria-label="Search by subject or title"
        placeholder="Type a subject, e.g. Pharmacology"
        autoComplete="off"
      />
      {filters.courses.map((v) => (
        <input key={`course-${v}`} type="hidden" name="course" value={v} />
      ))}
      {filters.terms.map((v) => (
        <input key={`term-${v}`} type="hidden" name="term" value={v} />
      ))}
      {filters.types.map((v) => (
        <input key={`type-${v}`} type="hidden" name="type" value={v} />
      ))}
      {filters.maxPrice < priceMax && <input type="hidden" name="maxPrice" value={filters.maxPrice} />}
      {sort !== "featured" && <input type="hidden" name="sort" value={sort} />}
      <Button type="submit" ariaLabel="Search">
        <Icon name="search" size={18} />
      </Button>
    </form>
  );
}
