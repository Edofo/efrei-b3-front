/* The domain types of NOLANFLIX. Provided: you import them, you do not edit them. */

export type TitleKind = "movie" | "series";

export interface Title {
  id: string;
  title: string;
  kind: TitleKind;
  year: number;
  genres: string[];
  /** 0 to 5. Missing or null when nobody has rated the title yet. */
  rating?: number | null;
  /** 0 means "all ages". */
  minimumAge: number;
  /** Minutes. Movies only. */
  runtime?: number;
}

/** What a viewer likes and has already watched (ids of titles). */
export interface Profile {
  favoriteGenres: string[];
  watched: string[];
}

/** A node of the collection tree (quest 9): a leaf has episodes, a branch has children. */
export interface CollectionNode {
  title: string;
  episodes?: number;
  children?: CollectionNode[];
}
