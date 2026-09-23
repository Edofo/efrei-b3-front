/* Quest 9 · The second argument — solution */
import type { ImportedCatalogue, Profile, Title } from "./types.ts";

const DATE_KEYS = new Set(["addedOn", "generatedAt"]);

export function exportFields(titles: Title[], fields: (keyof Title)[]): string {
  // An array as replacer: only those keys are written, at every level.
  return JSON.stringify(titles, fields, 2);
}

export function importCatalogue(text: string): ImportedCatalogue {
  return JSON.parse(text, (key: string, value: unknown) =>
    DATE_KEYS.has(key) && typeof value === "string" ? new Date(value) : value,
  ) as ImportedCatalogue;
}

export function anonymize(profile: Profile): string {
  return JSON.stringify(
    profile,
    (key: string, value: unknown) => {
      if (key === "age") return undefined; // returning undefined removes the property
      if (key === "email") return "***";
      return value;
    },
    2,
  );
}

// Challenge ⭐: NDJSON — Newline Delimited JSON, the format of logs and
// large exports: each line can be read on its own, without loading the rest.
export function toNdjson(items: unknown[]): string {
  return items.map((item) => JSON.stringify(item)).join("\n");
}

export function fromNdjson(text: string): unknown[] {
  return text
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line): unknown => JSON.parse(line));
}
