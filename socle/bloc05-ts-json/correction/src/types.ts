/* The domain types of NOLANFLIX. Provided: you import them, you do not edit them.

   They describe data/catalogue.json and data/profils.json exactly. Open the
   files next to this one: every optional field here is missing somewhere
   in the data, on purpose. */

export type TitleKind = "movie" | "series";

export interface Season {
  number: number;
  episodes: number;
}

export interface Credits {
  director?: string;
  cast?: string[];
}

export interface Title {
  id: string;
  title: string;
  kind: TitleKind;
  year: number;
  genres: string[];
  /** 0 to 5. Missing when nobody has rated the title yet. */
  rating?: number | null;
  /** 0 means "all ages". */
  minimumAge: number;
  /** One line shown under the poster (French, like the whole UI). */
  tagline: string;
  /** Minutes. Movies only. */
  runtime?: number;
  /** Series only. */
  seasons?: Season[];
  credits?: Credits;
  isNew: boolean;
  top10: boolean;
  /** ISO date, "2026-09-01". */
  addedOn: string;
  /** A data: URI. Long. Never put it in a card. */
  poster: string;
}

export interface Row {
  id: string;
  title: string;
  ids: string[];
}

export interface Catalogue {
  version: number;
  /** ISO date-time. */
  generatedAt: string;
  rows: Row[];
  titles: Title[];
}

export interface HistoryEntry {
  id: string;
  /** 0 (not started) to 1 (finished). */
  progress: number;
  /** ISO date-time. */
  watchedAt: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  age: number;
  favoriteGenres: string[];
  history: HistoryEntry[];
}

/** What the home page shows for one title: the view model (quest 4). */
export interface Card {
  id: string;
  title: string;
  url: string;
  subtitle: string;
  rating: number | null;
}

/** One entry of a profile's history, joined with the catalogue (quest 6). */
export interface HistoryView {
  title: string;
  /** Percent, integer. */
  progress: number;
  watchedAt: string;
}

/** The outcome of validating a whole list (quest 8). */
export interface ValidationReport {
  valid: number;
  errors: Record<string, string[]>;
}

/* Quest 9: JSON has no dates. Once imported with a reviver, the two date
   fields become real Date objects — and the type says so. `Omit` builds a
   type from another one, minus some keys. */
export type ImportedTitle = Omit<Title, "addedOn"> & { addedOn: Date };
export type ImportedCatalogue = Omit<Catalogue, "generatedAt" | "titles"> & {
  generatedAt: Date;
  titles: ImportedTitle[];
};

/* Quest 10: what the front end asks, what the back end answers. */
export type SortKey = "rating" | "title" | "year";

export interface SearchRequest {
  q?: string;
  genre?: string;
  kind?: TitleKind;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}

export interface SearchResponse {
  page: number;
  perPage: number;
  total: number;
  pages: number;
  results: Card[];
}
