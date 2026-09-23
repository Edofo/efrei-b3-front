/* Quest 10 · BOSS · The catalogue API — solution */
import type { Catalogue, SearchRequest, SearchResponse, SortKey, Title } from "./types.ts";
import { toCard } from "./04-transform.ts";

const DEFAULT_PER_PAGE = 5;
const UNRATED = -1;

// Challenge ⭐: the normalization strips accents — the same as bloc 4.
function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

type Comparator = (a: Title, b: Title) => number;

const byTitle: Comparator = (a, b) => a.title.localeCompare(b.title);

const COMPARATORS: Record<SortKey, Comparator> = {
  rating: (a, b) => (b.rating ?? UNRATED) - (a.rating ?? UNRATED) || byTitle(a, b),
  title: byTitle,
  year: (a, b) => a.year - b.year || byTitle(a, b),
};

export function respond(
  catalogue: Readonly<Catalogue>,
  request: SearchRequest = {},
): SearchResponse {
  const { q, genre, kind, sort = "rating", page = 1, perPage = DEFAULT_PER_PAGE } = request;

  let titles: readonly Title[] = catalogue.titles;
  if (q) {
    const target = normalize(q);
    titles = titles.filter((t) => normalize(t.title).includes(target));
  }
  if (genre) titles = titles.filter((t) => t.genres.includes(genre));
  if (kind) titles = titles.filter((t) => t.kind === kind);

  // filter already returned a new array; without any filter, copy before sorting.
  const sorted = [...titles].sort(COMPARATORS[sort]);

  const total = sorted.length;
  const start = (page - 1) * perPage;
  return {
    page,
    perPage,
    total,
    pages: Math.ceil(total / perPage),
    results: sorted.slice(start, start + perPage).map(toCard),
  };
}
