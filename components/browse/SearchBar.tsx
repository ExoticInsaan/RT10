import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import type { Filters, Sort } from "@/lib/browse";

/**
 * Search box for the results page. A plain GET form, so it works without JavaScript.
 * Students type words from the document name and matching PDFs appear.
 * The current filters are carried along as hidden fields.
 */
export default function SearchBar({
  filters,
  sort,
}: {
  filters: Filters;
  sort: Sort;
}) {
  return (
    <form className={cn("hero-search")} action="/browse" method="get" role="search" style={{ marginBottom: 20 }}>
      <Icon name="search" size={18} />
      <input
        name="q"
        type="search"
        defaultValue={filters.q}
        aria-label="Search by document name"
        placeholder="Search by document name"
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
      {sort !== "featured" && <input type="hidden" name="sort" value={sort} />}
      <Button type="submit" ariaLabel="Search">
        <Icon name="search" size={18} />
      </Button>
    </form>
  );
}
