import type { Metadata } from "next";
import Link from "next/link";
import ToolIcon, { type ToolIconName } from "@/components/tools/ToolIcon";
import { ButtonLink, SectionHead, ToolCard } from "@/components/tools/ui";
import { categories, isReady, tools } from "@/lib/tools/registry";

export const metadata: Metadata = {
  title: "About TopperShelf",
  description:
    "TopperShelf is a free, fast tools website in two parts: The Shelf for useful tools like the exam photo resizer, CGPA converter and leave letters, and the Fun Zone for shareable fun. One quick signup, no watermark.",
  alternates: { canonical: "/about" },
};

const promises: { icon: ToolIconName; title: string; text: string }[] = [
  {
    icon: "zap",
    title: "Fast",
    text: "Tools run in your browser, so there is no upload wait and no queue. Open a tool, use it, done.",
  },
  {
    icon: "lock",
    title: "Private",
    text: "Files are processed on your own device wherever possible. A tool says “Your files never leave your device” only when that is true.",
  },
  {
    icon: "sparkles",
    title: "Simple",
    text: "One quick Google signup. No watermark, no popups blocking the tool. One screen: input, one button, result.",
  },
];

const roadmap: { icon: ToolIconName; title: string; text: string }[] = [
  { icon: "zap", title: "New tools, regularly", text: "More useful tools for The Shelf are being built now, with new Fun Zone tools in between." },
  { icon: "download", title: "Install it like an app", text: "Add TopperShelf to your home screen from the browser, with simple tools working offline." },
  { icon: "home", title: "An Android app", text: "The same site, wrapped for Google Play, so there is still just one TopperShelf to keep updated." },
  { icon: "heart", title: "Favourites that follow you", text: "Starred and recently used tools saved to your account, so they appear on every device you sign in on." },
];

const steps = [
  "Search for the job you need to do, or arrive straight from Google on a tool page.",
  "Sign in once with Google. After that you stay signed in on your device.",
  "Use the tool right on the page. Download, copy or share the result.",
];

const faqs: [string, string][] = [
  ["What is TopperShelf?", "A free website with two parts: The Shelf, with fast, useful tools for forms, letters, PDFs, grades and more, and the Fun Zone, with witty tools whose results you can share."],
  ["Is it really free?", "Yes. Every tool is free to use, with no watermark. You only need a quick Google signup to run a tool."],
  ["Why do I need to sign in?", "Signing in once lets us keep your favourites and recent tools with you across visits and helps us keep the site fast and free of abuse. We collect only your name and email."],
  ["Are my files uploaded anywhere?", "Our file tools are built to work in your browser, so your files stay on your device. Each tool page tells you if that is true for that tool."],
  ["Which tools work right now?", "WORKING_ANSWER"],
  ["Is there an app?", "Not yet. The website is the product today. An installable version you can add from your browser, and an Android app, are planned."],
  ["How can I ask for a new tool?", "Use the Request a tool option on the Contact page. The tools people ask for most get built first."],
];

export default function AboutPage() {
  const liveTools = tools.filter(isReady);
  const soonTools = tools.filter((tool) => !isReady(tool));
  const soonByCategory = soonTools.reduce<Record<string, string[]>>((groups, tool) => {
    (groups[tool.category] ||= []).push(tool.name);
    return groups;
  }, {});
  const faqList = faqs.map(([question, answer]): [string, string] =>
    answer === "WORKING_ANSWER"
      ? [
          question,
          `${liveTools.length} ${liveTools.length === 1 ? "tool is" : "tools are"} live today: ${liveTools.map((tool) => tool.name).join(", ")}. The other ${soonTools.length} are being built and show a “Soon” badge until they work. This page updates itself as each one goes live.`,
        ]
      : [question, answer],
  );
  return (
    <>
      <section className="bg-blue-soft/60 py-14 sm:py-20">
        <div className="container-app max-w-4xl text-center">
          <span className="eyebrow">About TopperShelf</span>
          <h1 className="mx-auto mb-4 mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-navy sm:text-6xl">
            Useful tools. A few silly ones. <span className="text-blue-hover">All free.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-700">
            TopperShelf is a fast tools website for everyone. Find a tool in seconds, sign in once, use it in your browser and get on
            with your day. {liveTools.length} {liveTools.length === 1 ? "tool is" : "tools are"} live today and {soonTools.length} more are on the way.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/the-shelf">
              Explore all tools <ToolIcon name="arrow" size={16} />
            </ButtonLink>
            <ButtonLink href="/fun" variant="secondary">
              Visit the Fun Zone
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="container-app -mt-6 sm:-mt-8">
        <dl className="m-0 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            [String(liveTools.length), "tools live today"],
            [String(soonTools.length), "more on the way"],
            ["Free", "every tool, no payment"],
            ["1 signup", "then you stay signed in"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-line bg-white p-4 text-center shadow-card"
            >
              <dt className="text-xl font-extrabold text-navy sm:text-2xl">{value}</dt>
              <dd className="m-0 mt-1 text-xs text-muted">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-app grid gap-8 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-hover">Why TopperShelf</span>
          <h2 className="mb-0 mt-2 text-3xl font-extrabold tracking-tight text-navy">
            Small jobs, done fast
          </h2>
        </div>
        <div className="space-y-4 leading-7 text-slate-700">
          <p className="m-0">
            TopperShelf is a free tools website for everyone: a place to land from a search, get one small job done and leave,
            without installing anything or waiting in a queue.
          </p>
          <p className="m-0">
            The idea is simple. Every tool lives on its own page, runs in your browser and does one thing well. A few silly tools sit
            alongside the useful ones, because a result that makes you laugh is a result you will share.
          </p>
        </div>
      </section>

      <section className="container-app pb-14">
        <SectionHead eyebrow="Our promises" title="Fast, private and simple" />
        <div className="grid gap-4 md:grid-cols-3">
          {promises.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-line bg-white p-6"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-blue-soft text-blue-hover">
                <ToolIcon name={item.icon} size={22} />
              </span>
              <h3 className="mb-2 mt-4 text-lg font-bold text-navy">{item.title}</h3>
              <p className="m-0 text-sm leading-6 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-app pb-14">
        <SectionHead eyebrow="What you will find" title="Two shelves, one site" />
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((shelf) => (
            <Link
              key={shelf.name}
              href={shelf.href}
              className="group rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-1 hover:border-blue/60 hover:shadow-card"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-blue-soft text-blue-hover">
                <ToolIcon name={shelf.icon} size={20} />
              </span>
              <h3 className="mb-1 mt-4 text-base font-bold text-navy">{shelf.name}</h3>
              <p className="m-0 text-sm leading-6 text-muted">{shelf.blurb}</p>
              <p className="mb-0 mt-3 text-xs font-bold text-blue-hover">
                {tools.filter((tool) => tool.category === shelf.name && isReady(tool)).length} of{" "}
                {tools.filter((tool) => tool.category === shelf.name).length} live
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface/60 py-14">
        <div className="container-app">
          <SectionHead eyebrow="Where we are today" title="Live now, and what is coming" href="/the-shelf" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {liveTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} compact />
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-line bg-white p-6">
            <h3 className="m-0 text-base font-bold text-navy">Coming soon</h3>
            <dl className="m-0 mt-4 grid gap-4 sm:grid-cols-2">
              {Object.entries(soonByCategory).map(([category, names]) => (
                <div key={category}>
                  <dt className="text-xs font-bold uppercase tracking-widest text-blue-hover">{category}</dt>
                  <dd className="m-0 mt-1 text-sm leading-6 text-slate-700">{names.join(", ")}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="container-app py-14">
        <SectionHead eyebrow="What is planned" title="Where TopperShelf is headed" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roadmap.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-line bg-white p-6"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-blue-soft text-blue-hover">
                <ToolIcon name={item.icon} size={20} />
              </span>
              <h3 className="mb-2 mt-4 text-base font-bold text-navy">{item.title}</h3>
              <p className="m-0 text-sm leading-6 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-surface/60 py-14">
        <div className="container-app">
          <SectionHead eyebrow="How it works" title="Three steps, no maze" />
          <ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step} className="rounded-2xl border border-line bg-white p-6">
                <span className="grid size-9 place-items-center rounded-full bg-navy text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                <p className="mb-0 mt-4 text-sm leading-6 text-slate-700">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-app grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-hover">Good to know</span>
          <h2 className="mb-2 mt-2 text-3xl font-extrabold tracking-tight text-navy">Questions, answered</h2>
          <p className="m-0 text-sm leading-6 text-muted">
            Still stuck? <Link href="/contact" className="font-bold text-blue-hover underline">Write to us</Link>.
          </p>
        </div>
        <div className="space-y-3">
          {faqList.map(([question, answer]) => (
            <details
              key={question}
              className="group rounded-2xl border border-line bg-white px-5 py-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-navy">
                {question}
                <span aria-hidden="true" className="text-lg text-blue-hover transition group-open:rotate-45">+</span>
              </summary>
              <p className="mb-0 mt-3 text-sm leading-6 text-muted">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="container-app pb-20">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-navy p-8 text-white sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="m-0 text-2xl font-extrabold tracking-tight sm:text-3xl">Got a small job to get done?</h2>
            <p className="mb-0 mt-2 text-sm text-slate-300">Open a tool and be done in a minute. Meet the person behind it on the Founders page.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/the-shelf" variant="secondary">
              Explore tools
            </ButtonLink>
            <Link href="/founders" className="inline-flex min-h-12 items-center px-3 text-sm font-bold text-white underline">
              Meet the founder
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
