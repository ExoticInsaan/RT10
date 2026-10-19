import type { Metadata } from "next";
import Link from "next/link";
import cn from "@/lib/design/twStyles";
import { aboutCategories, aboutFaqs } from "@/lib/design/aboutContent";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import SectionLabel from "@/components/ui/SectionLabel";

export const metadata: Metadata = {
  title: "About",
  description:
    "Toppershelf helps B.Sc. Nursing, GNM and Post Basic students find exam-focused study resources in one organized place, from semester-wise notes to subject-focused revision material.",
};

export default function AboutPage() {
  return (
    <main className={cn("about-page")}>
      <section className={cn("about-hero container")}>
        <div className={cn("about-hero-copy")}>
          <SectionLabel variant="hero">About Toppershelf</SectionLabel>
          <h1>Making Nursing Study Resources Easier to Find</h1>
          <p className={cn("about-display")}>Better Resources. More Confident Nursing Studies.</p>
          <p className={cn("about-lede")}>
            Toppershelf helps nursing students discover and access study resources in one organized
            place—from semester-wise notes to subject-focused revision materials.
          </p>
          <div className={cn("about-actions")}>
            <Button href="/browse">
              Explore Study Resources <Icon name="arrow" size={16} />
            </Button>
            <Button variant="secondary" href="/browse?course=bsc-nursing">
              Browse Nursing Notes
            </Button>
          </div>
        </div>
        <figure className={cn("about-hero-visual")}>
          {/* Photo is hot-linked from Unsplash, as in the design file. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1659633528248-a4de143eef8d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200"
            alt="A neatly arranged stack of textbooks in natural light"
          />
          <figcaption>
            <span>Study with clarity</span>
            <strong>Notes, revision and exam preparation.</strong>
          </figcaption>
        </figure>
      </section>

      <section className={cn("about-purpose container")}>
        <div className={cn("study-sheet-visual")} aria-hidden="true">
          <div className={cn("sheet-back")}>
            <span />
            <span />
            <span />
          </div>
          <div className={cn("sheet-front")}>
            <small>B.Sc. Nursing</small>
            <strong>Semester study plan</strong>
            <span />
            <span />
            <span />
            <div>
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
        <div className={cn("about-purpose-copy")}>
          <SectionLabel variant="editorial" number="01">
            Our purpose
          </SectionLabel>
          <h2>Why Toppershelf?</h2>
          <p>
            Finding the right study material should not feel like another exam. Toppershelf is being
            built to make nursing study resources easier to discover, organized by relevant
            subjects, semesters and resource types. Our goal is to help students spend less time
            searching and more time learning.
          </p>
          <Link href="/founders" className={cn("text-link")}>
            Meet the founders <Icon name="arrow" size={15} />
          </Link>
        </div>
      </section>

      <section className={cn("about-benefits container")} aria-label="How Toppershelf helps">
        <article>
          <span className={cn("about-icon")}>
            <Icon name="search" />
          </span>
          <div>
            <h3>Find Resources Faster</h3>
            <p>
              Explore study materials organized around nursing subjects, semesters and resource
              types.
            </p>
          </div>
        </article>
        <article>
          <span className={cn("about-icon")}>
            <Icon name="book" />
          </span>
          <div>
            <h3>Study With More Structure</h3>
            <p>
              Find relevant notes and revision resources that fit your current stage of nursing
              studies.
            </p>
          </div>
        </article>
        <article>
          <span className={cn("about-icon")}>
            <Icon name="shield" />
          </span>
          <div>
            <h3>One Organized Destination</h3>
            <p>
              Browse nursing study resources through a clear, student-friendly discovery experience.
            </p>
          </div>
        </article>
      </section>

      <section className={cn("about-resources")}>
        <div className={cn("container")}>
          <div className={cn("about-section-head")}>
            <SectionLabel variant="content">Explore nursing resources</SectionLabel>
            <h2>Explore Nursing Study Materials</h2>
            <p>Start with your course and year, or search by document name.</p>
          </div>
          <div className={cn("about-category-grid")}>
            {aboutCategories.map((category) => (
              <Link key={category.title} href={category.href} className={cn("about-category-card")}>
                <span>{category.number}</span>
                <h3>{category.title}</h3>
                <p>{category.text}</p>
                <strong>
                  Explore <Icon name="arrow" size={15} />
                </strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={cn("about-approach container")}>
        <div className={cn("about-section-head")}>
          <SectionLabel variant="editorial" number="02">
            Our approach
          </SectionLabel>
          <h2>Built Around Nursing Students</h2>
        </div>
        <div className={cn("approach-grid")}>
          <article>
            <Icon name="search" />
            <h3>Student-Focused Discovery</h3>
            <p>Make relevant study resources easier to find.</p>
          </article>
          <article>
            <Icon name="book" />
            <h3>Clear Organization</h3>
            <p>
              Arrange materials by course, year and type wherever available.
            </p>
          </article>
          <article>
            <Icon name="heart" />
            <h3>Useful Learning Support</h3>
            <p>Help students locate resources that support their own study routines.</p>
          </article>
        </div>
      </section>

      <section className={cn("about-faq container")} aria-labelledby="about-faq-title">
        <div>
          <SectionLabel variant="editorial" number="03">
            Good to know
          </SectionLabel>
          <h2 id="about-faq-title">Frequently Asked Questions</h2>
          <p>Learn more about finding nursing study resources on Toppershelf.</p>
        </div>
        <div className={cn("faq-list")}>
          {aboutFaqs.map(([question, answer]) => (
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

      <section className={cn("about-final")}>
        <div className={cn("container")}>
          <div>
            <SectionLabel variant="content">Your next chapter</SectionLabel>
            <h2>Find Your Next Study Resource</h2>
            <p>Explore nursing notes and discover resources for your learning journey.</p>
          </div>
          <Button href="/browse">
            Explore Toppershelf <Icon name="arrow" size={17} />
          </Button>
        </div>
      </section>
    </main>
  );
}
