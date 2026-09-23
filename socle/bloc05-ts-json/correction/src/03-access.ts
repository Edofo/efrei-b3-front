/* Quest 3 · Walking the data — solution */
import type { Catalogue, Season, Title } from "./types.ts";

export function titleNameOf(catalogue: Catalogue, id: string): string | undefined {
  return catalogue.titles.find((t) => t.id === id)?.title;
}

export function episodeCount(title: Title): number {
  return (title.seasons ?? []).reduce((total, season) => total + season.episodes, 0);
}

export function directorOf(title: Title): string {
  return title.credits?.director ?? "Inconnu";
}

export function leadCast(title: Title): string[] {
  return (title.credits?.cast ?? []).slice(0, 2);
}

export function formatLabel(title: Title): string {
  if (title.kind === "movie") return `${title.runtime ?? 0} min`;
  const count = title.seasons?.length ?? 0;
  return `${count} saison${count > 1 ? "s" : ""}`;
}

// Challenge ⭐: .at(-1) reads the last one; undefined when the array is empty.
export function lastSeason(title: Title): Season | null {
  return title.seasons?.at(-1) ?? null;
}
