import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Contact" };

// ---- DETAILS USED ON THIS PAGE ---------------------------------------------
const BUSINESS = "TopperShelf";
const SUPPORT_EMAIL = "support@toppershelf.online";
const ADDRESS = "Bharatpur, Rajasthan, India";
const GRIEVANCE_NAME = "Jatin Sinsinwar";
// -----------------------------------------------------------------------------

const topics = [
  {
    title: "Payment or access problem",
    body: "Paid but the item did not unlock, or you were charged twice.",
    subject: "Payment or access problem",
    hint: "Include the email you signed in with, the item name and your payment reference.",
  },
  {
    title: "Refund request",
    body: "Read the Refund Policy first, then write to us within 7 days of payment.",
    subject: "Refund request",
    hint: "Include the email you signed in with, the item name, your payment reference and the problem.",
  },
  {
    title: "Mistake in the material",
    body: "Found a wrong answer, a typo or an outdated point? Tell us and we will check it.",
    subject: "Correction in material",
    hint: "Include the item name and the page or question number.",
  },
  {
    title: "Delete my account or data",
    body: "Ask to see, correct or delete the personal data we hold about you.",
    subject: "Data or account request",
    hint: "Write from the email address you signed in with.",
  },
];

function mailto(subject: string, hint: string) {
  const body = `${hint}\n\n`;
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`TopperShelf: ${subject}`)}&body=${encodeURIComponent(body)}`;
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">Contact us</h1>
      <p className="mt-2 leading-relaxed text-slate-700">
        Questions, problems or feedback? Write to us and a real person will reply, usually within 48 hours.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Support email</p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-1 block break-all text-lg font-semibold text-teal-700 hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
        <p className="mt-3 text-sm text-slate-600">
          We reply to every email. Please write from the email address you used to sign in, so we can find your account
          quickly.
        </p>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">What do you need help with?</h2>
      <p className="mt-1 text-sm text-slate-600">
        Tap a topic and your email app opens with the details we need already listed.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {topics.map((t) => (
          <a
            key={t.title}
            href={mailto(t.subject, t.hint)}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-400 hover:shadow-md"
          >
            <span className="font-semibold text-slate-900">{t.title}</span>
            <span className="mt-1 text-sm text-slate-600">{t.body}</span>
            <span className="mt-3 text-sm font-medium text-teal-700">Write to us →</span>
          </a>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Business details</h2>
      <p className="mt-2 leading-relaxed text-slate-700">
        {BUSINESS}
        <br />
        {ADDRESS}
        <br />
        Email: {SUPPORT_EMAIL}
      </p>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Grievance Officer</h2>
      <p className="mt-2 leading-relaxed text-slate-700">
        For complaints about how we handle your data or about the Site, write to {GRIEVANCE_NAME} at {SUPPORT_EMAIL}.
        We acknowledge complaints within 48 hours and aim to resolve them within 30 days.
      </p>

      <p className="mt-8 text-sm text-slate-600">
        Before you write, these pages may already answer your question:{" "}
        <Link href="/refund" className="underline">Refund Policy</Link>,{" "}
        <Link href="/terms" className="underline">Terms of Use</Link>,{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
