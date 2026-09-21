/* Quest 2 · On disk */
import { readFileSync, writeFileSync } from "node:fs";
import type { Title } from "./types.ts";

export function readJsonFile(filePath: string): unknown {
  // TODO
}

export function writeJsonFile(filePath: string, data: unknown): void {
  // TODO
}

export function loadCatalogue(): Title[] {
  // TODO — new URL("../data/catalogue.json", import.meta.url)
}

// Challenge ⭐: loadCatalogueAsync(): Promise<Title[]> with node:fs/promises
