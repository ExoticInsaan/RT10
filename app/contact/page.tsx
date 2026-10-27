import type { Metadata } from "next";
import Link from "next/link";
import ToolIcon, { type ToolIconName } from "@/components/tools/ToolIcon";
import { ADDRESS, BUSINESS, GRIEVANCE_NAME, SUPPORT_EMAIL } from "@/components/shell/Legal";

export const metadata: Metadata = {
  title: "Contact & Feedback",
  description:
    "Request a new tool, report a bug, send feedback or ask us to delete your data. A real person replies, usually within 48 hours.",
  alternates: { canonical: "/contact" },
};

const topics: { title: string; body: string; subject: string; hint: string; icon: ToolIconName }[] = [
  {
    title: "Request a tool",
    body: "Tell us the small job you keep doing the hard way. The most-asked tools get built first.",
    subject: "Tool request",
    hint: "What should the tool do? What would you type or upload, and what result do you want?",
    icon: "sparkles",
  },
  {
    title: "Report a problem",
    body: "A tool failed, gave a wrong result or looked broken on your phone? Tell us and we will fix it.",
    subject: "Problem report",
    hint: "Include the tool name, your phone or browser, what you did and what went wrong. A screenshot helps.",
    icon: "zap",
  },
  {
    title: "Feedback or an idea",
    body: "Something to make the site faster, simpler or funnier? We read every message.",
    subject: "Feedback",
    hint: "What would make TopperShelf better for you?",
    icon: "message",
  },
  {
    title: "Delete my account or data",
    body: "Ask to see, correct or delete the personal data we hold about you.",
    subject: "Data or account request",
    hint: "Write from the email address you signed in with.",
    icon: "shield",
  },
];

function mailto(subject: string, hint: string) {
  const body = `${hint}\n\n`;
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`TopperShelf: ${subject}`)}&body=${encodeURIComponent(body)}`;
}

export default function ContactPage() {
  return (
    <div className="container-app max-w-4xl pb-20 pt-10">
      <span className="eyebrow">We read everything</span>
      <h1 className="mb-3 mt-4 text-4xl font-extrabold tracking-tight text-navy dark:text-white sm:text-5xl">
        Contact &amp; feedback
      </h1>
      <p className="m-0 max-w-2xl leading-relaxed text-muted dark:text-slate-400">
        Questions, problems or a tool you wish existed? Write to us and a real person will reply, usually within 48 hours.
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <p className="m-0 text-sm font-semibold text-muted dark:text-slate-400">Support email</p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-1 block break-all text-xl font-extrabold text-blue-hover hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
        <p className="mb-0 mt-3 text-sm leading-6 text-muted dark:text-slate-400">
          If your message is about your account, please write from the email address you signed in with so we can find it quickly.
        </p>
      </div>

      <h2 className="mb-1 mt-12 text-2xl font-extrabold tracking-tight text-navy dark:text-white">What do you need?</h2>
      <p className="m-0 text-sm text-muted dark:text-slate-400">
        Tap a topic and your email app opens with the details we need already listed.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {topics.map((topic) => (
          <a
            key={topic.title}
            href={mailto(topic.subject, topic.hint)}
            className="group flex flex-col rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-1 hover:border-blue/60 hover:shadow-card dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-blue-soft text-blue-hover dark:bg-slate-800">
              <ToolIcon name={topic.icon} size={20} />
            </span>
            <span className="mt-4 text-base font-bold text-navy dark:text-white">{topic.title}</span>
            <span className="mt-1 text-sm leading-6 text-muted dark:text-slate-400">{topic.body}</span>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-hover">
              Write to us <ToolIcon name="arrow" size={14} />
            </span>
          </a>
        ))}
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="m-0 text-lg font-bold text-navy dark:text-white">Business details</h2>
          <p className="mb-0 mt-2 leading-relaxed text-slate-700 dark:text-slate-300">
            {BUSINESS}
            <br />
            {ADDRESS}
            <br />
            Email: {SUPPORT_EMAIL}
          </p>
        </div>
        <div>
          <h2 className="m-0 text-lg font-bold text-navy dark:text-white">Grievance Officer</h2>
          <p className="mb-0 mt-2 leading-relaxed text-slate-700 dark:text-slate-300">
            For complaints about how we handle your data or about the Site, write to {GRIEVANCE_NAME} at {SUPPORT_EMAIL}. We
            acknowledge complaints within 48 hours and aim to resolve them within 30 days.
          </p>
        </div>
      </div>

      <p className="mt-10 text-sm text-muted dark:text-slate-400">
        Your question may already be answered in our{" "}
        <Link href="/terms" className="font-semibold underline">Terms of Use</Link> or{" "}
        <Link href="/privacy" className="font-semibold underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
