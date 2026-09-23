/* Quest 4 · The view model — solution */
import type { Card, Catalogue, Title } from "./types.ts";

function kindLabel(title: Title): string {
  return title.kind === "movie" ? "Film" : "Série";
}

function formatLabel(title: Title): string {
  if (title.kind === "movie") return `${title.runtime ?? 0} min`;
  const count = title.seasons?.length ?? 0;
  return `${count} saison${count > 1 ? "s" : ""}`;
}

export function toCard(title: Title): Card {
  return {
    id: title.id,
    title: title.title,
    url: `/titres/${title.id}`,
    subtitle: `${title.year} · ${kindLabel(title)} · ${formatLabel(title)}`,
    rating: title.rating ?? null,
  };
}

export function toCards(catalogue: Catalogue): Card[] {
  return catalogue.titles.map(toCard);
}

const isTitle = (candidate: Title | undefined): candidate is Title => candidate !== undefined;

export function rowCards(catalogue: Catalogue, rowId: string): Card[] {
  const row = catalogue.rows.find((r) => r.id === rowId);
  if (!row) return [];
  return row.ids
    .map((id) => catalogue.titles.find((t) => t.id === id))
    .filter(isTitle)
    .map(toCard);
}

// Challenge ⭐: a header line, then one line per title. The separator is
// ";" because French Excel expects it, and "," would appear in titles.
export function toCsv(titles: Title[]): string {
  const lines = titles.map((t) => [t.id, t.title, t.year, t.rating ?? ""].join(";"));
  return ["id;title;year;rating", ...lines].join("\n");
}
