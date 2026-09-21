/* The test data, read once from data/. Every quest receives a fresh copy:
   mutating a title in one test does not affect the next. */
import { readFileSync } from "node:fs";
import type { Catalogue, Profile, Title } from "../src/types.ts";

const CATALOGUE = JSON.parse(
  readFileSync(new URL("../data/catalogue.json", import.meta.url), "utf8"),
) as Catalogue;
const PROFILES = JSON.parse(
  readFileSync(new URL("../data/profiles.json", import.meta.url), "utf8"),
) as Profile[];

export function catalogue(): Catalogue {
  return structuredClone(CATALOGUE);
}

export function titles(): Title[] {
  return structuredClone(CATALOGUE.titles);
}

export function title(id: string): Title {
  const found = CATALOGUE.titles.find((t) => t.id === id);
  if (!found) throw new Error(`unknown test title: ${id}`);
  return structuredClone(found);
}

export function profile(id: string): Profile {
  const found = PROFILES.find((p) => p.id === id);
  if (!found) throw new Error(`unknown test profile: ${id}`);
  return structuredClone(found);
}

/** Freezes an object deeply: any write throws a TypeError. */
export function freeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freeze(child);
  }
  return value;
}
