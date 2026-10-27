import type { Metadata } from "next";
import Link from "next/link";
import { ADDRESS, BUSINESS, GRIEVANCE_NAME, H2, LEGAL_EFFECTIVE, LegalPage, P, SUPPORT_EMAIL, UL } from "@/components/shell/Legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How TopperShelf handles your data: what we collect, why, and what stays on your own device.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" effective={LEGAL_EFFECTIVE}>
      <P>
        This policy explains how {BUSINESS} (&quot;TopperShelf&quot;, &quot;we&quot;, &quot;us&quot;) collects, uses and protects
        personal data when you use toppershelf.online (the &quot;Site&quot;). We follow the Digital Personal Data Protection Act,
        2023 (DPDP Act), the Information Technology Act, 2000 and the rules made under them. You can open and read any tool page
        without an account. You sign in once with Google to run a tool. By signing in you agree to this policy.
      </P>

      <H2>1. Who we are</H2>
      <P>
        {BUSINESS}, {ADDRESS}. We are the Data Fiduciary for the personal data described below. Contact:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a>.
      </P>

      <H2>2. Data we collect</H2>
      <UL>
        <li><b>Sign-in data:</b> when you continue with Google, your name and email address as shared by Google. We keep it to a minimum: a name and an email.</li>
        <li><b>Your saved tools:</b> favourite tools and recently used tools. Today these are stored in your own browser. When we move them to your account, they will be stored against your sign-in.</li>
        <li><b>Fun Zone text:</b> a name or a few words you type into a Fun Zone tool can become part of the share link you create, so that the link can rebuild your result. Do not type anything you would not want in a link you share.</li>
        <li><b>Technical and usage data:</b> device, browser, approximate location from IP address and pages visited, collected through cookies and analytics (see section 6), including which tools are opened and run.</li>
        <li><b>Messages you send us:</b> anything you write in an email to us, such as feedback or a tool request.</li>
      </UL>

      <H2>3. Your files</H2>
      <P>
        Our photo, signature, PDF and other file tools are built to work inside your browser, so your files are processed on your own
        device. A tool shows the line &quot;Your files never leave your device&quot; only when that is true for that tool. If a
        tool ever needs to send a file to a server, it will say so on that tool&apos;s page before you use it. We do not read,
        keep or sell the files you work on.
      </P>

      <H2>4. Why we use your data</H2>
      <UL>
        <li>To create your account and keep you signed in.</li>
        <li>To run the tools and remember your favourites and recent tools.</li>
        <li>To reply to your emails and tool requests.</li>
        <li>To keep the Site secure, prevent abuse and fix problems.</li>
        <li>To understand, in aggregate, which tools are useful so we can decide what to build next.</li>
        <li>To meet legal obligations.</li>
      </UL>
      <P>
        We process your data on the basis of your consent and, where the law allows, for legitimate uses such as running the
        Site safely or complying with the law. You can withdraw consent at any time (section 9). We do not sell your personal
        data.
      </P>

      <H2>5. Service providers who handle your data</H2>
      <P>We use trusted third parties to run the Site. They process data only to provide their service to us.</P>
      <UL>
        <li><b>Vercel Inc.</b> hosts the website and its server code.</li>
        <li><b>Supabase Inc.</b> provides our database and sign-in system.</li>
        <li><b>Cloudflare, Inc.</b> manages our domain name (DNS) and email forwarding.</li>
        <li><b>Google LLC</b> provides Google sign-in and Google Analytics.</li>
      </UL>
      <P>
        Some of these providers store data on servers outside India. We choose providers that protect data with appropriate
        security measures.
      </P>

      <H2>6. Cookies and analytics</H2>
      <P>
        We use essential cookies and similar storage to keep you signed in and to remember your favourites and
        recent tools. We also use Google Analytics 4 to measure visits (pages visited, how you found the Site, device type).
        Google&apos;s advertising features are switched off, and we do not send your name, email or account ID to Google. For
        visitors in the EEA, the UK and Switzerland, analytics storage is off by default. We do not currently show ads. If we add
        ads or remarketing in future, we will add a consent banner first and update this policy.
      </P>

      <H2>7. How long we keep data</H2>
      <P>
        We keep your account data while your account is active. If you ask us to delete your account, we delete your personal data
        within 30 days, except what we must keep by law. Analytics data is kept by Google for the period we set in Google
        Analytics.
      </P>

      <H2>8. Security</H2>
      <P>
        We use HTTPS, access controls on our database and security headers on the Site. No system is perfectly secure, so we cannot
        promise absolute security. If a data breach affects you, we will inform you and the authorities as the law requires.
      </P>

      <H2>9. Your rights</H2>
      <P>Under the DPDP Act you can ask us to:</P>
      <UL>
        <li>show you the personal data we hold about you;</li>
        <li>correct or update it;</li>
        <li>delete it and close your account;</li>
        <li>withdraw your consent; and</li>
        <li>nominate someone to exercise these rights for you.</li>
      </UL>
      <P>
        Write to <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a> from the email address you signed
        in with. You can also file a complaint with the Data Protection Board of India.
      </P>

      <H2>10. Children</H2>
      <P>
        TopperShelf is meant for everyone, including students. If you are under 18, please use the Site with the consent of a
        parent or guardian. We do not knowingly collect more than a name and email from anyone, and we do not track or advertise
        to children. If you think a child has signed up without permission, write to us and we will delete the account.
      </P>

      <H2>11. Changes to this policy</H2>
      <P>
        We may update this policy as the Site grows (for example, when we add accounts-based favourites or ads). The effective
        date above shows the latest version. If a change is significant, we will tell signed-in users by a notice on the Site.
      </P>

      <H2>12. Grievance Officer</H2>
      <P>
        For complaints about how we handle your data, write to {GRIEVANCE_NAME} at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a>. We acknowledge complaints within 48
        hours and aim to resolve them within 30 days. See also our <Link href="/terms" className="underline">Terms of Use</Link>{" "}
        and <Link href="/contact" className="underline">Contact page</Link>.
      </P>
    </LegalPage>
  );
}
