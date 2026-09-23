/* Quest 7 · Do not touch the original — solution

   Two possible styles: structuredClone then mutate the copy, or
   map/filter/spread that only build what changes. Both are right; the
   second is the one you will find in React. */
import type { Catalogue, Title } from "./types.ts";

export function rate(catalogue: Readonly<Catalogue>, id: string, rating: number): Catalogue {
  return {
    ...catalogue,
    titles: catalogue.titles.map((t) => (t.id === id ? { ...t, rating } : t)),
  };
}

export function addTitle(catalogue: Readonly<Catalogue>, title: Title): Catalogue {
  return { ...catalogue, titles: [...catalogue.titles, title] };
}

export function removeTitle(catalogue: Readonly<Catalogue>, id: string): Catalogue {
  return {
    ...catalogue,
    titles: catalogue.titles.filter((t) => t.id !== id),
    rows: catalogue.rows.map((row) => ({ ...row, ids: row.ids.filter((x) => x !== id) })),
  };
}

// Challenge ⭐: the structuredClone style, for comparison.
export function renameGenre(catalogue: Readonly<Catalogue>, from: string, to: string): Catalogue {
  const copy = structuredClone(catalogue) as Catalogue; // the copy is not frozen
  for (const title of copy.titles) {
    title.genres = title.genres.map((genre) => (genre === from ? to : genre));
  }
  return copy;
}
