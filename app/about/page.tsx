import type { Metadata } from "next";
import Link from "next/link";
import ToolIcon, { type ToolIconName } from "@/components/tools/ToolIcon";
import { ButtonLink, SectionHead, ToolCard } from "@/components/tools/ui";
import { categoryHref, isReady, tools, type Category } from "@/lib/tools/registry";

export const metadata: Metadata = {
  title: "About TopperShelf",
  description:
    "TopperShelf is a free, fast tools website: PDF, image, calculators, text, India tools, student tools and a few silly ones. One quick signup, no watermark.",
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

const shelves: { category: Category; icon: ToolIconName; text: string }[] = [
  { category: "PDF", icon: "file", text: "Merge, compress, split and convert PDFs." },
  { category: "Image", icon: "image", text: "Compress and resize photos in seconds." },
  { category: "Calculators", icon: "calculator", text: "EMI, age, dates and other everyday sums." },
  { category: "Text", icon: "type", text: "Word counter, case converter, QR codes." },
  { category: "India Tools", icon: "india", text: "Exact-size files for forms, GST and photo sizes." },
  { category: "Students", icon: "graduation", text: "CGPA, attendance and nursing calculators." },
];

const roadmap: { icon: ToolIconName; title: string; text: string }[] = [
  { icon: "zap", title: "New tools, regularly", text: "The PDF, image, calculator, text and India tools are being built now, and more follow after that." },
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
  ["What is TopperShelf?", "A free website of fast online tools for files, numbers, words and everyday life, plus a Fun Zone of witty tools you can share."],
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
      <section className="bg-blue-soft/60 py-14 dark:bg-slate-900/60 sm:py-20">
        <div className="container-app max-w-4xl text-center">
          <span className="eyebrow">About TopperShelf</span>
          <h1 className="mx-auto mb-4 mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-navy dark:text-white sm:text-6xl">
            Useful tools. A few silly ones. <span className="text-blue-hover">All free.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-300">
            TopperShelf is a fast tools website for everyone. Find a tool in seconds, sign in once, use it in your browser and get on
            with your day. {liveTools.length} {liveTools.length === 1 ? "tool is" : "tools are"} live today and {soonTools.length} more are on the way.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/tools">
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
              className="rounded-2xl border border-line bg-white p-4 text-center shadow-card dark:border-slate-800 dark:bg-slate-900"
            >
              <dt className="text-xl font-extrabold text-navy dark:text-white sm:text-2xl">{value}</dt>
              <dd className="m-0 mt-1 text-xs text-muted dark:text-slate-400">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-app grid gap-8 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-hover">Why TopperShelf</span>
          <h2 className="mb-0 mt-2 text-3xl font-extrabold tracking-tight text-navy dark:text-white">
            Small jobs, done fast
          </h2>
        </div>
        <div className="space-y-4 leading-7 text-slate-700 dark:text-slate-300">
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
              className="rounded-2xl border border-line bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-blue-soft text-blue-hover dark:bg-slate-800">
                <ToolIcon name={item.icon} size={22} />
              </span>
              <h3 className="mb-2 mt-4 text-lg font-bold text-navy dark:text-white">{item.title}</h3>
              <p className="m-0 text-sm leading-6 text-muted dark:text-slate-400">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-app pb-14">
        <SectionHead eyebrow="What you will find" title="Everything on one shelf" href="/tools" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shelves.map((shelf) => (
            <Link
              key={shelf.category}
              href={categoryHref(shelf.category)}
              className="group rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-1 hover:border-blue/60 hover:shadow-card dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-blue-soft text-blue-hover dark:bg-slate-800">
                <ToolIcon name={shelf.icon} size={20} />
              </span>
              <h3 className="mb-1 mt-4 text-base font-bold text-navy dark:text-white">{shelf.category}</h3>
              <p className="m-0 text-sm leading-6 text-muted dark:text-slate-400">{shelf.text}</p>
              <p className="mb-0 mt-3 text-xs font-bold text-blue-hover">
                {tools.filter((tool) => tool.category === shelf.category && isReady(tool)).length} of{" "}
                {tools.filter((tool) => tool.category === shelf.category).length} live
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface/60 py-14 dark:bg-slate-900/40">
        <div className="container-app">
          <SectionHead eyebrow="Where we are today" title="Live now, and what is coming" href="/tools" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {liveTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} compact />
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-line bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="m-0 text-base font-bold text-navy dark:text-white">Coming soon</h3>
            <dl className="m-0 mt-4 grid gap-4 sm:grid-cols-2">
              {Object.entries(soonByCategory).map(([category, names]) => (
                <div key={category}>
                  <dt className="text-xs font-bold uppercase tracking-widest text-blue-hover">{category}</dt>
                  <dd className="m-0 mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">{names.join(", ")}</dd>
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
              className="rounded-2xl border border-line bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-blue-soft text-blue-hover dark:bg-slate-800">
                <ToolIcon name={item.icon} size={20} />
              </span>
              <h3 className="mb-2 mt-4 text-base font-bold text-navy dark:text-white">{item.title}</h3>
              <p className="m-0 text-sm leading-6 text-muted dark:text-slate-400">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-surface/60 py-14 dark:bg-slate-900/40">
        <div className="container-app">
          <SectionHead eyebrow="How it works" title="Three steps, no maze" />
          <ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step} className="rounded-2xl border border-line bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <span className="grid size-9 place-items-center rounded-full bg-navy text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                <p className="mb-0 mt-4 text-sm leading-6 text-slate-700 dark:text-slate-300">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-app grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-hover">Good to know</span>
          <h2 className="mb-2 mt-2 text-3xl font-extrabold tracking-tight text-navy dark:text-white">Questions, answered</h2>
          <p className="m-0 text-sm leading-6 text-muted dark:text-slate-400">
            Still stuck? <Link href="/contact" className="font-bold text-blue-hover underline">Write to us</Link>.
          </p>
        </div>
        <div className="space-y-3">
          {faqList.map(([question, answer]) => (
            <details
              key={question}
              className="group rounded-2xl border border-line bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-navy dark:text-white">
                {question}
                <span aria-hidden="true" className="text-lg text-blue-hover transition group-open:rotate-45">+</span>
              </summary>
              <p className="mb-0 mt-3 text-sm leading-6 text-muted dark:text-slate-400">{answer}</p>
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
            <ButtonLink href="/tools" variant="secondary">
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
