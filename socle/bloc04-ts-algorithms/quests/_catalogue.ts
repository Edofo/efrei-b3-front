/* The test catalogue, shared by several quests. Every quest receives a
   fresh copy: mutating a title in one test does not affect the next. */
import type { Title } from "../src/types.ts";

const TITLES: readonly Title[] = [
  {
    id: "elite",
    title: "Élite",
    kind: "series",
    year: 2018,
    genres: ["drame", "thriller"],
    rating: 3.8,
    minimumAge: 16,
  },
  {
    id: "matrix",
    title: "The Matrix",
    kind: "movie",
    year: 1999,
    genres: ["science-fiction", "action"],
    rating: 4.7,
    minimumAge: 12,
    runtime: 136,
  },
  {
    id: "amelie",
    title: "Amélie",
    kind: "movie",
    year: 2001,
    genres: ["comédie", "romance"],
    rating: 4.2,
    minimumAge: 0,
    runtime: 122,
  },
  {
    id: "dark",
    title: "Dark",
    kind: "series",
    year: 2017,
    genres: ["drame", "science-fiction", "thriller"],
    rating: 4.5,
    minimumAge: 16,
  },
  {
    id: "casa",
    title: "La Casa de Papel",
    kind: "series",
    year: 2017,
    genres: ["action", "thriller"],
    rating: 4.0,
    minimumAge: 16,
  },
  {
    id: "arcane",
    title: "Arcane",
    kind: "series",
    year: 2021,
    genres: ["animation", "action", "drame"],
    rating: 4.8,
    minimumAge: 12,
  },
  {
    id: "chef",
    title: "Chef's Table",
    kind: "series",
    year: 2015,
    genres: ["documentaire"],
    rating: 3.9,
    minimumAge: 0,
  },
  {
    id: "sense8",
    title: "Sense8",
    kind: "series",
    year: 2015,
    genres: ["science-fiction", "drame"],
    rating: 4.1,
    minimumAge: 16,
  },
  {
    id: "squad",
    title: "Elite Squad",
    kind: "movie",
    year: 2007,
    genres: ["action", "thriller"],
    rating: 3.7,
    minimumAge: 18,
    runtime: 115,
  },
  {
    id: "ozark",
    title: "Ozark",
    kind: "series",
    year: 2017,
    genres: ["drame", "thriller"],
    rating: 4.3,
    minimumAge: 18,
  },
  {
    id: "stranger",
    title: "Stranger Things",
    kind: "series",
    year: 2016,
    genres: ["science-fiction", "horreur"],
    rating: 4.4,
    minimumAge: 12,
  },
  {
    id: "narcos",
    title: "Narcos",
    kind: "series",
    year: 2015,
    genres: ["drame", "thriller"],
    rating: 4.3,
    minimumAge: 18,
  },
];

export function catalogue(): Title[] {
  return structuredClone(TITLES) as Title[];
}

export function title(id: string): Title {
  const found = TITLES.find((t) => t.id === id);
  if (!found) throw new Error(`unknown test title: ${id}`);
  return structuredClone(found);
}
