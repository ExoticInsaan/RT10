import type { Metadata } from "next";
import Link from "next/link";
import ToolIcon, { type ToolIconName } from "@/components/tools/ToolIcon";
import { ButtonLink, SectionHead } from "@/components/tools/ui";

export const metadata: Metadata = {
  title: "Founders",
  description: "Meet the person behind TopperShelf, a free tools website built to make small tasks feel smaller.",
  alternates: { canonical: "/founders" },
};

const beliefs: { icon: ToolIconName; title: string; text: string }[] = [
  { icon: "zap", title: "Useful over unnecessary", text: "Every tool must do one real job well. If it does not save you time, it does not ship." },
  { icon: "lock", title: "Private by default", text: "Your files are yours. We process them on your device wherever possible, and we say so only when it is true." },
  { icon: "sparkles", title: "Simple, with a smile", text: "One screen, one button, one result. And a few silly tools, because not everything has to be productive." },
  { icon: "heart", title: "Built from your requests", text: "The tools people ask for are the tools we build next. Tell us what is missing." },
];

export default function FoundersPage() {
  return (
    <>
      <section className="bg-blue-soft/60 py-14 sm:py-20">
        <div className="container-app grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="eyebrow">The person behind it</span>
            <h1 className="mb-4 mt-5 text-4xl font-extrabold tracking-tight text-navy sm:text-6xl">
              Meet the founder of TopperShelf
            </h1>
            <p className="m-0 max-w-xl text-base leading-7 text-slate-700">
              TopperShelf is a free tools website for the small things students need done fast: resize an exam photo, convert a CGPA, check attendance. We are building the shelf that has all of it.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/the-shelf">
                Explore tools <ToolIcon name="arrow" size={16} />
              </ButtonLink>
              <ButtonLink href="/about" variant="secondary">
                About TopperShelf
              </ButtonLink>
            </div>
          </div>
          <div
            className="rounded-3xl border border-line bg-white p-8 shadow-card"
            role="img"
            aria-label="Jatin Sinsinwar, Founder of TopperShelf"
          >
            <span className="grid size-20 place-items-center rounded-2xl bg-navy text-2xl font-extrabold text-white">JS</span>
            <p className="mb-0 mt-5 text-xs font-bold uppercase tracking-widest text-blue-hover">Founder</p>
            <p className="m-0 mt-1 text-3xl font-extrabold leading-tight tracking-tight text-navy">
              Jatin
              <br />
              Sinsinwar
            </p>
            <p className="mb-0 mt-3 text-sm text-muted">TopperShelf · Bharatpur, Rajasthan</p>
          </div>
        </div>
      </section>

      <section className="container-app grid gap-8 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-hover">Our mission</span>
          <h2 className="mb-0 mt-2 text-3xl font-extrabold tracking-tight text-navy">
            Make small tasks feel smaller
          </h2>
        </div>
        <div className="space-y-4 leading-7 text-slate-700">
          <p className="m-0">
            Most people do not want another app. They want to land on a page, get the job done and leave. So TopperShelf is built
            around speed: tools that run in your browser, no waiting in a queue, no watermark on your file.
          </p>
          <p className="m-0">
            Jatin is building it as a founder-led project, one tool at a time, with new tools added every week. What gets built next
            depends on what you ask for.
          </p>
        </div>
      </section>

      <section className="bg-surface/60 py-14">
        <div className="container-app">
          <SectionHead eyebrow="What we believe" title="Principles we build by" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {beliefs.map((belief) => (
              <article
                key={belief.title}
                className="rounded-2xl border border-line bg-white p-6"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-blue-soft text-blue-hover">
                  <ToolIcon name={belief.icon} size={20} />
                </span>
                <h3 className="mb-2 mt-4 text-base font-bold text-navy">{belief.title}</h3>
                <p className="m-0 text-sm leading-6 text-muted">{belief.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-app py-14">
        <div className="flex items-start gap-4 rounded-2xl border border-line bg-white p-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue-soft text-blue-hover">
            <ToolIcon name="user" size={20} />
          </span>
          <div>
            <h2 className="m-0 text-lg font-bold text-navy">Currently founder-led</h2>
            <p className="mb-0 mt-1 text-sm leading-6 text-muted">
              TopperShelf is being built by Jatin. Team profiles will be added here as the team grows.
            </p>
          </div>
        </div>
      </section>

      <section className="container-app pb-20">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-navy p-8 text-white sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="m-0 text-2xl font-extrabold tracking-tight sm:text-3xl">Missing a tool?</h2>
            <p className="mb-0 mt-2 text-sm text-slate-300">Tell us what to build next. The most-asked tools go first.</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 text-sm font-bold text-navy transition hover:bg-blue-soft"
          >
            Request a tool <ToolIcon name="arrow" size={15} />
          </Link>
        </div>
      </section>
    </>
  );
}
