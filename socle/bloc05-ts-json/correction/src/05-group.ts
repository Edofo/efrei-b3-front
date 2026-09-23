/* Quest 5 · Sorting by shelf — solution */
import type { Title } from "./types.ts";

export function byGenre(titles: Title[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const title of titles) {
    for (const genre of title.genres) {
      (groups[genre] ??= []).push(title.id);
    }
  }
  return groups;
}

export function byDecade(titles: Title[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const title of titles) {
    const decade = Math.floor(title.year / 10) * 10; // 2017 → 2010
    (groups[decade] ??= []).push(title.id);
  }
  return groups;
}

export function countByKind(titles: Title[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const title of titles) {
    counts[title.kind] = (counts[title.kind] ?? 0) + 1;
  }
  return counts;
}

// Challenge ⭐: Object.fromEntries turns [[key, value], …] into an object.
export function indexById(titles: Title[]): Record<string, Title> {
  return Object.fromEntries(titles.map((t) => [t.id, t]));
}
