import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";

export default function EmptyState({ clearHref }: { clearHref: string }) {
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
      <h2>No notes found for your selection</h2>
      <p>Try adjusting your filters or search with different keywords.</p>
      <Button href={clearHref}>Clear filters</Button>
      <Button variant="secondary" href="/browse">
        Browse all notes
      </Button>
    </section>
  );
}
