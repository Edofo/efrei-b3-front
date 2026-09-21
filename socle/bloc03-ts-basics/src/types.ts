/* The domain types of NOLANFLIX. Provided: you import them, you do not edit them.

   Most fields are optional for real: some titles have no rating, no credits,
   no runtime. Your code has to live with that — the compiler will remind you. */

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
