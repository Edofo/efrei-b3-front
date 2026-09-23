/* Quest 9 · Fetching the data — solution */
import type { Catalogue } from "./types.ts";

const MAX_ATTEMPTS = 2;

export async function loadCatalogue(url: string, attempt = 1): Promise<Catalogue> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    // Challenge ⭐: fetch only rejects on a network failure → one more try.
    if (attempt < MAX_ATTEMPTS) return loadCatalogue(url, attempt + 1);
    throw error;
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as Catalogue;
}

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export async function showState<T>(
  el: HTMLElement,
  promise: Promise<T>,
  render: (value: T) => string,
): Promise<void> {
  el.textContent = "Chargement…";
  try {
    el.textContent = render(await promise);
  } catch (error) {
    el.textContent = `Erreur : ${messageOf(error)}`;
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const delay = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Timeout")), ms);
  });
  return Promise.race([promise, delay]).finally(() => clearTimeout(timer));
}
