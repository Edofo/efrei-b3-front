/* Quest 6 · The ranking
   Never sort() the received array: copy first. `readonly` makes sure of it. */
import type { Title } from "./types.ts";

export function sortByRating(titles: readonly Title[]): Title[] {
  // TODO
}

export function sortByTitle(titles: readonly Title[]): Title[] {
  // TODO
}

export function topTitles(titles: readonly Title[], n: number): string[] {
  // TODO
}

// Challenge ⭐: sortBy<T>(items: readonly T[], key: keyof T, order: "asc" | "desc" = "asc"): T[]
