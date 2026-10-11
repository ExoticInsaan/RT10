import type { Metadata } from "next";
import cn from "@/lib/design/twStyles";
import LibraryClient from "@/components/LibraryClient";
import SavedItems from "@/components/cart/SavedItems";
import SectionLabel from "@/components/ui/SectionLabel";

export const metadata: Metadata = { title: "My Library" };

export default function LibraryPage() {
  return (
    <main className={`${cn("container")} py-12 max-[560px]:py-8`}>
      <SectionLabel variant="content">Your purchases</SectionLabel>
      <h1 className="font-display m-0 mb-8 text-[clamp(27px,3.2vw,40px)] font-normal leading-[1.12] text-navy">
        My Library
      </h1>
      <LibraryClient />
      <SavedItems />
    </main>
  );
}
