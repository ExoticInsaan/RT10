import Link from "next/link";
import cn from "@/lib/design/twStyles";
import Brand from "@/components/ui/Brand";

export default function Footer() {
  return (
    <footer className={cn("site-footer")}>
      <div className={cn("container footer-main")}>
        <div className={cn("footer-brand")}>
          <Brand />
          <strong>Your Nursing Journey, One Shelf at a Time.</strong>
          <p>
            Notes, quizzes and mock tests for GNM, BSc Nursing and Post Basic students, organized
            for focused study and revision.
          </p>
        </div>
        <nav aria-label="Footer explore links">
          <strong>Explore</strong>
          <Link href="/">Home</Link>
          <Link href="/about">About Us</Link>
          <Link href="/browse">All Resources</Link>
          <Link href="/library">My Library</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <nav aria-label="Footer legal links">
          <strong>Policies</strong>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms &amp; Conditions</Link>
          <Link href="/refund">Refund Policy</Link>
        </nav>
        <div className={cn("footer-statement")}>
          <p>
            Study smarter.
            <br />
            Build confidence.
            <br />
            <em>Reach your goals.</em>
          </p>
        </div>
      </div>
      <div className={cn("container footer-bottom")}>
        <span>© 2026 Toppershelf. All rights reserved.</span>
      </div>
    </footer>
  );
}
