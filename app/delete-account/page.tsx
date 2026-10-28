import type { Metadata } from "next";
import Link from "next/link";
import { H2, LEGAL_EFFECTIVE, LegalPage, P, SUPPORT_EMAIL, UL } from "@/components/shell/Legal";

export const metadata: Metadata = {
  title: "Delete your TopperShelf account",
  description: "How to delete your TopperShelf account and the data saved with it, in the app or by email.",
  alternates: { canonical: "/delete-account" },
};

export default function DeleteAccountPage() {
  return (
    <LegalPage title="Delete your account" effective={LEGAL_EFFECTIVE}>
      <P>You can delete your TopperShelf account and the data saved with it at any time.</P>

      <H2>In the TopperShelf app</H2>
      <UL>
        <li>Open the app and sign in.</li>
        <li>On the Home screen, tap the account icon to open Settings.</li>
        <li>Tap <b>Delete my account</b> and confirm.</li>
      </UL>
      <P>Your account is deleted straight away.</P>

      <H2>By email</H2>
      <P>
        Write to <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a> from the email address you signed
        in with and ask us to delete your account. We delete it within 30 days.
      </P>

      <H2>What is deleted</H2>
      <UL>
        <li>Your sign-in (name and email from Google).</li>
        <li>Your favourites, recent tools, flashcards, reminders, countdowns and Grow a Sapling garden.</li>
        <li>The friend-game links you made and the answers sent through them.</li>
      </UL>
      <P>
        We keep nothing else about you, except records we must keep by law. Read the full{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </P>
    </LegalPage>
  );
}
