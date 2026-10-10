import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of Use" };

// ---- DETAILS USED ON THIS PAGE ---------------------------------------------
const BUSINESS = "TopperShelf";
const SUPPORT_EMAIL = "support@toppershelf.online";
const ADDRESS = "Bharatpur, Rajasthan, India";
const GRIEVANCE_NAME = "Jatin Sinsinwar";
const EFFECTIVE = "10 October 2026";
const COURTS = "Bharatpur, Rajasthan";
// -----------------------------------------------------------------------------

const h2 = "mt-8 text-lg font-semibold text-slate-900";
const p = "mt-2 text-slate-700 leading-relaxed";
const ul = "mt-2 list-disc space-y-1 pl-5 text-slate-700";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">Terms of Use</h1>
      <p className="mt-1 text-sm text-slate-500">Effective date: {EFFECTIVE}</p>

      <p className={p}>
        These Terms of Use (&quot;Terms&quot;) are a legal agreement between you and {BUSINESS} (&quot;TopperShelf&quot;,
        &quot;we&quot;, &quot;us&quot;), {ADDRESS}. They apply to your use of toppershelf.online (the &quot;Site&quot;)
        and to everything you buy on it. Please read them with our{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link> and{" "}
        <Link href="/refund" className="underline">Refund Policy</Link>. If you do not agree, please do not use the Site.
      </p>

      <h2 className={h2}>1. What TopperShelf offers</h2>
      <p className={p}>
        TopperShelf sells digital study material for nursing students: notes (PDF), practice quizzes and mock tests
        (together, &quot;Material&quot;). Material is delivered online only. Nothing is shipped.
      </p>

      <h2 className={h2}>2. Who can use the Site</h2>
      <ul className={ul}>
        <li>You must be 18 or older to create an account and buy. If you are under 18, a parent or guardian must sign in and buy for you, and they are responsible for the account.</li>
        <li>You must give correct information and keep your sign-in secure. You are responsible for everything done through your account.</li>
        <li>You may browse the Site without an account. You need to sign in to buy and to see your library.</li>
      </ul>

      <h2 className={h2}>3. Prices and payment</h2>
      <ul className={ul}>
        <li>Prices are shown in Indian rupees and include applicable taxes unless the page says otherwise.</li>
        <li>Payments are processed by Razorpay. We never see or store your card, UPI PIN or bank details.</li>
        <li>Material unlocks only after Razorpay confirms your payment to us. This is usually quick, but it can take a few minutes. If you have paid and the item does not appear, write to {SUPPORT_EMAIL} with your payment reference.</li>
        <li>We may change prices at any time. A change does not affect Material you have already bought.</li>
      </ul>

      <h2 className={h2}>4. Your licence to use Material</h2>
      <p className={p}>
        When you buy Material, we give you a personal, non-exclusive, non-transferable, non-sublicensable licence to
        view and use it for your own study. The licence lasts as long as we offer the Material and your account stays
        in good standing. You may download or print a purchased PDF for your own use only.
      </p>

      <h2 className={h2}>5. What you must not do</h2>
      <ul className={ul}>
        <li>Copy, share, forward, post, sell, rent, lend or upload Material, or any part of it, to anyone else or to any website, group, app or channel (including WhatsApp, Telegram and Google Drive).</li>
        <li>Share your account, or let others use the Material you bought.</li>
        <li>Remove watermarks, copyright notices or identifying marks, or try to get around access controls.</li>
        <li>Scrape the Site, use bots, or copy Material with automated tools.</li>
        <li>Attack, overload or try to break into the Site, or interfere with other users.</li>
        <li>Use the Site for anything unlawful or in a way that harms us or others.</li>
      </ul>
      <p className={p}>
        If you break these rules, we may suspend or close your account and remove access to Material without a refund,
        and we may take legal action to protect our rights.
      </p>

      <h2 className={h2}>6. Ownership and copyright</h2>
      <p className={p}>
        The Site, its design, and all Material are owned by us or used with permission, and are protected by the
        Copyright Act, 1957 and other laws. You get only the licence in section 4. You do not get ownership of
        anything. If you believe something on the Site infringes your copyright, write to {SUPPORT_EMAIL} with the
        page address, proof that you own the work, and your contact details, and we will look into it promptly.
      </p>

      <h2 className={h2}>7. Study aid only, not professional advice</h2>
      <ul className={ul}>
        <li>Material is meant to help you revise. It is not medical, clinical or nursing advice and must not be used to treat or care for any patient. Follow your college, hospital and nursing council guidelines for clinical practice.</li>
        <li>We try to keep Material accurate and up to date, but syllabi and guidelines change and mistakes can happen. Please check important facts against your textbooks and official sources.</li>
        <li>We do not promise any exam result, mark, rank or job. Your results depend on your own effort.</li>
        <li>TopperShelf is an independent service. It is not affiliated with, or endorsed by, any university, college, nursing council or exam body, and any such names are used only to describe the subject or course.</li>
      </ul>

      <h2 className={h2}>8. Refunds</h2>
      <p className={p}>
        Because Material is digital and is available to you immediately, refunds are given only in the cases set out in
        our <Link href="/refund" className="underline">Refund Policy</Link>.
      </p>

      <h2 className={h2}>9. Availability and changes</h2>
      <p className={p}>
        We aim to keep the Site running, but we do not promise that it will always be available or free of errors. We
        may update, change or remove features or Material, for example for maintenance, legal reasons or if the
        Material is out of date. If we withdraw Material you have paid for, we will tell you and handle it fairly.
      </p>

      <h2 className={h2}>10. Third-party services</h2>
      <p className={p}>
        The Site relies on services from others, including Vercel (hosting), Supabase (database and sign-in),
        Cloudflare (domain), Google (sign-in and analytics) and Razorpay (payments). Their own terms apply to the parts
        they provide. We are not responsible for their outages or actions, but we choose them with care.
      </p>

      <h2 className={h2}>11. Our liability</h2>
      <ul className={ul}>
        <li>The Site and Material are provided &quot;as is&quot; and &quot;as available&quot;. To the extent the law allows, we do not give any warranty beyond what these Terms state.</li>
        <li>To the extent the law allows, we are not liable for indirect or consequential loss, loss of marks, opportunity, profit or data, or for loss caused by events outside our reasonable control.</li>
        <li>To the extent the law allows, our total liability for any claim connected with the Site or Material is limited to the amount you paid us for the item the claim is about.</li>
        <li>Nothing in these Terms removes or limits any right you have under law that cannot be excluded, including your rights as a consumer under the Consumer Protection Act, 2019.</li>
      </ul>

      <h2 className={h2}>12. Your responsibility to us</h2>
      <p className={p}>
        You agree to compensate us for loss, claims and reasonable costs that arise because you broke these Terms or
        the law, for example by sharing or reselling Material.
      </p>

      <h2 className={h2}>13. Suspension and ending your account</h2>
      <p className={p}>
        You can stop using the Site at any time and may ask us to delete your account by writing to {SUPPORT_EMAIL}.
        We may suspend or end your access if you break these Terms, if we must by law, or if we stop offering the Site.
        Sections that by their nature should continue (such as 5, 6, 11, 12 and 15) will continue after your account ends.
      </p>

      <h2 className={h2}>14. Changes to these Terms</h2>
      <p className={p}>
        We may update these Terms from time to time. The effective date above shows the latest version. If you keep
        using the Site after a change, you accept the new Terms. For significant changes we will notify you on the Site
        or by email.
      </p>

      <h2 className={h2}>15. Governing law and disputes</h2>
      <p className={p}>
        These Terms are governed by the laws of India. Please write to us first at {SUPPORT_EMAIL} so we can try to
        solve the problem. If we cannot, the courts at {COURTS} will have jurisdiction, subject to any right you have
        under law to bring a consumer complaint elsewhere.
      </p>

      <h2 className={h2}>16. Complaints and contact</h2>
      <p className={p}>
        Grievance Officer: {GRIEVANCE_NAME}, {BUSINESS}, {ADDRESS}. Email: {SUPPORT_EMAIL}. We aim to acknowledge
        complaints within 48 hours and resolve them within 30 days.
      </p>

      <h2 className={h2}>17. General</h2>
      <ul className={ul}>
        <li>If any part of these Terms is found invalid, the rest stays in force.</li>
        <li>If we do not enforce a right straight away, we have not given it up.</li>
        <li>You may not transfer your rights under these Terms. We may transfer ours as part of a business change.</li>
        <li>These Terms and the Privacy and Refund Policies are the whole agreement between you and us about the Site.</li>
      </ul>
    </div>
  );
}
