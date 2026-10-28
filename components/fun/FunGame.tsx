"use client";

import type { ComponentType } from "react";
import ExcuseGenerator from "@/components/fun/games/ExcuseGenerator";
import RoastTimetable from "@/components/fun/games/RoastTimetable";
import VibeCheck from "@/components/fun/games/VibeCheck";
import DecisionWheel from "@/components/fun/games/DecisionWheel";
import WouldYouRather from "@/components/fun/games/WouldYouRather";
import GrowSapling from "@/components/fun/games/GrowSapling";
import FriendshipScore from "@/components/fun/games/FriendshipScore";
import WhatAmI from "@/components/fun/games/WhatAmI";
import KnowMe from "@/components/fun/games/KnowMe";
import HowCooked from "@/components/fun/games/HowCooked";

/** Fun Zone games built as full interactive screens, keyed by their tool id in `lib/tools/registry.ts`. */
export const funGames: Record<string, ComponentType> = {
  "how-cooked": HowCooked,
  "excuse-generator": ExcuseGenerator,
  "roast-my-timetable": RoastTimetable,
  "vibe-check": VibeCheck,
  "decision-wheel": DecisionWheel,
  "would-you-rather": WouldYouRather,
  "grow-a-sapling": GrowSapling,
  "friendship-score": FriendshipScore,
  "what-am-i-to-you": WhatAmI,
  "how-well-do-you-know-me": KnowMe,
};

export function hasFunGame(id: string) {
  return id in funGames;
}

export default function FunGame({ id }: { id: string }) {
  const Game = funGames[id];
  return Game ? <Game /> : null;
}
