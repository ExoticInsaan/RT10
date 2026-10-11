import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import SectionLabel from "@/components/ui/SectionLabel";
import { faqs } from "@/lib/design/homeContent";

export default function Faq() {
  return (
    <section id="faq" className={cn("faq-section container")} aria-labelledby="faq-title">
      <div className={cn("faq-intro")}>
        <SectionLabel variant="editorial" number="01">
          Frequently asked questions
        </SectionLabel>
        <h2 id="faq-title">
          Got questions?
          <br />
          <em>We’ve got answers.</em>
        </h2>
        <p>
          Here are some of the most common questions about Toppershelf. Can’t
          find what you’re looking for? Feel free to contact us.
        </p>
        <Button variant="secondary" href="/contact">
          Contact Support <Icon name="arrow" size={15} />
        </Button>
      </div>
      <div className={cn("faq-list")}>
        {faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
