import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import SectionLabel from "@/components/ui/SectionLabel";

export default function Hero() {
  return (
    <section className={cn("hero container")}>
      <SectionLabel variant="hero">For nursing students</SectionLabel>
      <h1>
        Nursing Notes, Quizzes
        <br className="max-[560px]:hidden" />
        &amp; Mock Tests — <em>All in One Place.</em>
      </h1>
      <p>
        Clear notes, practice quizzes and mock tests for GNM, BSc Nursing and Post Basic. Notes and
        quizzes at ₹19, full tests at ₹28.
      </p>
      <Button href="/browse" className={cn("hero-cta")}>
        Explore Nursing Resources <Icon name="arrow" size={17} />
      </Button>
      {/* Plain GET form: works without JavaScript and sends the query to /browse?q=... */}
      <form className={cn("hero-search")} action="/browse" method="get" role="search">
        <Icon name="search" size={18} />
        <input
          name="q"
          type="search"
          aria-label="Search study notes"
          placeholder="Search subjects, topics, notes..."
          autoComplete="off"
        />
        <Button type="submit" ariaLabel="Search">
          <Icon name="search" size={18} />
        </Button>
      </form>
    </section>
  );
}
