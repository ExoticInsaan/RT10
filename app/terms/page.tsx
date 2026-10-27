import type { Metadata } from "next";
import Link from "next/link";
import { ADDRESS, BUSINESS, GRIEVANCE_NAME, H2, LEGAL_EFFECTIVE, LegalPage, P, SUPPORT_EMAIL, UL } from "@/components/shell/Legal";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The rules for using TopperShelf's free online tools.",
  alternates: { canonical: "/terms" },
};

const COURTS = "Bharatpur, Rajasthan";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" effective={LEGAL_EFFECTIVE}>
      <P>
        These Terms of Use (&quot;Terms&quot;) are an agreement between you and {BUSINESS} (&quot;TopperShelf&quot;,
        &quot;we&quot;, &quot;us&quot;), {ADDRESS}. They apply to your use of toppershelf.online (the &quot;Site&quot;) and its
        tools. Please read them with our <Link href="/privacy" className="underline">Privacy Policy</Link>. If you do not agree,
        please do not use the Site.
      </P>

      <H2>1. What TopperShelf offers</H2>
      <P>
        TopperShelf is a free website of online tools: PDF and image tools, calculators, text utilities, India-specific tools,
        student tools and a Fun Zone of light-hearted tools (together, the &quot;Tools&quot;). We may add, change or remove Tools
        at any time. The Tools are free. We do not charge for them, and there is nothing to buy or refund.
      </P>

      <H2>2. Your account</H2>
      <UL>
        <li>You can open and read any tool page without an account. You sign in with Google to run a Tool.</li>
        <li>Please give correct information and keep your Google account secure. You are responsible for what is done through your sign-in.</li>
        <li>If you are under 18, please use the Site with a parent or guardian&apos;s consent.</li>
        <li>You can ask us to delete your account at any time (see the Privacy Policy).</li>
      </UL>

      <H2>3. Using the Tools</H2>
      <P>You agree not to:</P>
      <UL>
        <li>use the Site for anything illegal, or to process files you have no right to use;</li>
        <li>try to break, overload, scrape in bulk or reverse-engineer the Site, or get around the sign-in;</li>
        <li>upload or create content that is unlawful, hateful, harassing or that targets real people or groups;</li>
        <li>use the Tools to forge documents, or to hide or change official records for a fraudulent purpose (for example, altering a certificate or ID photo to deceive); or</li>
        <li>pretend to be someone else or misuse another person&apos;s details.</li>
      </UL>
      <P>We may limit or block access if the Site is being misused.</P>

      <H2>4. Your files and your content</H2>
      <P>
        You keep all rights to your files and to anything you type into a Tool. Where a Tool works in your browser, your files
        stay on your device (see section 3 of the Privacy Policy). You are responsible for keeping a copy of your originals. Always
        check the result before you rely on it or send it to someone.
      </P>

      <H2>5. Results are for information only</H2>
      <UL>
        <li><b>Calculators</b> (EMI, GST, age and date, CGPA, attendance and others) give estimates based on what you enter. Banks, tax authorities and universities may use different rules or rounding, so please confirm important figures with the official source.</li>
        <li><b>Student and health-related tools</b> (for example IV drip rate and BMI) are learning aids. They are not medical advice and must not be used to make clinical decisions. Always follow your institution&apos;s protocols and a qualified professional&apos;s judgement.</li>
        <li><b>Photo and document tools</b> (such as compress to an exact size, or passport-size photos) help you meet a size or format. We cannot promise that any office, exam portal or website will accept the result.</li>
        <li><b>Fun Zone tools</b> are entertainment. Scores, roasts and excuses are made up for fun and are not about you or anyone in real life.</li>
      </UL>

      <H2>6. Our content and your sharing</H2>
      <P>
        The TopperShelf name, logo, design, code and written content belong to us or our licensors. You may not copy them to build a
        competing service. You can share your Fun Zone results and share cards freely; they carry the TopperShelf name, which
        you should leave in place. Please do not share a result that contains someone else&apos;s private details.
      </P>

      <H2>7. Availability</H2>
      <P>
        We work to keep the Site fast and available, but we do not promise it will always be free of errors, interruptions or
        downtime. Tools are provided &quot;as is&quot; and &quot;as available&quot;.
      </P>

      <H2>8. Limit of liability</H2>
      <P>
        To the fullest extent the law allows, we are not responsible for any indirect or consequential loss, or for loss of data,
        files, income or opportunity, that comes from using the Site or relying on a Tool&apos;s result. Because the Tools are
        free, our total liability to you for any claim is limited to the amount you paid us, which is zero. Nothing in these Terms
        limits a right you have under law that cannot be limited.
      </P>

      <H2>9. Third-party services</H2>
      <P>
        The Site relies on Vercel (hosting), Supabase (database and sign-in), Cloudflare (domain) and Google (sign-in and
        analytics). Their own terms apply to the parts they provide. Links to other websites are for your convenience and we do
        not control them.
      </P>

      <H2>10. Changes and ending access</H2>
      <P>
        We may update these Terms as the Site grows. The effective date above shows the latest version, and using the Site after a
        change means you accept it. You can stop using the Site at any time. We may suspend or end access for anyone who breaks
        these Terms.
      </P>

      <H2>11. Governing law</H2>
      <P>
        These Terms are governed by the laws of India. Courts at {COURTS} have jurisdiction over any dispute, subject to any right
        you have under law to go to a different court.
      </P>

      <H2>12. Contact and grievances</H2>
      <P>
        Questions or complaints? Write to {GRIEVANCE_NAME} at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a>. More ways to reach us are on the{" "}
        <Link href="/contact" className="underline">Contact page</Link>.
      </P>
    </LegalPage>
  );
}
