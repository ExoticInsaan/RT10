import type { Metadata } from "next";
import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import SectionLabel from "@/components/ui/SectionLabel";

export const metadata: Metadata = { title: "Study smarter" };

export default function StudySmarterPage() {
  return (
    <main className={cn("container editorial-page")}>
      {/* Photo is hot-linked from Unsplash, as in the design file. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={cn("editorial-photo")}
        src="https://images.unsplash.com/photo-1763098844932-7240ee8ff180?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200"
        alt="Study desk with books in natural light"
      />
      <div>
        <SectionLabel variant="hero">Toppershelf student guide</SectionLabel>
        <h1>Study smarter, not longer.</h1>
        <p>
          Simple, evidence-informed strategies to help nursing students revise with confidence.
        </p>
        <Button href="/browse">
          Explore nursing notes <Icon name="arrow" />
        </Button>
      </div>
    </main>
  );
}
