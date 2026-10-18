import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

// ---- DETAILS USED ON THIS PAGE ------------------------------
const BUSINESS = "TopperShelf";
const SUPPORT_EMAIL = "support@toppershelf.online";
const ADDRESS = "Bharatpur, Rajasthan, India";
const GRIEVANCE_NAME = "Jatin Sinsinwar";
const GRIEVANCE_EMAIL = "support@toppershelf.online";
const EFFECTIVE = "10 October 2026";
// -----------------------------------------------------------------------------

const h2 = "mt-8 text-lg font-semibold text-slate-900";
const p = "mt-2 text-slate-700 leading-relaxed";
const ul = "mt-2 list-disc space-y-1 pl-5 text-slate-700";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">Privacy Policy</h1>
      <p className="mt-1 text-sm text-slate-500">Effective date: {EFFECTIVE}</p>

      <p className={p}>
        This Privacy Policy explains how {BUSINESS} (&quot;TopperShelf&quot;, &quot;we&quot;, &quot;us&quot;)
        collects, uses, stores and protects your personal data when you use our website toppershelf.online.
        We follow the Digital Personal Data Protection Act, 2023 (DPDP Act), the Information Technology Act, 2000
        and the rules made under them. You can browse TopperShelf without an account. We create an account only when
        you sign in to buy something. By signing in or making a purchase you agree to this policy.
      </p>

      <h2 className={h2}>1. Who we are</h2>
      <p className={p}>
        {BUSINESS}, {ADDRESS}. We are the Data Fiduciary for the personal data described below.
        Contact: {SUPPORT_EMAIL}.
      </p>

      <h2 className={h2}>2. Data we collect</h2>
      <ul className={ul}>
        <li><b>Sign-in data:</b> if you continue with Google, your name, email address and profile picture, as shared by Google. If you continue with email, your email address and the one-time code you enter. On your first sign-in we also ask what name we should call you; you can change it at any time.</li>
        <li><b>Purchase data:</b> the items you buy, order and payment reference numbers, amount and date.</li>
        <li><b>Quiz and test data:</b> your answers, scores and attempt times, so we can show your results.</li>
        <li><b>Technical data:</b> device, browser, IP address and pages visited, collected through cookies and analytics (see section 6).</li>
      </ul>
      <p className={p}>
        We do <b>not</b> see or store your card, UPI PIN, net banking or wallet details. These are handled only by our
        payment partner. We receive only the payment status and a reference number.
      </p>

      <h2 className={h2}>3. Why we use your data</h2>
      <ul className={ul}>
        <li>To create your account and let you log in.</li>
        <li>To process payments and unlock the notes, quizzes and tests you bought.</li>
        <li>To save your quiz and test results and show your progress.</li>
        <li>To send service messages such as purchase confirmations and support replies.</li>
        <li>To keep the site secure, prevent fraud and sharing of paid material, and fix problems.</li>
        <li>To understand, in aggregate, which pages are useful so we can improve the site.</li>
        <li>To meet legal, tax and accounting obligations.</li>
      </ul>
      <p className={p}>
        We process your data on the basis of your consent and, where the law allows, for legitimate uses such as
        fulfilling a purchase you made or complying with the law. You can withdraw consent at any time (section 9).
      </p>

      <h2 className={h2}>4. Service providers who handle your data</h2>
      <p className={p}>
        We use trusted third parties to run the site. They process data only to provide their service to us.
      </p>
      <ul className={ul}>
        <li><b>Vercel Inc.</b> hosts the website and its server code.</li>
        <li><b>Supabase Inc.</b> provides our database, sign-in system (including the one-time email codes) and private file storage for purchased material.</li>
        <li><b>Cloudflare, Inc.</b> manages our domain name (DNS) and email forwarding.</li>
        <li><b>Google LLC</b> provides Google sign-in and Google Analytics.</li>
        <li><b>Razorpay Software Private Limited</b> processes payments. Payment details you enter go directly to Razorpay and are governed by its own privacy policy.</li>
      </ul>
      <p className={p}>
        We do not sell your personal data and we do not show third-party advertising on TopperShelf.
        We may disclose data if required by law, a court order or a government authority.
      </p>

      <h2 className={h2}>5. Where your data is stored</h2>
      <p className={p}>
        Some of these providers store or process data on servers outside India, including in Japan and the United
        States. We transfer data only to providers that apply appropriate security safeguards, and only to countries
        that the Government of India has not restricted.
      </p>

      <h2 className={h2}>6. Cookies and analytics</h2>
      <p className={p}>
        We use essential cookies to keep you signed in and to remember your cart, and Razorpay sets cookies of its own
        during payment. We also use Google Analytics to measure visits (pages visited, how you found the site, device
        type and approximate location, and which resources are viewed, added to a cart or bought). We do not send your
        name, email address or account details to Google, we have turned off Google&apos;s advertising features, and we
        do not use your data for advertising or sell it. For visitors in the European Economic Area, the United Kingdom
        and Switzerland, analytics cookies are switched off. You can block cookies in your browser settings or install
        Google&apos;s opt-out add-on.
      </p>

      <h2 className={h2}>7. Age and children</h2>
      <p className={p}>
        TopperShelf is meant for users who are 18 or older. If you are under 18, please ask a parent or guardian to
        sign in and buy on your behalf. By signing in, the account holder confirms that they are 18 or older, or that
        they are a parent or guardian using the account for their child, and they take responsibility for it.
      </p>
      <p className={p}>
        We do not knowingly collect personal data from children, and we do not track or behaviourally monitor children
        or show them targeted advertising. If we learn that an account was created by a child without a parent&apos;s
        or guardian&apos;s permission, we will delete it. A parent or guardian can write to {SUPPORT_EMAIL} to access,
        correct or delete a child&apos;s data.
      </p>

      <h2 className={h2}>8. How long we keep data</h2>
      <p className={p}>
        We keep your account and study data while your account is active. If you ask us to delete your account, we
        erase your personal data unless the law requires us to keep some of it. Purchase and payment records are kept
        for the period required by Indian tax and accounting law.
      </p>

      <h2 className={h2}>9. Your rights</h2>
      <p className={p}>Under the DPDP Act you have the right to:</p>
      <ul className={ul}>
        <li>get a summary of the personal data we hold and who we share it with;</li>
        <li>correct, complete or update your data;</li>
        <li>ask us to erase your data;</li>
        <li>withdraw your consent at any time, which will not affect work already done;</li>
        <li>nominate another person to exercise these rights if you die or become unable to do so;</li>
        <li>get your grievances resolved.</li>
      </ul>
      <p className={p}>
        To use any right, email {SUPPORT_EMAIL}. We will reply within a reasonable time and in any case within the
        time set by law.
      </p>

      <h2 className={h2}>10. Security</h2>
      <p className={p}>
        We use encrypted connections (HTTPS), access controls on our database, and private storage for paid files, which
        are shared only through short-lived secure links. No system is completely secure. If a breach affects your
        personal data, we will inform you and the Data Protection Board of India as the law requires.
      </p>

      <h2 className={h2}>11. Grievance officer</h2>
      <p className={p}>
        If you have a complaint about how we handle your data, write to our Grievance Officer:
      </p>
      <p className={p}>
        {GRIEVANCE_NAME}, {BUSINESS}, {ADDRESS}<br />
        Email: {GRIEVANCE_EMAIL}
      </p>
      <p className={p}>
        We aim to acknowledge complaints within 48 hours and resolve them within 30 days. If you are not satisfied, you
        may complain to the Data Protection Board of India.
      </p>

      <h2 className={h2}>12. Changes to this policy</h2>
      <p className={p}>
        We may update this policy from time to time. The effective date at the top shows the latest version. If a change
        is significant, we will notify you on the site or by email.
      </p>

      <h2 className={h2}>13. Contact us</h2>
      <p className={p}>
        Questions about this policy: {SUPPORT_EMAIL}
      </p>
    </div>
  );
}
