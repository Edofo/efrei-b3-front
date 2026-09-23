/* Quest 6 · The join — solution */
import type { Catalogue, HistoryEntry, HistoryView, Profile, Title } from "./types.ts";

interface Joined {
  entry: HistoryEntry;
  title: Title;
}

function join(profile: Profile, catalogue: Catalogue): Joined[] {
  // An index rather than one find per entry: a single pass over the catalogue.
  const byId = new Map(catalogue.titles.map((t) => [t.id, t]));
  return profile.history
    .flatMap((entry) => {
      const title = byId.get(entry.id);
      return title ? [{ entry, title }] : []; // orphans are dropped
    })
    .sort((a, b) => b.entry.watchedAt.localeCompare(a.entry.watchedAt)); // ISO 8601 sorts as text
}

export function history(profile: Profile, catalogue: Catalogue): HistoryView[] {
  return join(profile, catalogue).map(({ entry, title }) => ({
    title: title.title,
    progress: Math.round(entry.progress * 100),
    watchedAt: entry.watchedAt,
  }));
}

export function continueWatching(profile: Profile, catalogue: Catalogue): string[] {
  return join(profile, catalogue)
    .filter(({ entry }) => entry.progress > 0 && entry.progress < 1)
    .map(({ title }) => title.title);
}

export function hasWatched(profile: Profile, id: string): boolean {
  return profile.history.some((entry) => entry.id === id && entry.progress === 1);
}

// Challenge ⭐: the anti-join — what is in the catalogue and NOT in the history.
export function unseenNewTitles(profile: Profile, catalogue: Catalogue): string[] {
  const seen = new Set(profile.history.map((entry) => entry.id));
  return catalogue.titles.filter((t) => t.isNew && !seen.has(t.id)).map((t) => t.title);
}
