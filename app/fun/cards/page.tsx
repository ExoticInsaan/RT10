import type { Metadata } from "next";
import CardCooked from "@/components/fun/cards/CardCooked";
import CardExcuse from "@/components/fun/cards/CardExcuse";
import CardFriend from "@/components/fun/cards/CardFriend";
import CardKnowMe from "@/components/fun/cards/CardKnowMe";
import CardRoast from "@/components/fun/cards/CardRoast";
import CardSapling from "@/components/fun/cards/CardSapling";
import CardVibe from "@/components/fun/cards/CardVibe";
import CardWhatAmI from "@/components/fun/cards/CardWhatAmI";

export const metadata: Metadata = {
  title: "Fun Zone story cards (preview)",
  alternates: { canonical: "/fun/cards" },
  // Design preview of the 9:16 share cards, not a page to rank.
  robots: { index: false, follow: false },
};

const cards = [
  ["How Cooked Are You?", CardCooked],
  ["Instant Vibe Check", CardVibe],
  ["Friendship Score", CardFriend],
  ["How Well Do You Know Me?", CardKnowMe],
  ["Roast My Timetable", CardRoast],
  ["What Am I to You?", CardWhatAmI],
  ["Grow a Sapling", CardSapling],
  ["Excuse Generator", CardExcuse],
] as const;

export default function CardsPreview() {
  return (
    <div className="fun-field px-4 py-8 sm:px-6 lg:py-14">
      <h1 className="mx-auto mb-8 max-w-6xl font-display text-3xl text-white sm:text-4xl">
        Story cards
      </h1>
      <ul className="mx-auto grid max-w-6xl list-none grid-cols-1 gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([name, Card]) => (
          <li key={name} className="min-w-0">
            <div className="mx-auto max-w-[300px] overflow-hidden rounded-[22px] shadow-[0_24px_50px_-20px_rgba(0,0,0,.5)]">
              <Card />
            </div>
            <p className="mt-3 text-center text-sm font-bold text-white">
              {name}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
