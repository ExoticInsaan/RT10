import type { Metadata } from "next";
import Link from "next/link";
import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import SectionLabel from "@/components/ui/SectionLabel";

export const metadata: Metadata = { title: "Founders" };

export default function FoundersPage() {
  return (
    <main className={cn("founders-page")}>
      <section className={cn("founders-hero container")}>
        <div className={cn("founders-hero-copy founders-reveal")}>
          <SectionLabel variant="hero">The people behind the mission</SectionLabel>
          <h1>Meet the People Behind Toppershelf</h1>
          <p className={cn("founders-statement")}>Built With Students in Mind.</p>
          <p className={cn("founders-lede")}>
            Toppershelf began with a simple idea: finding the right study material should be easier.
            We’re building a more organized way for nursing students to discover resources for their
            academic journey.
          </p>
          <Button href="/browse">
            Explore Toppershelf <Icon name="arrow" size={17} />
          </Button>
        </div>
        <div className={cn("founders-portrait-composition founders-reveal founders-delay")}>
          <div className={cn("founders-name-frame")} aria-label="Jatin Sinsinwar, Founder">
            <span>Founder</span>
            <strong>
              Jatin
              <br />
              Sinsinwar
            </strong>
            <small>Toppershelf</small>
          </div>
          <div className={cn("founders-photo-note")}>
            <span>Founder-led</span>
            <strong>Building a clearer path to nursing resources.</strong>
          </div>
          <div className={cn("founders-paper")} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className={cn("founder-spotlight")}>
        <div className={cn("container")}>
          <div className={cn("founder-identity")} aria-label="Jatin Sinsinwar, Founder">
            <span className={cn("founder-monogram")}>JS</span>
            <strong>
              Jatin
              <br />
              Sinsinwar
            </strong>
            <span>01 / Founder</span>
          </div>
          <div className={cn("founder-biography")}>
            <SectionLabel variant="editorial" number="01">
              Founder spotlight
            </SectionLabel>
            <h2>Jatin Sinsinwar</h2>
            <span className={cn("founder-role")}>Founder</span>
            <p>
              Jatin is building Toppershelf with a focus on making nursing study resources easier to
              discover and access. With a student-centered perspective, he wants to create a platform
              where learners can spend less time searching for study material and more time focusing
              on their education.
            </p>
            <div className={cn("founder-focus")}>
              <Icon name="book" />
              <span>
                <strong>Current focus</strong>
                Organizing resource discovery around real student needs.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={cn("founders-mission container")}>
        <div className={cn("mission-copy")}>
          <SectionLabel variant="editorial" number="02">
            Our mission
          </SectionLabel>
          <h2>A Small Idea With a Meaningful Purpose</h2>
          <p>
            Students have limited time, demanding syllabi, and different study needs. Toppershelf
            aims to simplify the process of discovering useful study resources by organizing them
            around courses, semesters, subjects, and resource types.
          </p>
        </div>
        <div className={cn("mission-illustration")} aria-hidden="true">
          <div className={cn("mission-book book-one")}>
            <span>B.Sc.</span>
            <strong>Nursing</strong>
          </div>
          <div className={cn("mission-book book-two")}>
            <span>Study</span>
            <strong>Notes</strong>
          </div>
          <div className={cn("mission-card")}>
            <Icon name="search" />
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className={cn("team-section")}>
        <div className={cn("container")}>
          <div className={cn("team-heading")}>
            <div>
              <SectionLabel variant="content">The people building Toppershelf</SectionLabel>
              <h2>Meet the Team</h2>
            </div>
            <p>Different strengths, one shared direction.</p>
          </div>
          <div className={cn("founder-led-note")}>
            <span className={cn("about-icon")}>
              <Icon name="user" />
            </span>
            <div>
              <h3>Currently founder-led</h3>
              <p>
                Toppershelf is currently being built by Jatin. Verified team profiles will be added
                here as the team grows.
              </p>
            </div>
            <Link href="/about" className={cn("text-link")}>
              About Toppershelf <Icon name="arrow" size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className={cn("beliefs-section container")}>
        <div className={cn("founders-section-heading")}>
          <SectionLabel variant="editorial" number="03">
            What we believe
          </SectionLabel>
          <h2>Principles for Building With Purpose</h2>
        </div>
        <div className={cn("beliefs-grid")}>
          <article>
            <span>
              <Icon name="check" />
            </span>
            <h3>Useful Over Unnecessary</h3>
            <p>We want every part of the platform to serve a clear purpose for students.</p>
          </article>
          <article>
            <span>
              <Icon name="book" />
            </span>
            <h3>Organization Creates Clarity</h3>
            <p>Study resources should be easier to explore, understand, and find again.</p>
          </article>
          <article>
            <span>
              <Icon name="bolt" />
            </span>
            <h3>Keep Improving</h3>
            <p>We aim to keep refining Toppershelf around students’ actual learning needs.</p>
          </article>
        </div>
      </section>

      <section className={cn("founders-closing")}>
        <div className={cn("container")}>
          <div>
            <SectionLabel variant="content">Looking ahead</SectionLabel>
            <h2>We’re Building for the Nursing Student Journey</h2>
            <p>
              From finding semester-wise notes to exploring subject-specific learning resources,
              Toppershelf is being developed to make study-resource discovery simpler.
            </p>
          </div>
          <div className={cn("founders-closing-actions")}>
            <Button href="/browse">
              Explore Resources <Icon name="arrow" size={16} />
            </Button>
            <Button variant="secondary" href="/about">
              About Toppershelf
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
