/* Quest 9 · The second argument */
import type { ImportedCatalogue, Profile, Title } from "./types.ts";

export function exportFields(titles: Title[], fields: (keyof Title)[]): string {
  // TODO
}

export function importCatalogue(text: string): ImportedCatalogue {
  // TODO
}

export function anonymize(profile: Profile): string {
  // TODO
}

// Challenge ⭐: toNdjson(items: unknown[]): string and fromNdjson(text: string): unknown[]
