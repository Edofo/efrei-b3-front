/* Same file as src/types.ts: the solution is a drop-in replacement of src/. */

export interface Credits {
  director?: string;
  cast?: string[];
}

export interface Movie {
  title: string;
  year: number;
  /** 0 to 5. Missing or null when nobody has rated the title yet. */
  rating?: number | null;
  genres?: string[];
  /** 0 means "all ages". */
  minimumAge?: number;
  isNew?: boolean;
  top10?: boolean;
  /** Minutes. Movies only. */
  runtime?: number;
  /** Episodes per season. Series only. */
  seasons?: number[];
  credits?: Credits;
}

/** The two flags a card badge depends on. */
export type Flags = Pick<Movie, "isNew" | "top10">;
