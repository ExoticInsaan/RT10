import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";

export default function EmptyState({
  clearHref,
  noProducts = false,
}: {
  clearHref: string;
  /** True when the shop has no published resources at all (nothing to filter yet). */
  noProducts?: boolean;
}) {
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
      {noProducts ? (
        <>
          <h2>New resources are coming soon</h2>
          <p>Nothing is published yet. Please check back shortly.</p>
        </>
      ) : (
        <>
          <h2>No resources found</h2>
          <p>Check the spelling of the document name, try fewer words, or clear the filters.</p>
          <Button href={clearHref}>Clear filters</Button>
          <Button variant="secondary" href="/browse">
            Browse all resources
          </Button>
        </>
      )}
    </section>
  );
}
