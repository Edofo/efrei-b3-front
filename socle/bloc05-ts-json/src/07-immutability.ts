/* Quest 7 · Do not touch the original
   Every function returns a NEW catalogue. The tests freeze the one you receive. */
import type { Catalogue, Title } from "./types.ts";

export function rate(catalogue: Readonly<Catalogue>, id: string, rating: number): Catalogue {
  // TODO
}

export function addTitle(catalogue: Readonly<Catalogue>, title: Title): Catalogue {
  // TODO
}

export function removeTitle(catalogue: Readonly<Catalogue>, id: string): Catalogue {
  // TODO
}

// Challenge ⭐: renameGenre(catalogue: Readonly<Catalogue>, from: string, to: string): Catalogue
