"use client";

import FriendshipScore from "@/components/fun/games/FriendshipScore";
import KnowMe from "@/components/fun/games/KnowMe";
import WhatAmI from "@/components/fun/games/WhatAmI";
import GardenBuddy from "@/components/fun/GardenBuddy";
import type { FriendGame } from "@/lib/fun/friends";

/** The page a friend lands on from a shared link. No sign-in: the friend plays their side of the game. */
export default function FriendRoom({ game, code }: { game: FriendGame; code: string }) {
  switch (game) {
    case "friendship-score":
      return <FriendshipScore friendCode={code} />;
    case "what-am-i-to-you":
      return <WhatAmI friendCode={code} />;
    case "how-well-do-you-know-me":
      return <KnowMe friendCode={code} />;
    case "grow-a-sapling":
      return <GardenBuddy code={code} />;
  }
}
