import cn from "@/lib/design/twStyles";
import Icon from "@/components/ui/Icon";

export default function Trust() {
  return (
    <section className={cn("trust container")} aria-label="Why students choose Toppershelf">
      <div>
        <Icon name="book" />
        <span>
          <strong>Trusted by</strong> thousands of nursing students
        </span>
      </div>
      <div>
        <Icon name="shield" />
        <span>
          <strong>Exam-focused</strong> and syllabus aligned
        </span>
      </div>
      <div>
        <Icon name="bolt" />
        <span>
          <strong>Instant access</strong> in PDF format
        </span>
      </div>
      <div>
        <Icon name="heart" />
        <span>
          <strong>Better notes.</strong> Brighter future.
        </span>
      </div>
    </section>
  );
}
