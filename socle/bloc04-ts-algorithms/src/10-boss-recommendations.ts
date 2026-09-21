/* Quest 10 · BOSS · The recommendation engine
   Your bricks from the previous quests are imported here. */
import type { Profile, Title } from "./types.ts";
import { intersection } from "./05-duplicates.ts";

export function score(title: Title, profile: Profile): number {
  // TODO
}

export function recommend(titles: readonly Title[], profile: Profile, n = 3): Title[] {
  // TODO
}

// Challenge ⭐: explain(title: Title, profile: Profile): string
