/* Quest 2 · On disk — solution */
import { readFileSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import type { Catalogue, Title } from "./types.ts";

export function readJsonFile(filePath: string): unknown {
  let text: string;
  try {
    text = readFileSync(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`File not found: ${filePath}`, { cause: error });
    }
    throw error; // another problem (permissions, a folder…): do not hide it
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    // `cause` keeps the original error attached: the message is ours, the details stay.
    throw new Error(`Invalid JSON: ${filePath}`, { cause: error });
  }
}

export function writeJsonFile(filePath: string, data: unknown): void {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

// Relative to THIS file, not to the current folder. The tests check it by
// looking for import.meta.url in the source.
const CATALOGUE_URL = new URL("../../../data/catalogue.json", import.meta.url);

export function loadCatalogue(): Title[] {
  const url = CATALOGUE_URL; // import.meta.url, see above
  return (readJsonFile(url.pathname) as Catalogue).titles;
}

// Challenge ⭐: the same thing without blocking the program while reading.
export async function loadCatalogueAsync(): Promise<Title[]> {
  const text = await readFile(CATALOGUE_URL, "utf8");
  return (JSON.parse(text) as Catalogue).titles;
}
