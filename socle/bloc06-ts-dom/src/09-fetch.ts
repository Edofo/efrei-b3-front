/* Quest 9 · Fetching the data */
import type { Catalogue } from "./types.ts";

export async function loadCatalogue(url: string): Promise<Catalogue> {
  // TODO
}

export async function showState<T>(
  el: HTMLElement,
  promise: Promise<T>,
  render: (value: T) => string,
): Promise<void> {
  // TODO
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  // TODO
}
