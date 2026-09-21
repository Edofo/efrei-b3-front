/* Quest 3 · The search bar
   Forbidden in positionOf and count: indexOf, includes, find, findIndex. */
import type { Title } from "./types.ts";

export function positionOf<T>(list: readonly T[], value: T): number {
  // TODO
}

export function count<T>(list: readonly T[], value: T): number {
  // TODO
}

function normalize(text: string): string {
  // TODO — the same transformation for the query and for the names
  return text;
}

export function searchTitles(titles: readonly Title[], query: string): Title[] {
  // TODO
}
